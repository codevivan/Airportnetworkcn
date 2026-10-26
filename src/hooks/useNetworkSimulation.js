import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ROUTERS,
  SWITCHES,
  END_DEVICES,
  NETWORKS,
  REDUNDANT_PATHS,
  PACKET_LOSS,
  INTERFACE_ERRORS,
  INITIAL_FAULT_LOG,
  OVERALL_SUMMARY,
} from '../data/networkData.js';
import {
  NETWORK_DEVICES,
  NETWORK_LINKS,
  findShortestPath,
  computeRoutingTables,
  computeOSPFNeighbors,
  getLinkBetween,
} from '../utils/networkGraph.js';

function pad(n) {
  return n.toString().padStart(2, '0');
}
function nowStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function useNetworkSimulation() {
  // Navigation tab: 'simulator' (Packet Tracer Simulator) | 'dashboard' (NOC Dashboard)
  const [activeTab, setActiveTab] = useState('simulator');

  // Set of failed link and LAN IDs
  const [failedLinks, setFailedLinks] = useState(new Set());
  const [recoveringLinks, setRecoveringLinks] = useState(new Set());
  const [userEvents, setUserEvents] = useState([]);
  const [simTimeSec, setSimTimeSec] = useState(4.806);
  const [tick, setTick] = useState(0);

  // Inspector selection (can be a device, link, packet, or event)
  const [selectedEntity, setSelectedEntity] = useState({
    type: 'router',
    id: 'Airport-Core-RTR',
  });

  // Selected event for inspection
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);

  // Simulation playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.5, 1, 2, 4
  const [mode, setMode] = useState('Simulation'); // 'Realtime' | 'Simulation'

  // Packet simulation state with smooth link traversal progress
  const [packetState, setPacketState] = useState({
    active: false,
    id: null,
    sourceId: 'Passenger-PC',
    destId: 'Operations-PC',
    protocol: 'ICMP',
    sizeBytes: 64,
    sourceIp: '192.168.10.10',
    destIp: '192.168.30.10',
    path: [],
    returnPath: [],
    stage: 'FORWARD', // 'FORWARD' (Request) | 'RETURN' (Reply)
    currentHopIndex: 0,
    fromNode: 'Passenger-PC',
    toNode: 'Passenger-SW',
    currentLink: null,
    animProgress: 0.0, // 0.0 to 1.0 along the active link
    status: 'IDLE', // IDLE, IN_TRANSIT, DELIVERED, DROPPED
    dropReason: null,
    errorMessage: null,
    startTime: null,
    history: [],
    pdu: null, // OSI layer breakdown
  });

  // Event list with event-sourced snapshots for step-back/forward time travel
  const [eventHistory, setEventHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Telemetry metrics tracking
  const [metrics, setMetrics] = useState({
    packetsSent: 0,
    packetsDelivered: 0,
    packetsFailed: 0,
  });

  // Professor Demo Mode State
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const timestamp = useMemo(() => {
    void tick;
    return new Date().toLocaleString();
  }, [tick]);

  const refreshTick = useCallback(() => setTick((t) => t + 1), []);

  // Helper to log event to both audit log and Packet Tracer event list
  const logEvent = useCallback((severity, category, device, message, protocol = 'SYSTEM', action = 'FORWARD') => {
    const ts = nowStamp();
    setSimTimeSec((s) => Number((s + 0.045).toFixed(3)));

    const newEvt = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ts,
      timeSec: Number((4.5 + Math.random() * 0.4).toFixed(3)),
      severity,
      category,
      source: device,
      device,
      protocol,
      action,
      status: severity === 'CRIT' ? 'Failed' : 'Success',
      message,
    };

    setUserEvents((prev) => [newEvt, ...prev]);
    return newEvt;
  }, []);

  // Link and LAN toggle handler
  const toggleLinkFailure = useCallback((linkId) => {
    const link = NETWORK_LINKS.find((l) => l.id === linkId);
    const linkLabel = link ? link.label : linkId;

    setFailedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(linkId)) {
        // Restore link
        next.delete(linkId);

        // Put in recovering state for 3.5 seconds
        setRecoveringLinks((rPrev) => {
          const rNext = new Set(rPrev);
          rNext.add(linkId);
          return rNext;
        });

        setTimeout(() => {
          setRecoveringLinks((rPrev) => {
            const rNext = new Set(rPrev);
            rNext.delete(linkId);
            return rNext;
          });
          logEvent('OK', 'RECOVERY', 'OSPF Area 0', `OSPF neighbor adjacency FULL restored on ${linkLabel}`, 'OSPF', 'RECOVER');
        }, 3500);

        logEvent('INFO', 'RECOVERY', linkLabel, `Link restored to UP/UP; OSPF entering EXCHANGE/LOADING state`, 'OSPF', 'RECOVER');
        logEvent('INFO', 'ROUTING', 'OSPF SPF', `Dijkstra SPF run triggered: routes restoring to primary paths`, 'OSPF', 'CONVERGE');
      } else {
        // Break link
        next.add(linkId);
        logEvent('CRIT', 'FAULT', linkLabel, `Link FAILURE detected: Interface changed state to DOWN`, 'FAULT', 'DOWN');
        logEvent('WARN', 'ROUTING', 'OSPF Area 0', `OSPF neighbor state change: FULL -> DOWN on ${linkLabel}`, 'OSPF', 'DOWN');
        logEvent('INFO', 'ROUTING', 'OSPF SPF', `Dijkstra SPF run triggered: routes recalculating around fault`, 'OSPF', 'CONVERGE');
      }
      return next;
    });

    setTick((t) => t + 1);
  }, [logEvent]);

  // Convenience failure actions
  const simulateCoreSecurityFailure = useCallback(() => {
    toggleLinkFailure('core-security');
  }, [toggleLinkFailure]);

  const simulateCorePassengerFailure = useCallback(() => {
    toggleLinkFailure('core-passenger');
  }, [toggleLinkFailure]);

  const simulatePassengerOpsFailure = useCallback(() => {
    toggleLinkFailure('passenger-ops');
  }, [toggleLinkFailure]);

  const simulateSecurityOpsFailure = useCallback(() => {
    toggleLinkFailure('security-ops');
  }, [toggleLinkFailure]);

  const simulateLANFailure = useCallback((lanId) => {
    toggleLinkFailure(lanId);
  }, [toggleLinkFailure]);

  const restoreAllLinks = useCallback(() => {
    if (failedLinks.size === 0) return;
    const currentFailed = new Set(failedLinks);
    setFailedLinks(new Set());
    setRecoveringLinks(currentFailed);

    logEvent('INFO', 'RECOVERY', 'Campus NOC', 'Restore all interfaces command issued', 'RECOVERY', 'RESTORE');
    logEvent('INFO', 'ROUTING', 'OSPF Area 0', 'Flooding LSAs: Adjacencies transitioning to 2-WAY/EXCHANGE/LOADING', 'OSPF', 'CONVERGE');

    setTimeout(() => {
      setRecoveringLinks(new Set());
      logEvent('OK', 'RECOVERY', 'OSPF Area 0', 'All OSPF neighbor adjacencies restored to FULL. Topology converged.', 'OSPF', 'FULL');
    }, 3500);

    setTick((t) => t + 1);
  }, [failedLinks, logEvent]);

  // Dynamic Routers computation
  const routers = useMemo(() => {
    return ROUTERS.map((r) => {
      const updatedInterfaces = r.interfaces.map((iface) => {
        const isDown = failedLinks.has(iface.linkId);
        return {
          ...iface,
          status: isDown ? 'DOWN' : 'UP',
          protocol: isDown ? 'DOWN' : 'UP',
        };
      });
      return {
        ...r,
        interfaces: updatedInterfaces,
      };
    });
  }, [failedLinks]);

  // Dynamic OSPF Neighbors
  const ospfNeighbors = useMemo(() => {
    return computeOSPFNeighbors(failedLinks, recoveringLinks);
  }, [failedLinks, recoveringLinks]);

  // Dynamic Routing Tables
  const routingTables = useMemo(() => {
    return computeRoutingTables(failedLinks);
  }, [failedLinks]);

  // Dynamic Redundant Paths for Operations Network
  const redundantPaths = useMemo(() => {
    const hasPathA = !failedLinks.has('core-passenger') && !failedLinks.has('passenger-ops');
    const hasPathB = !failedLinks.has('core-security') && !failedLinks.has('security-ops');

    return REDUNDANT_PATHS.map((p) => {
      if (p.id === 'PATH-A') {
        return {
          ...p,
          status: hasPathA ? (hasPathB ? 'ACTIVE (Primary)' : 'ACTIVE (Failover Route)') : 'DEGRADED / DOWN',
        };
      }
      if (p.id === 'PATH-B') {
        return {
          ...p,
          status: hasPathB ? (hasPathA ? 'STANDBY (ECMP Candidate)' : 'ACTIVE (Failover Route)') : 'DEGRADED / DOWN',
        };
      }
      return p;
    });
  }, [failedLinks]);

  // Departmental Networks
  const networks = useMemo(() => {
    return NETWORKS.map((n) => {
      let isReachable = true;
      let note = null;

      if (n.id === 'operations') {
        const path = findShortestPath('Airport-Core-RTR', 'Operations-RTR', failedLinks);
        if (!path || failedLinks.has('ops-lan')) {
          isReachable = false;
          note = 'UNREACHABLE: No path through Area 0';
        } else if (failedLinks.has('core-passenger') || failedLinks.has('passenger-ops')) {
          note = 'Rerouted via Security-RTR';
        } else if (failedLinks.has('core-security') || failedLinks.has('security-ops')) {
          note = 'Rerouted via Passenger-RTR';
        }
      } else if (n.id === 'passenger') {
        const path = findShortestPath('Airport-Core-RTR', 'Passenger-RTR', failedLinks);
        if (!path || failedLinks.has('passenger-lan')) {
          isReachable = false;
          note = 'ISOLATED';
        } else if (failedLinks.has('core-passenger')) {
          note = 'Rerouted via Security & Ops';
        }
      } else if (n.id === 'security') {
        const path = findShortestPath('Airport-Core-RTR', 'Security-RTR', failedLinks);
        if (!path || failedLinks.has('security-lan')) {
          isReachable = false;
          note = 'ISOLATED';
        } else if (failedLinks.has('core-security')) {
          note = 'Rerouted via Passenger & Ops';
        }
      } else if (n.id === 'administration') {
        if (failedLinks.has('admin-lan')) {
          isReachable = false;
          note = 'Admin LAN DOWN';
        }
      }

      return {
        ...n,
        status: isReachable ? 'OK' : 'CRIT',
        note,
      };
    });
  }, [failedLinks]);

  // Packet Loss calculation
  const packetLoss = useMemo(() => {
    const faultCount = failedLinks.size;
    if (faultCount === 0) return PACKET_LOSS;

    const isCoreSec = failedLinks.has('core-security');
    const isCorePass = failedLinks.has('core-passenger');

    let overall = 0.2;
    if (faultCount >= 2) overall = 14.5;
    else if (faultCount === 1) overall = 0.4;

    const r0Val = isCoreSec || isCorePass ? 0.6 : 0;
    const r1Val = isCorePass ? 0.5 : 0.1;
    const r2Val = isCoreSec ? 0.7 : 0.1;
    const r3Val = faultCount > 0 ? 0.4 : 0;

    return {
      overall,
      perRouter: {
        R0: r0Val,
        R1: r1Val,
        R2: r2Val,
        R3: r3Val,
        'Airport-Core-RTR': r0Val,
        'Passenger-RTR': r1Val,
        'Security-RTR': r2Val,
        'Operations-RTR': r3Val,
      },
      perNetwork: {
        passenger: isCorePass ? 0.8 : 0,
        security: isCoreSec ? 1.1 : 0,
        operations: faultCount > 0 ? 0.5 : 0,
        administration: 0,
      },
    };
  }, [failedLinks]);

  // Interface Errors
  const interfaceErrors = useMemo(() => {
    if (failedLinks.size === 0) return INTERFACE_ERRORS;
    return {
      'Airport-Core-RTR': {
        input: failedLinks.has('core-passenger') ? 14 : failedLinks.has('core-security') ? 18 : 2,
        output: 6,
        crc: 3,
        collisions: 0,
      },
      'Passenger-RTR': {
        input: failedLinks.has('core-passenger') ? 11 : 1,
        output: 3,
        crc: failedLinks.has('core-passenger') ? 2 : 0,
        collisions: 0,
      },
      'Security-RTR': {
        input: failedLinks.has('core-security') ? 15 : 1,
        output: 4,
        crc: failedLinks.has('core-security') ? 3 : 0,
        collisions: 0,
      },
      'Operations-RTR': {
        input: 4,
        output: 2,
        crc: 1,
        collisions: 0,
      },
    };
  }, [failedLinks]);

  // Overall Health Score
  const healthScore = useMemo(() => {
    let score = 100;
    if (failedLinks.has('core-security')) score -= 15;
    if (failedLinks.has('core-passenger')) score -= 15;
    if (failedLinks.has('passenger-ops')) score -= 15;
    if (failedLinks.has('security-ops')) score -= 15;
    if (failedLinks.has('passenger-lan')) score -= 10;
    if (failedLinks.has('security-lan')) score -= 10;
    if (failedLinks.has('ops-lan')) score -= 10;
    if (failedLinks.has('admin-lan')) score -= 10;
    if (failedLinks.has('dns-server-link') || failedLinks.has('admin-dns-link')) score -= 10;
    if (recoveringLinks.size > 0) score -= 5;
    return Math.max(10, score);
  }, [failedLinks, recoveringLinks]);

  const overallSummary = useMemo(() => {
    const faultCount = failedLinks.size;
    let opsStatus = 'OK';
    if (faultCount > 0) {
      const opsPath = findShortestPath('Airport-Core-RTR', 'Operations-RTR', failedLinks);
      opsStatus = opsPath ? 'FAILOVER' : 'DOWN';
    }
    const fullAdjacencies = ospfNeighbors.filter((n) => n.state.startsWith('FULL')).length;

    return {
      ...OVERALL_SUMMARY,
      healthScore,
      opsStatus,
      routersUp: ROUTERS.length,
      switchesUp: SWITCHES.length,
      ospfAdjacencies: `${fullAdjacencies}/8`,
      activeFaults: faultCount,
      activeRedundantPaths: failedLinks.size > 0 ? 1 : 2,
    };
  }, [failedLinks, healthScore, ospfNeighbors]);

  // Construct PDU breakdown for packet inspector
  const buildPDUDetails = useCallback((pkt, nodeName, nextNodeName) => {
    const currentDevice = NETWORK_DEVICES[nodeName] || {};
    const nextDevice = nextNodeName ? NETWORK_DEVICES[nextNodeName] || {} : {};

    const inPort = currentDevice.interfaces ? currentDevice.interfaces[0]?.name : 'FastEthernet0';
    const outPort = currentDevice.interfaces && currentDevice.interfaces[1] ? currentDevice.interfaces[1]?.name : 'FastEthernet0/1';

    return {
      layer7: {
        name: 'Application Layer',
        protocol: pkt.protocol,
        info:
          pkt.protocol === 'DNS'
            ? 'DNS Standard Query: A airport.local'
            : pkt.protocol === 'HTTP'
            ? 'HTTP GET /index.html HTTP/1.1'
            : pkt.protocol === 'ICMP'
            ? pkt.stage === 'RETURN'
              ? 'ICMP Type 0 (Echo Reply)'
              : 'ICMP Type 8 (Echo Request), Code 0, Seq=1'
            : pkt.protocol === 'ARP'
            ? 'ARP Who has 192.168.10.1? Tell 192.168.10.10'
            : pkt.protocol === 'TCP'
            ? 'TCP Flags [SYN] Seq=0 Win=65535 MSS=1460'
            : 'OSPF Hello Packet, Area 0.0.0.0, Priority 1',
      },
      layer4: {
        name: 'Transport Layer',
        info:
          pkt.protocol === 'DNS'
            ? 'UDP SrcPort=53124 DstPort=53 Length=42'
            : pkt.protocol === 'HTTP' || pkt.protocol === 'TCP'
            ? 'TCP SrcPort=49152 DstPort=80 Seq=1001 Ack=0'
            : 'ICMP Protocol (IP Protocol 1)',
      },
      layer3: {
        name: 'Network Layer',
        sourceIp: pkt.stage === 'RETURN' ? pkt.destIp : pkt.sourceIp,
        destIp: pkt.stage === 'RETURN' ? pkt.sourceIp : pkt.destIp,
        ttl: 128 - (pkt.currentHopIndex || 0),
        protocolId: pkt.protocol === 'ICMP' ? 1 : pkt.protocol === 'TCP' ? 6 : pkt.protocol === 'UDP' ? 17 : 89,
      },
      layer2: {
        name: 'Data Link Layer (Ethernet II)',
        sourceMac: currentDevice.mac || '000C.29F1.A110',
        destMac: nextDevice.mac || '0001.42A1.0001',
        etherType: '0x0800 (IPv4)',
      },
      layer1: {
        name: 'Physical Layer',
        inPort,
        outPort,
        media: 'Copper / 1000Base-TX Full Duplex',
      },
    };
  }, []);

  // Advance to next hop in the simulation
  const advanceHop = useCallback(() => {
    setPacketState((currentPkt) => {
      if (!currentPkt.active || currentPkt.status === 'DELIVERED' || currentPkt.status === 'DROPPED') {
        return currentPkt;
      }

      const isForward = currentPkt.stage === 'FORWARD';
      const activePath = isForward ? currentPkt.path : currentPkt.returnPath;
      const nextHopIndex = currentPkt.currentHopIndex + 1;
      const arrivedNode = currentPkt.toNode;
      const upcomingNode = activePath[nextHopIndex + 1];

      // Check if the link just traversed was broken while in transit
      const traversedLink = currentPkt.currentLink || getLinkBetween(currentPkt.fromNode, arrivedNode);
      const isTraversedBroken = traversedLink && (failedLinks.has(traversedLink.id) || (traversedLink.lanId && failedLinks.has(traversedLink.lanId)));

      if (isTraversedBroken) {
        const dropReason = `Link ${traversedLink?.label || 'Segment'} is DOWN. Packet dropped!`;
        logEvent('CRIT', 'PACKET', arrivedNode, `Packet ${currentPkt.id} DROPPED at ${arrivedNode} — link is DOWN`, currentPkt.protocol, 'DROP');
        setMetrics((m) => ({ ...m, packetsFailed: m.packetsFailed + 1 }));
        setIsPlaying(false);

        const dropPdu = buildPDUDetails(currentPkt, arrivedNode, null);
        const dropSnapshot = {
          ...currentPkt,
          status: 'DROPPED',
          dropReason,
          errorMessage: dropReason,
          animProgress: 1.0,
          pdu: dropPdu,
          history: [
            ...currentPkt.history,
            { node: arrivedNode, action: 'DROPPED', reason: dropReason, time: nowStamp() },
          ],
        };

        setEventHistory((h) => [...h, dropSnapshot]);
        setCurrentHistoryIndex((idx) => idx + 1);
        return dropSnapshot;
      }

      // Check if we arrived at the destination of this leg
      if (nextHopIndex >= activePath.length - 1) {
        if (currentPkt.protocol === 'ICMP' && isForward && currentPkt.returnPath && currentPkt.returnPath.length > 1) {
          // Reached destination in forward leg -> Switch to RETURN leg (Echo Reply)
          logEvent('OK', 'PACKET', arrivedNode, `Echo Request reached ${arrivedNode}. Generating Echo Reply back to ${currentPkt.sourceId}`, 'ICMP', 'REPLY');

          const replyFrom = currentPkt.returnPath[0];
          const replyTo = currentPkt.returnPath[1];
          const replyLink = getLinkBetween(replyFrom, replyTo);
          const replyPdu = buildPDUDetails(currentPkt, arrivedNode, replyTo);

          const replySnapshot = {
            ...currentPkt,
            stage: 'RETURN',
            currentHopIndex: 0,
            fromNode: replyFrom,
            toNode: replyTo,
            currentLink: replyLink,
            animProgress: 0.0,
            pdu: replyPdu,
            history: [
              ...currentPkt.history,
              { node: arrivedNode, action: 'ECHO_REPLY_GENERATED', time: nowStamp() },
            ],
          };

          setEventHistory((h) => [...h, replySnapshot]);
          setCurrentHistoryIndex((idx) => idx + 1);
          return replySnapshot;
        }

        // Final delivery
        logEvent('OK', 'PACKET', arrivedNode, `Packet ${currentPkt.id} successfully DELIVERED to destination ${arrivedNode}`, currentPkt.protocol, 'DELIVER');
        setMetrics((m) => ({ ...m, packetsDelivered: m.packetsDelivered + 1 }));
        setIsPlaying(false);

        const finalPdu = buildPDUDetails(currentPkt, arrivedNode, null);
        const finalSnapshot = {
          ...currentPkt,
          currentHopIndex: nextHopIndex,
          fromNode: arrivedNode,
          toNode: arrivedNode,
          status: 'DELIVERED',
          animProgress: 1.0,
          pdu: finalPdu,
          history: [
            ...currentPkt.history,
            { node: arrivedNode, action: 'DELIVERED', time: nowStamp() },
          ],
        };

        setEventHistory((h) => [...h, finalSnapshot]);
        setCurrentHistoryIndex((idx) => idx + 1);
        return finalSnapshot;
      }

      // Intermediate hop forwarding
      logEvent('INFO', 'PACKET', arrivedNode, `Packet ${currentPkt.id} forwarded through ${arrivedNode} toward ${upcomingNode}`, currentPkt.protocol, 'FORWARD');

      const nextLink = getLinkBetween(arrivedNode, upcomingNode);
      const hopPdu = buildPDUDetails(currentPkt, arrivedNode, upcomingNode);

      const hopSnapshot = {
        ...currentPkt,
        currentHopIndex: nextHopIndex,
        fromNode: arrivedNode,
        toNode: upcomingNode,
        currentLink: nextLink,
        animProgress: 0.0,
        pdu: hopPdu,
        history: [
          ...currentPkt.history,
          { node: arrivedNode, action: 'FORWARDED', time: nowStamp() },
        ],
      };

      setEventHistory((h) => [...h, hopSnapshot]);
      setCurrentHistoryIndex((idx) => idx + 1);
      return hopSnapshot;
    });
  }, [buildPDUDetails, failedLinks, logEvent]);

  // Continuous animation loop using requestAnimationFrame
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  useEffect(() => {
    if (!isPlaying || !packetState.active || packetState.status !== 'IN_TRANSIT') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const durationPerHop = Math.max(180, Math.round(1100 / playbackSpeed));

    const tickAnim = (now) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      setPacketState((prev) => {
        if (!prev.active || prev.status !== 'IN_TRANSIT') return prev;

        const nextProgress = (prev.animProgress || 0) + dt / durationPerHop;
        if (nextProgress < 1.0) {
          return {
            ...prev,
            animProgress: nextProgress,
          };
        }

        // When reaching 1.0, cap at 1.0; advanceHop will trigger on next tick
        return {
          ...prev,
          animProgress: 1.0,
        };
      });

      animFrameRef.current = requestAnimationFrame(tickAnim);
    };

    animFrameRef.current = requestAnimationFrame(tickAnim);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
    };
  }, [isPlaying, packetState.active, packetState.status, playbackSpeed]);

  // Trigger hop completion when animProgress reaches 1.0
  useEffect(() => {
    if (isPlaying && packetState.active && packetState.status === 'IN_TRANSIT' && packetState.animProgress >= 1.0) {
      advanceHop();
    }
  }, [isPlaying, packetState.active, packetState.status, packetState.animProgress, advanceHop]);

  // Send Packet with full multi-protocol resolution and Dijkstra routing
  const sendPacket = useCallback((srcId, dstId, proto = 'ICMP', sizeBytes = 64) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    lastTimeRef.current = null;

    const source = srcId || 'Passenger-PC';
    const dest = dstId || 'Operations-PC';
    const protocol = proto || 'ICMP';
    const pktId = `PKT-${Math.floor(1000 + Math.random() * 9000)}`;

    let targetDevId = dest;
    let isDnsQuery = false;
    if (dest === 'airport.local' || dest === 'DNS-Server') {
      targetDevId = 'DNS-Server';
      isDnsQuery = true;
    }

    const srcDev = NETWORK_DEVICES[source];
    const dstDev = NETWORK_DEVICES[targetDevId];
    const sourceIp = srcDev?.ip || srcDev?.interfaces?.[0]?.ip?.split('/')[0] || '192.168.10.10';
    const destIp = dstDev?.ip || dstDev?.interfaces?.[0]?.ip?.split('/')[0] || '192.168.30.10';

    console.log(`[SIMULATOR] Starting ${protocol} packet from ${source} (${sourceIp}) to ${targetDevId} (${destIp})`);

    // Check if DNS server is broken when trying to query domain
    if (isDnsQuery && (failedLinks.has('dns-server-link') || failedLinks.has('admin-dns-link') || failedLinks.has('admin-lan'))) {
      const dropReason = 'DNS Server at 192.168.40.20 is unreachable. Name resolution timed out.';
      logEvent('CRIT', 'PACKET', source, `DNS Query failed: DNS Server 192.168.40.20 is unreachable (Server Link Down)`, 'DNS', 'DROP');
      setMetrics((m) => ({ ...m, packetsFailed: m.packetsFailed + 1 }));

      const dropSnapshot = {
        active: true,
        id: pktId,
        sourceId: source,
        destId: dest,
        protocol: 'DNS',
        sizeBytes: 42,
        sourceIp,
        destIp: '192.168.40.20',
        path: [source],
        returnPath: [],
        currentHopIndex: 0,
        fromNode: source,
        toNode: source,
        currentLink: null,
        animProgress: 1.0,
        status: 'DROPPED',
        stage: 'FORWARD',
        dropReason,
        errorMessage: dropReason,
        startTime: nowStamp(),
        history: [{ node: source, action: 'DNS_TIMEOUT', reason: dropReason, time: nowStamp() }],
        pdu: null,
      };

      setPacketState(dropSnapshot);
      setEventHistory([dropSnapshot]);
      setCurrentHistoryIndex(0);
      setSelectedEventIndex(0);
      setIsPlaying(false);
      return;
    }

    // Compute route using Dijkstra on current operational graph
    const computedForwardPath = findShortestPath(source, targetDevId, failedLinks);
    const computedReturnPath = computedForwardPath ? [...computedForwardPath].reverse() : [];

    setMetrics((m) => ({ ...m, packetsSent: m.packetsSent + 1 }));

    if (isDnsQuery) {
      logEvent('INFO', 'PACKET', source, `DNS Query (UDP 53): Resolving 'airport.local' via 192.168.40.20`, 'DNS', 'QUERY');
      logEvent('OK', 'PACKET', 'DNS-Server', `DNS Response: 'airport.local' resolved to 192.168.40.20`, 'DNS', 'RESOLVE');
    }

    if (!computedForwardPath || computedForwardPath.length < 2) {
      const dropReason = `No valid route found in OSPF Area 0 topology to ${dest}. Link or gateway down.`;
      logEvent('CRIT', 'PACKET', source, `Routing failure: Destination ${dest} is unreachable from ${source}`, protocol, 'DROP');
      setMetrics((m) => ({ ...m, packetsFailed: m.packetsFailed + 1 }));

      const droppedPkt = {
        active: true,
        id: pktId,
        sourceId: source,
        destId: dest,
        protocol,
        sizeBytes: sizeBytes || 64,
        sourceIp,
        destIp,
        path: [source],
        returnPath: [],
        currentHopIndex: 0,
        fromNode: source,
        toNode: source,
        currentLink: null,
        animProgress: 1.0,
        status: 'DROPPED',
        stage: 'FORWARD',
        dropReason,
        errorMessage: dropReason,
        startTime: nowStamp(),
        history: [{ node: source, action: 'UNREACHABLE', reason: dropReason, time: nowStamp() }],
        pdu: null,
      };

      setPacketState(droppedPkt);
      setEventHistory([droppedPkt]);
      setCurrentHistoryIndex(0);
      setSelectedEventIndex(0);
      setIsPlaying(false);
      return;
    }

    // Valid path found!
    const firstHopFrom = computedForwardPath[0];
    const firstHopTo = computedForwardPath[1];
    const initialLink = getLinkBetween(firstHopFrom, firstHopTo);

    logEvent('INFO', 'PACKET', source, `PDU ${pktId} (${protocol}) created at ${source} -> Destination: ${dest} via ${initialLink?.label || 'Link'}`, protocol, 'START');

    const initialPdu = buildPDUDetails(
      { protocol, sourceId: source, destId: dest, sourceIp, destIp, currentHopIndex: 0, stage: 'FORWARD' },
      firstHopFrom,
      firstHopTo
    );

    const initialPkt = {
      active: true,
      id: pktId,
      sourceId: source,
      destId: dest,
      protocol,
      sizeBytes: sizeBytes || 64,
      sourceIp,
      destIp,
      path: computedForwardPath,
      returnPath: computedReturnPath,
      currentHopIndex: 0,
      fromNode: firstHopFrom,
      toNode: firstHopTo,
      currentLink: initialLink,
      animProgress: 0.0,
      status: 'IN_TRANSIT',
      stage: 'FORWARD',
      dropReason: null,
      errorMessage: null,
      startTime: nowStamp(),
      history: [{ node: source, action: 'CREATED', time: nowStamp() }],
      pdu: initialPdu,
    };

    setPacketState(initialPkt);
    setEventHistory([initialPkt]);
    setCurrentHistoryIndex(0);
    setSelectedEventIndex(0);
    setIsPlaying(true);
  }, [buildPDUDetails, failedLinks, logEvent]);

  // Simulation Controls
  const pausePacket = useCallback(() => {
    setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    lastTimeRef.current = null;
  }, []);

  const resumePacket = useCallback(() => {
    if (packetState.active && packetState.status === 'IN_TRANSIT') {
      setIsPlaying(true);
    } else {
      // If idle, start default ICMP ping between Passenger and Operations!
      sendPacket('Passenger-PC', 'Operations-PC', 'ICMP');
    }
  }, [packetState.active, packetState.status, sendPacket]);

  const stepPacketSimulation = useCallback(() => {
    setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    lastTimeRef.current = null;

    if (!packetState.active || packetState.status === 'IDLE') {
      sendPacket('Passenger-PC', 'Operations-PC', 'ICMP');
      return;
    }
    if (packetState.status === 'IN_TRANSIT') {
      advanceHop();
    }
  }, [advanceHop, packetState.active, packetState.status, sendPacket]);

  const stepBackSimulation = useCallback(() => {
    setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    lastTimeRef.current = null;

    if (currentHistoryIndex > 0) {
      const prevIdx = currentHistoryIndex - 1;
      const prevSnapshot = eventHistory[prevIdx];
      if (prevSnapshot) {
        setPacketState(prevSnapshot);
        setCurrentHistoryIndex(prevIdx);
        setSelectedEventIndex(prevIdx);
      }
    }
  }, [currentHistoryIndex, eventHistory]);

  const resetPacket = useCallback(() => {
    setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    lastTimeRef.current = null;

    setPacketState({
      active: false,
      id: null,
      sourceId: 'Passenger-PC',
      destId: 'Operations-PC',
      protocol: 'ICMP',
      sizeBytes: 64,
      sourceIp: '192.168.10.10',
      destIp: '192.168.30.10',
      path: [],
      returnPath: [],
      currentHopIndex: 0,
      fromNode: 'Passenger-PC',
      toNode: 'Passenger-SW',
      currentLink: null,
      animProgress: 0.0,
      status: 'IDLE',
      stage: 'FORWARD',
      dropReason: null,
      errorMessage: null,
      startTime: null,
      history: [],
      pdu: null,
    });
    setEventHistory([]);
    setCurrentHistoryIndex(-1);
    setSelectedEventIndex(null);
  }, []);

  const resetNetwork = useCallback(() => {
    resetPacket();
    setFailedLinks(new Set());
    setRecoveringLinks(new Set());
    setDemoMode(false);
    setDemoStep(0);
    logEvent('INFO', 'RECOVERY', 'System', 'Network simulation reset to baseline initial state', 'SYSTEM', 'RESET');
    setTick((t) => t + 1);
  }, [logEvent, resetPacket]);

  const clearEvents = useCallback(() => {
    setUserEvents([]);
    setEventHistory([]);
    setCurrentHistoryIndex(-1);
    setSelectedEventIndex(null);
  }, []);

  // 11 Educational Demo Scenarios
  const SCENARIOS = [
    {
      id: 'sc1',
      title: '1. Successful Passenger-PC to Operations-PC Ping',
      desc: 'Demonstrates end-to-end ICMP Echo Request & Reply across OSPF Area 0 backbone with zero loss.',
      run: () => {
        resetNetwork();
        setTimeout(() => sendPacket('Passenger-PC', 'Operations-PC', 'ICMP'), 200);
      },
    },
    {
      id: 'sc2',
      title: '2. Passenger-PC to Security-PC Ping',
      desc: 'Inter-terminal communication through Passenger-RTR, Core-RTR, and Security-RTR.',
      run: () => {
        resetNetwork();
        setTimeout(() => sendPacket('Passenger-PC', 'Security-PC', 'ICMP'), 200);
      },
    },
    {
      id: 'sc3',
      title: '3. DNS Lookup for airport.local',
      desc: 'Passenger-PC queries authoritative DNS server (192.168.40.20) for airport.local resolution.',
      run: () => {
        resetNetwork();
        setTimeout(() => sendPacket('Passenger-PC', 'airport.local', 'DNS'), 200);
      },
    },
    {
      id: 'sc4',
      title: '4. HTTP Request to Simulated Airport Service',
      desc: 'Models TCP SYN-ACK connection handshake followed by HTTP GET to campus portal.',
      run: () => {
        resetNetwork();
        setTimeout(() => sendPacket('Passenger-PC', 'Admin-PC', 'HTTP'), 200);
      },
    },
    {
      id: 'sc5',
      title: '5. Core–Security Link Failure Injection',
      desc: 'Simulates physical fiber failure on 10.0.0.4/30. Adjacency drops to DOWN; OSPF triggers SPF.',
      run: () => {
        simulateCoreSecurityFailure();
      },
    },
    {
      id: 'sc6',
      title: '6. Traffic Rerouting via Alternative OSPF Route',
      desc: 'With Core–Security broken, sends packet from Passenger-PC to Security-PC via Operations-RTR detour.',
      run: () => {
        if (!failedLinks.has('core-security')) simulateCoreSecurityFailure();
        setTimeout(() => sendPacket('Passenger-PC', 'Security-PC', 'ICMP'), 300);
      },
    },
    {
      id: 'sc7',
      title: '7. Multiple Link Failures (Area 0 Partition)',
      desc: 'Injects faults on both Core–Security and Core–Passenger links to isolate Core from lower routers.',
      run: () => {
        if (!failedLinks.has('core-security')) toggleLinkFailure('core-security');
        if (!failedLinks.has('core-passenger')) toggleLinkFailure('core-passenger');
        setTimeout(() => sendPacket('Admin-PC', 'Operations-PC', 'ICMP'), 400);
      },
    },
    {
      id: 'sc8',
      title: '8. Flight Operations LAN Failure',
      desc: 'Simulates outage on Operations access segment (192.168.30.0/24), demonstrating host isolation.',
      run: () => {
        toggleLinkFailure('ops-lan');
        setTimeout(() => sendPacket('Passenger-PC', 'Operations-PC', 'ICMP'), 300);
      },
    },
    {
      id: 'sc9',
      title: '9. Authoritative DNS Server Failure',
      desc: 'Cuts link to DNS-Server (192.168.40.20). Domain resolution requests for airport.local fail immediately.',
      run: () => {
        toggleLinkFailure('dns-server-link');
        setTimeout(() => sendPacket('Passenger-PC', 'airport.local', 'DNS'), 300);
      },
    },
    {
      id: 'sc10',
      title: '10. Network Recovery & Adjacency Restoration',
      desc: 'Restores all failed links. OSPF neighbor state machine transitions to FULL and routes revert.',
      run: () => {
        restoreAllLinks();
      },
    },
    {
      id: 'sc11',
      title: '11. Traceroute Across Campus Backbone',
      desc: 'Traces progressive TTL hops from Passenger-PC to Flight Operations Workstation.',
      run: () => {
        resetNetwork();
        setTimeout(() => sendPacket('Passenger-PC', 'Operations-PC', 'ICMP'), 200);
      },
    },
  ];

  // Professor Demo Mode Guided Steps
  const DEMO_STEPS = [
    {
      step: 1,
      title: 'Campus Network Baseline Verification',
      script: 'Good morning/afternoon, Professor. Here is our Airport Network Simulation in Cisco Packet Tracer mode. All 4 routers (Airport-Core-RTR, Passenger-RTR, Security-RTR, Operations-RTR) form an OSPF Area 0 diamond with 10.0.0.0/30 point-to-point links and 4 departmental LANs. All links are UP and adjacencies are FULL.',
      actionLabel: 'Verify Baseline State',
      action: () => resetNetwork(),
    },
    {
      step: 2,
      title: 'Packet Transmission: Passenger to Operations',
      script: 'Now let us observe an ICMP packet travelling from Passenger-PC (192.168.10.10) to Operations-PC (192.168.30.10). Notice the PDU envelope advancing hop-by-hop across Passenger-SW, Passenger-RTR, and Operations-RTR.',
      actionLabel: 'Send Ping (Passenger → Ops)',
      action: () => sendPacket('Passenger-PC', 'Operations-PC', 'ICMP'),
    },
    {
      step: 3,
      title: 'Inspect PDU Details & Echo Reply',
      script: 'As the Echo Request reaches Operations-PC, an Echo Reply is generated and transmitted back to the source. The PDU inspector displays the full Layer 1 through Layer 7 breakdown.',
      actionLabel: 'Inspect PDU Breakdown',
      action: () => setSelectedEntity({ type: 'packet', id: packetState.id || 'PKT-1001' }),
    },
    {
      step: 4,
      title: 'OSPF Equal-Cost Multi-Path (ECMP)',
      script: 'Airport-Core-RTR maintains two equal-cost paths to the Operations subnet (192.168.30.0/24): one via Passenger-RTR and one via Security-RTR, both with metric 20.',
      actionLabel: 'Inspect OSPF Route Table',
      action: () => setSelectedEntity({ type: 'router', id: 'Airport-Core-RTR' }),
    },
    {
      step: 5,
      title: 'Fault Injection: Core–Security Link Down',
      script: 'We now simulate a physical fiber cut between Airport-Core-RTR and Security-RTR (10.0.0.4/30). Notice how the interface LEDs turn red and the link state changes to DOWN.',
      actionLabel: 'Simulate Core–Security Cut',
      action: () => simulateCoreSecurityFailure(),
    },
    {
      step: 6,
      title: 'OSPF Neighbor Adjacency Drops to DOWN',
      script: 'The OSPF adjacency between Airport-Core-RTR and Security-RTR drops from FULL to DOWN. A critical fault event is appended to the Packet Tracer event list and Dijkstra SPF recalculation is triggered.',
      actionLabel: 'Check Event List',
      action: () => setSelectedEntity({ type: 'link', id: 'core-security' }),
    },
    {
      step: 7,
      title: 'Dynamic SPF Recalculation & Alternative Route',
      script: 'Dijkstra recalculates reachability. Traffic intended for Security-RTR or Operations-RTR now dynamically detours via Passenger-RTR around the severed link.',
      actionLabel: 'Verify Routing Convergence',
      action: () => setSelectedEntity({ type: 'router', id: 'Passenger-RTR' }),
    },
    {
      step: 8,
      title: 'Verify Rerouted Packet Delivery',
      script: 'Let us send a packet from Passenger-PC to Security-PC. The packet automatically routes through Operations-RTR into Security-RTR, maintaining connectivity with zero packet loss.',
      actionLabel: 'Send Rerouted Packet',
      action: () => sendPacket('Passenger-PC', 'Security-PC', 'ICMP'),
    },
    {
      step: 9,
      title: 'Link Restoration & Adjacency Recovery',
      script: 'We restore the Core–Security link. The interface lights turn green, and OSPF executes the adjacency recovery cycle: 2-WAY -> EXCHANGE -> LOADING -> FULL.',
      actionLabel: 'Restore Core–Security Link',
      action: () => restoreAllLinks(),
    },
    {
      step: 10,
      title: 'Full Recovery & Summary',
      script: 'The campus network is 100% healthy again. All 8 OSPF neighbor adjacencies are restored, the health score is 100/100, and redundant paths are back in standby/active equilibrium.',
      actionLabel: 'Verify Network Recovery',
      action: () => setSelectedEntity({ type: 'router', id: 'Airport-Core-RTR' }),
    },
  ];

  const nextDemoStep = useCallback(() => {
    setDemoStep((s) => {
      const next = Math.min(DEMO_STEPS.length - 1, s + 1);
      DEMO_STEPS[next].action();
      return next;
    });
  }, [DEMO_STEPS]);

  const prevDemoStep = useCallback(() => {
    setDemoStep((s) => {
      const prev = Math.max(0, s - 1);
      DEMO_STEPS[prev].action();
      return prev;
    });
  }, [DEMO_STEPS]);

  const executeDemoStep = useCallback((stepIdx) => {
    setDemoStep(stepIdx);
    DEMO_STEPS[stepIdx].action();
  }, [DEMO_STEPS]);

  const r0r2Failed = failedLinks.has('core-security');

  return {
    activeTab,
    setActiveTab,
    timestamp,
    simTimeSec,
    routers,
    switches: SWITCHES,
    endDevices: END_DEVICES,
    networks,
    ospfNeighbors,
    routingTables,
    redundantPaths,
    packetLoss,
    interfaceErrors,
    faultLog: [...userEvents, ...INITIAL_FAULT_LOG],
    overallSummary,
    healthScore,

    // Fault Injection States & Methods
    failedLinks,
    recoveringLinks,
    toggleLinkFailure,
    simulateCoreSecurityFailure,
    simulateCorePassengerFailure,
    simulatePassengerOpsFailure,
    simulateSecurityOpsFailure,
    simulateLANFailure,
    restoreAllLinks,
    resetNetwork,

    // Backward compatibility
    r0r2Failed,
    toggleR0R2Failure: simulateCoreSecurityFailure,
    refreshTick,

    // Packet simulation
    packetState,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    mode,
    setMode,
    sendPacket,
    pausePacket,
    resumePacket,
    stepPacketSimulation,
    stepBackSimulation,
    resetPacket,
    clearEvents,
    metrics,
    eventHistory,
    currentHistoryIndex,

    // Inspector
    selectedEntity,
    setSelectedEntity,
    selectedEventIndex,
    setSelectedEventIndex,

    // Scenarios & Demo Mode
    scenarios: SCENARIOS,
    demoMode,
    setDemoMode,
    demoStep,
    demoSteps: DEMO_STEPS,
    nextDemoStep,
    prevDemoStep,
    executeDemoStep,
  };
}
