/**
 * Comprehensive Network Graph & Protocol Simulation Engine
 * Models Cisco Packet Tracer Airport Topology with OSPF Area 0,
 * Multi-Protocol Packet Engine (ICMP, ARP, DNS, TCP, HTTP, OSPF),
 * Interface States, and Simulated Cisco IOS CLI Execution.
 */

export const ROUTER_IDS = {
  'Airport-Core-RTR': '1.1.1.1',
  'Passenger-RTR': '2.2.2.2',
  'Security-RTR': '3.3.3.3',
  'Operations-RTR': '4.4.4.4',
};

// All devices in the campus topology
export const NETWORK_DEVICES = {
  'Airport-Core-RTR': {
    id: 'Airport-Core-RTR',
    shortId: 'R0',
    name: 'Airport-Core-RTR',
    hostname: 'Airport-Core-RTR',
    role: 'Backbone Core Router',
    type: 'router',
    routerId: '1.1.1.1',
    area: 'Area 0',
    mac: '0001.42A1.0000',
    interfaces: [
      { name: 'Gig0/0', ip: '10.0.0.1/30', to: 'Passenger-RTR (Gig0/0)', linkId: 'core-passenger', mac: '0001.42A1.0001', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
      { name: 'Gig0/1', ip: '10.0.0.5/30', to: 'Security-RTR (Gig0/0)', linkId: 'core-security', mac: '0001.42A1.0002', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
      { name: 'Gig0/2', ip: '192.168.40.1/24', to: 'Admin-SW (Fa0/24)', linkId: 'core-admin-sw', mac: '0001.42A1.0003', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
    ],
    networks: ['10.0.0.0/30', '10.0.0.4/30', '192.168.40.0/24'],
  },
  'Passenger-RTR': {
    id: 'Passenger-RTR',
    shortId: 'R1',
    name: 'Passenger-RTR',
    hostname: 'Passenger-RTR',
    role: 'Passenger Terminal Gateway',
    type: 'router',
    routerId: '2.2.2.2',
    area: 'Area 0',
    mac: '0002.42A2.0000',
    interfaces: [
      { name: 'Gig0/0', ip: '10.0.0.2/30', to: 'Airport-Core-RTR (Gig0/0)', linkId: 'core-passenger', mac: '0002.42A2.0001', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
      { name: 'Gig0/1', ip: '10.0.0.9/30', to: 'Operations-RTR (Gig0/0)', linkId: 'passenger-ops', mac: '0002.42A2.0002', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
      { name: 'Gig0/2', ip: '192.168.10.1/24', to: 'Passenger-SW (Fa0/24)', linkId: 'passenger-sw-link', mac: '0002.42A2.0003', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
    ],
    networks: ['10.0.0.0/30', '10.0.0.8/30', '192.168.10.0/24'],
  },
  'Security-RTR': {
    id: 'Security-RTR',
    shortId: 'R2',
    name: 'Security-RTR',
    hostname: 'Security-RTR',
    role: 'Security & Surveillance Gateway',
    type: 'router',
    routerId: '3.3.3.3',
    area: 'Area 0',
    mac: '0003.42A3.0000',
    interfaces: [
      { name: 'Gig0/0', ip: '10.0.0.6/30', to: 'Airport-Core-RTR (Gig0/1)', linkId: 'core-security', mac: '0003.42A3.0001', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
      { name: 'Gig0/1', ip: '10.0.0.13/30', to: 'Operations-RTR (Gig0/1)', linkId: 'security-ops', mac: '0003.42A3.0002', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
      { name: 'Gig0/2', ip: '192.168.20.1/24', to: 'Security-SW (Fa0/24)', linkId: 'security-sw-link', mac: '0003.42A3.0003', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
    ],
    networks: ['10.0.0.4/30', '10.0.0.12/30', '192.168.20.0/24'],
  },
  'Operations-RTR': {
    id: 'Operations-RTR',
    shortId: 'R3',
    name: 'Operations-RTR',
    hostname: 'Operations-RTR',
    role: 'Flight Operations Gateway',
    type: 'router',
    routerId: '4.4.4.4',
    area: 'Area 0',
    mac: '0004.42A4.0000',
    interfaces: [
      { name: 'Gig0/0', ip: '10.0.0.10/30', to: 'Passenger-RTR (Gig0/1)', linkId: 'passenger-ops', mac: '0004.42A4.0001', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
      { name: 'Gig0/1', ip: '10.0.0.14/30', to: 'Security-RTR (Gig0/1)', linkId: 'security-ops', mac: '0004.42A4.0002', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
      { name: 'Gig0/2', ip: '192.168.30.1/24', to: 'Operations-SW (Fa0/24)', linkId: 'ops-sw-link', mac: '0004.42A4.0003', bandwidth: 'BW 1000000 Kbit', delay: 'DLY 10 usec' },
    ],
    networks: ['10.0.0.8/30', '10.0.0.12/30', '192.168.30.0/24'],
  },

  // Departmental Switches
  'Passenger-SW': {
    id: 'Passenger-SW',
    name: 'Passenger-SW',
    type: 'switch',
    vlan: 10,
    department: 'Passenger Services',
    subnet: '192.168.10.0/24',
    uplink: 'Passenger-RTR',
    hosts: 48,
    mac: '0060.70B1.0001',
    ports: [
      { name: 'Fa0/1', to: 'Passenger-PC', status: 'UP', vlan: 10 },
      { name: 'Fa0/24', to: 'Passenger-RTR (Gig0/2)', status: 'UP', vlan: 10 },
    ],
  },
  'Security-SW': {
    id: 'Security-SW',
    name: 'Security-SW',
    type: 'switch',
    vlan: 20,
    department: 'Security & Surveillance',
    subnet: '192.168.20.0/24',
    uplink: 'Security-RTR',
    hosts: 24,
    mac: '0060.70B2.0001',
    ports: [
      { name: 'Fa0/1', to: 'Security-PC', status: 'UP', vlan: 20 },
      { name: 'Fa0/24', to: 'Security-RTR (Gig0/2)', status: 'UP', vlan: 20 },
    ],
  },
  'Operations-SW': {
    id: 'Operations-SW',
    name: 'Operations-SW',
    type: 'switch',
    vlan: 30,
    department: 'Flight Operations',
    subnet: '192.168.30.0/24',
    uplink: 'Operations-RTR',
    hosts: 36,
    mac: '0060.70B3.0001',
    ports: [
      { name: 'Fa0/1', to: 'Operations-PC', status: 'UP', vlan: 30 },
      { name: 'Fa0/24', to: 'Operations-RTR (Gig0/2)', status: 'UP', vlan: 30 },
    ],
  },
  'Admin-SW': {
    id: 'Admin-SW',
    name: 'Admin-SW',
    type: 'switch',
    vlan: 40,
    department: 'Administration & Finance',
    subnet: '192.168.40.0/24',
    uplink: 'Airport-Core-RTR',
    hosts: 18,
    mac: '0060.70B4.0001',
    ports: [
      { name: 'Fa0/1', to: 'Admin-PC', status: 'UP', vlan: 40 },
      { name: 'Fa0/2', to: 'DNS-Server', status: 'UP', vlan: 40 },
      { name: 'Fa0/24', to: 'Airport-Core-RTR (Gig0/2)', status: 'UP', vlan: 40 },
    ],
  },

  // End Devices
  'Passenger-PC': {
    id: 'Passenger-PC',
    name: 'Passenger-PC',
    type: 'pc',
    ip: '192.168.10.10',
    subnet: '192.168.10.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.10.1',
    dns: '192.168.40.20',
    connectedTo: 'Passenger-SW',
    port: 'FastEthernet0',
    mac: '000C.29F1.A110',
    role: 'Check-in Kiosk / Passenger Services Terminal',
  },
  'Security-PC': {
    id: 'Security-PC',
    name: 'Security-PC',
    type: 'pc',
    ip: '192.168.20.10',
    subnet: '192.168.20.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.20.1',
    dns: '192.168.40.20',
    connectedTo: 'Security-SW',
    port: 'FastEthernet0',
    mac: '000C.29F2.B220',
    role: 'CCTV & Screening Workstation',
  },
  'Operations-PC': {
    id: 'Operations-PC',
    name: 'Operations-PC',
    type: 'pc',
    ip: '192.168.30.10',
    subnet: '192.168.30.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.30.1',
    dns: '192.168.40.20',
    connectedTo: 'Operations-SW',
    port: 'FastEthernet0',
    mac: '000C.29F3.C330',
    role: 'Air Traffic Control Workstation',
  },
  'Admin-PC': {
    id: 'Admin-PC',
    name: 'Admin-PC',
    type: 'pc',
    ip: '192.168.40.10',
    subnet: '192.168.40.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.40.1',
    dns: '192.168.40.20',
    connectedTo: 'Admin-SW',
    port: 'FastEthernet0',
    mac: '000C.29F4.D440',
    role: 'Campus Management Terminal',
  },
  'DNS-Server': {
    id: 'DNS-Server',
    name: 'DNS Server (airport.local)',
    type: 'server',
    ip: '192.168.40.20',
    subnet: '192.168.40.0/24',
    mask: '255.255.255.0',
    gateway: '192.168.40.1',
    dns: '127.0.0.1',
    connectedTo: 'Admin-SW',
    port: 'FastEthernet0',
    mac: '000C.29F5.E550',
    domain: 'airport.local',
    role: 'Authoritative Internal DNS Server',
    records: [
      { name: 'airport.local', type: 'A', value: '192.168.40.20' },
      { name: 'portal.airport.local', type: 'A', value: '192.168.40.20' },
      { name: 'fids.airport.local', type: 'A', value: '192.168.10.40' },
      { name: 'security.airport.local', type: 'A', value: '192.168.20.10' },
      { name: 'atc.airport.local', type: 'A', value: '192.168.30.15' },
    ],
  },
};

// Physical and Logical Links across the Campus
export const NETWORK_LINKS = [
  // Backbone router-to-router links (OSPF Area 0 Diamond with 10.0.0.x /30 subnets)
  {
    id: 'core-passenger',
    from: 'Airport-Core-RTR',
    to: 'Passenger-RTR',
    fromIface: 'Gig0/0',
    toIface: 'Gig0/0',
    subnet: '10.0.0.0/30',
    fromIp: '10.0.0.1',
    toIp: '10.0.0.2',
    cost: 1,
    bandwidth: '1 Gbps',
    label: 'Core ↔ Passenger (10.0.0.0/30)',
    isBackbone: true,
  },
  {
    id: 'core-security',
    from: 'Airport-Core-RTR',
    to: 'Security-RTR',
    fromIface: 'Gig0/1',
    toIface: 'Gig0/0',
    subnet: '10.0.0.4/30',
    fromIp: '10.0.0.5',
    toIp: '10.0.0.6',
    cost: 1,
    bandwidth: '1 Gbps',
    label: 'Core ↔ Security (10.0.0.4/30)',
    isBackbone: true,
  },
  {
    id: 'passenger-ops',
    from: 'Passenger-RTR',
    to: 'Operations-RTR',
    fromIface: 'Gig0/1',
    toIface: 'Gig0/0',
    subnet: '10.0.0.8/30',
    fromIp: '10.0.0.9',
    toIp: '10.0.0.10',
    cost: 1,
    bandwidth: '1 Gbps',
    label: 'Passenger ↔ Ops (10.0.0.8/30)',
    isBackbone: true,
  },
  {
    id: 'security-ops',
    from: 'Security-RTR',
    to: 'Operations-RTR',
    fromIface: 'Gig0/1',
    toIface: 'Gig0/1',
    subnet: '10.0.0.12/30',
    fromIp: '10.0.0.13',
    toIp: '10.0.0.14',
    cost: 1,
    bandwidth: '1 Gbps',
    label: 'Security ↔ Ops (10.0.0.12/30)',
    isBackbone: true,
  },

  // Router to Switch LAN Uplinks
  {
    id: 'core-admin-sw',
    from: 'Airport-Core-RTR',
    to: 'Admin-SW',
    fromIface: 'Gig0/2',
    toIface: 'Fa0/24',
    subnet: '192.168.40.0/24',
    cost: 1,
    bandwidth: '1 Gbps',
    label: 'Core ↔ Admin-SW',
    isBackbone: false,
    lanId: 'admin-lan',
  },
  {
    id: 'passenger-sw-link',
    from: 'Passenger-RTR',
    to: 'Passenger-SW',
    fromIface: 'Gig0/2',
    toIface: 'Fa0/24',
    subnet: '192.168.10.0/24',
    cost: 1,
    bandwidth: '1 Gbps',
    label: 'Passenger-RTR ↔ SW',
    isBackbone: false,
    lanId: 'passenger-lan',
  },
  {
    id: 'security-sw-link',
    from: 'Security-RTR',
    to: 'Security-SW',
    fromIface: 'Gig0/2',
    toIface: 'Fa0/24',
    subnet: '192.168.20.0/24',
    cost: 1,
    bandwidth: '1 Gbps',
    label: 'Security-RTR ↔ SW',
    isBackbone: false,
    lanId: 'security-lan',
  },
  {
    id: 'ops-sw-link',
    from: 'Operations-RTR',
    to: 'Operations-SW',
    fromIface: 'Gig0/2',
    toIface: 'Fa0/24',
    subnet: '192.168.30.0/24',
    cost: 1,
    bandwidth: '1 Gbps',
    label: 'Ops-RTR ↔ SW',
    isBackbone: false,
    lanId: 'ops-lan',
  },

  // Switch to Host Access Links
  {
    id: 'passenger-pc-link',
    from: 'Passenger-SW',
    to: 'Passenger-PC',
    fromIface: 'Fa0/1',
    toIface: 'FastEthernet0',
    cost: 1,
    bandwidth: '100 Mbps',
    label: 'Passenger-SW ↔ PC',
    isBackbone: false,
    lanId: 'passenger-lan',
  },
  {
    id: 'security-pc-link',
    from: 'Security-SW',
    to: 'Security-PC',
    fromIface: 'Fa0/1',
    toIface: 'FastEthernet0',
    cost: 1,
    bandwidth: '100 Mbps',
    label: 'Security-SW ↔ PC',
    isBackbone: false,
    lanId: 'security-lan',
  },
  {
    id: 'ops-pc-link',
    from: 'Operations-SW',
    to: 'Operations-PC',
    fromIface: 'Fa0/1',
    toIface: 'FastEthernet0',
    cost: 1,
    bandwidth: '100 Mbps',
    label: 'Ops-SW ↔ PC',
    isBackbone: false,
    lanId: 'ops-lan',
  },
  {
    id: 'admin-pc-link',
    from: 'Admin-SW',
    to: 'Admin-PC',
    fromIface: 'Fa0/1',
    toIface: 'FastEthernet0',
    cost: 1,
    bandwidth: '100 Mbps',
    label: 'Admin-SW ↔ PC',
    isBackbone: false,
    lanId: 'admin-lan',
  },
  {
    id: 'admin-dns-link',
    from: 'Admin-SW',
    to: 'DNS-Server',
    fromIface: 'Fa0/2',
    toIface: 'FastEthernet0',
    cost: 1,
    bandwidth: '1 Gbps',
    label: 'Admin-SW ↔ DNS',
    isBackbone: false,
    lanId: 'dns-server-link',
  },
];

/**
 * Build adjacency map based on active links (excluding failedLinks).
 */
export function buildAdjacencyList(failedLinkIds = new Set()) {
  const adj = {};
  for (const nodeId of Object.keys(NETWORK_DEVICES)) {
    adj[nodeId] = [];
  }

  for (const link of NETWORK_LINKS) {
    if (failedLinkIds.has(link.id)) continue;
    // Check if parent LAN is marked as failed
    if (link.lanId && failedLinkIds.has(link.lanId)) continue;

    adj[link.from] = adj[link.from] || [];
    adj[link.to] = adj[link.to] || [];
    adj[link.from].push({ target: link.to, linkId: link.id, cost: link.cost });
    adj[link.to].push({ target: link.from, linkId: link.id, cost: link.cost });
  }

  return adj;
}

/**
 * Find shortest path between source and destination using Dijkstra algorithm.
 */
export function findShortestPath(sourceId, destId, failedLinkIds = new Set()) {
  if (sourceId === destId) return [sourceId];

  const adj = buildAdjacencyList(failedLinkIds);
  const distances = {};
  const previous = {};
  const visited = new Set();
  const queue = [];

  for (const node of Object.keys(NETWORK_DEVICES)) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[sourceId] = 0;
  queue.push({ node: sourceId, dist: 0 });

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const { node: u, dist: d } = queue.shift();

    if (visited.has(u)) continue;
    visited.add(u);

    if (u === destId) break;

    const neighbors = adj[u] || [];
    for (const edge of neighbors) {
      const v = edge.target;
      if (visited.has(v)) continue;

      const alt = d + edge.cost;
      if (alt < distances[v]) {
        distances[v] = alt;
        previous[v] = u;
        queue.push({ node: v, dist: alt });
      }
    }
  }

  if (distances[destId] === Infinity) {
    return null; // Unreachable
  }

  const path = [];
  let curr = destId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return path;
}

export function getLinkBetween(nodeA, nodeB) {
  return NETWORK_LINKS.find(
    (l) => (l.from === nodeA && l.to === nodeB) || (l.from === nodeB && l.to === nodeA)
  );
}

/**
 * Compute simulated OSPF routing table for each router given current failed links.
 */
export function computeRoutingTables(failedLinkIds = new Set()) {
  const routers = ['Airport-Core-RTR', 'Passenger-RTR', 'Security-RTR', 'Operations-RTR'];
  const tables = {};

  const subnets = [
    { prefix: '192.168.10.0/24', owner: 'Passenger-RTR', desc: 'Passenger Services' },
    { prefix: '192.168.20.0/24', owner: 'Security-RTR', desc: 'Security Surveillance' },
    { prefix: '192.168.30.0/24', owner: 'Operations-RTR', desc: 'Flight Operations' },
    { prefix: '192.168.40.0/24', owner: 'Airport-Core-RTR', desc: 'Admin & Finance' },
  ];

  for (const router of routers) {
    tables[router] = [];

    for (const net of subnets) {
      if (net.owner === router) {
        tables[router].push({
          prefix: net.prefix,
          type: 'C (Connected)',
          code: 'C',
          desc: net.desc,
          nextHop: 'Directly Connected',
          iface: 'Gig0/2',
          metric: 0,
          ad: 0,
          status: 'ACTIVE',
        });
      } else {
        const path = findShortestPath(router, net.owner, failedLinkIds);
        if (!path || path.length < 2) {
          tables[router].push({
            prefix: net.prefix,
            type: 'O (OSPF)',
            code: 'O',
            desc: net.desc,
            nextHop: 'Unreachable',
            iface: 'None',
            metric: Infinity,
            ad: 110,
            status: 'UNREACHABLE',
          });
        } else {
          const nextRouter = path[1];
          const link = getLinkBetween(router, nextRouter);
          const iface = link.from === router ? link.fromIface : link.toIface;
          const nextHopIp = link.from === router ? link.toIp : link.fromIp;

          let note = '';
          if (router === 'Airport-Core-RTR' && net.owner === 'Operations-RTR') {
            const hasPass = !failedLinkIds.has('core-passenger') && !failedLinkIds.has('passenger-ops');
            const hasSec = !failedLinkIds.has('core-security') && !failedLinkIds.has('security-ops');
            if (hasPass && hasSec) {
              note = 'ECMP available (via Passenger & Security)';
            }
          }

          tables[router].push({
            prefix: net.prefix,
            type: 'O (OSPF)',
            code: 'O',
            desc: net.desc,
            nextHop: `${nextHopIp} (${nextRouter})`,
            iface,
            metric: (path.length - 1) * 10,
            ad: 110,
            status: 'ACTIVE',
            note,
          });
        }
      }
    }
  }

  return tables;
}

/**
 * Compute simulated OSPF neighbor states.
 */
export function computeOSPFNeighbors(failedLinkIds = new Set(), recoveringLinkIds = new Set()) {
  const neighbors = [
    { router: 'Airport-Core-RTR', neighbor: 'Passenger-RTR', neighborId: '2.2.2.2', linkId: 'core-passenger', iface: 'Gig0/0', ip: '10.0.0.2' },
    { router: 'Airport-Core-RTR', neighbor: 'Security-RTR', neighborId: '3.3.3.3', linkId: 'core-security', iface: 'Gig0/1', ip: '10.0.0.6' },
    { router: 'Passenger-RTR', neighbor: 'Airport-Core-RTR', neighborId: '1.1.1.1', linkId: 'core-passenger', iface: 'Gig0/0', ip: '10.0.0.1' },
    { router: 'Passenger-RTR', neighbor: 'Operations-RTR', neighborId: '4.4.4.4', linkId: 'passenger-ops', iface: 'Gig0/1', ip: '10.0.0.10' },
    { router: 'Security-RTR', neighbor: 'Airport-Core-RTR', neighborId: '1.1.1.1', linkId: 'core-security', iface: 'Gig0/0', ip: '10.0.0.5' },
    { router: 'Security-RTR', neighbor: 'Operations-RTR', neighborId: '4.4.4.4', linkId: 'security-ops', iface: 'Gig0/1', ip: '10.0.0.14' },
    { router: 'Operations-RTR', neighbor: 'Passenger-RTR', neighborId: '2.2.2.2', linkId: 'passenger-ops', iface: 'Gig0/0', ip: '10.0.0.9' },
    { router: 'Operations-RTR', neighbor: 'Security-RTR', neighborId: '3.3.3.3', linkId: 'security-ops', iface: 'Gig0/1', ip: '10.0.0.13' },
  ];

  return neighbors.map((n) => {
    let state = 'FULL/DR';
    let uptime = '04:28:15';
    let deadTime = '00:00:34';
    if (failedLinkIds.has(n.linkId)) {
      state = 'DOWN';
      uptime = '-';
      deadTime = '-';
    } else if (recoveringLinkIds.has(n.linkId)) {
      state = 'RECOVERING';
      uptime = '00:00:04';
      deadTime = '00:00:39';
    } else {
      if (['Passenger-RTR', 'Operations-RTR'].includes(n.neighbor)) {
        state = 'FULL/BDR';
      }
    }
    return {
      ...n,
      state,
      area: 0,
      uptime,
      deadTime,
    };
  });
}

/**
 * Execute simulated Cisco IOS commands on a router.
 */
export function executeRouterCLI(routerId, commandStr, failedLinks = new Set()) {
  const router = NETWORK_DEVICES[routerId];
  if (!router || router.type !== 'router') {
    return `% Device ${routerId} is not a valid router.`;
  }

  const cmd = commandStr.trim().toLowerCase();
  if (!cmd) return '';

  if (cmd === '?' || cmd === 'help') {
    return `Available Cisco IOS Exec Commands:
  show ip interface brief    Display brief status and address of interfaces
  show ip ospf neighbor      Display OSPF neighbor information and state
  show ip route              Display IP routing table (RIB)
  show ip protocols          Display IP routing protocol process parameters
  ping <ip_or_name>          Send ICMP echo request to destination
  traceroute <ip_or_name>    Trace route to destination
  show version               Display router system hardware and software status
  show running-config        Display current active configuration`;
  }

  if (cmd === 'show ip interface brief' || cmd === 'sh ip int br') {
    let out = `Interface              IP-Address      OK? Method Status                Protocol\n`;
    for (const iface of router.interfaces) {
      const isDown = failedLinks.has(iface.linkId);
      const statusStr = isDown ? 'administratively down' : 'up';
      const protoStr = isDown ? 'down' : 'up';
      const padIface = iface.name.padEnd(22);
      const padIp = iface.ip.split('/')[0].padEnd(15);
      const padOk = 'YES'.padEnd(4);
      const padMethod = 'manual'.padEnd(7);
      const padStatus = statusStr.padEnd(21);
      out += `${padIface}${padIp}${padOk}${padMethod}${padStatus}${protoStr}\n`;
    }
    return out;
  }

  if (cmd === 'show ip ospf neighbor' || cmd === 'sh ip ospf nei') {
    const neighbors = computeOSPFNeighbors(failedLinks).filter((n) => n.router === routerId);
    let out = `Neighbor ID     Pri   State           Dead Time   Address         Interface\n`;
    for (const n of neighbors) {
      const padId = n.neighborId.padEnd(16);
      const padPri = '1'.padEnd(6);
      const padState = n.state.padEnd(16);
      const padDead = n.deadTime.padEnd(12);
      const padAddr = n.ip.padEnd(16);
      out += `${padId}${padPri}${padState}${padDead}${padAddr}${n.iface}\n`;
    }
    return out;
  }

  if (cmd === 'show ip route' || cmd === 'sh ip route') {
    const tables = computeRoutingTables(failedLinks);
    const routes = tables[routerId] || [];
    let out = `Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area 

Gateway of last resort is not set

`;
    for (const r of routes) {
      if (r.code === 'C') {
        out += `C    ${r.prefix} is directly connected, ${r.iface}\n`;
      } else if (r.status === 'ACTIVE') {
        out += `O    ${r.prefix} [${r.ad}/${r.metric}] via ${r.nextHop}, ${r.iface}\n`;
      }
    }
    return out;
  }

  if (cmd === 'show ip protocols' || cmd === 'sh ip proto') {
    return `*** IP Routing is NSF aware ***

Routing Protocol is "ospf 1"
  Outgoing update filter list for all interfaces is not set
  Incoming update filter list for all interfaces is not set
  Router ID ${router.routerId}
  Number of areas in this router is 1. 1 normal 0 stub 0 nssa
  Maximum path: 4
  Routing for Networks:
    10.0.0.0 0.0.0.255 area 0
    192.168.0.0 0.0.255.255 area 0
  Routing Information Sources:
    Gateway         Distance      Last Update
    ${router.routerId}         110           04:22:18
  Distance: (default is 110)`;
  }

  if (cmd.startsWith('ping ')) {
    const target = commandStr.trim().split(/\s+/)[1];
    // Find target device by name or IP
    let targetDevice = Object.values(NETWORK_DEVICES).find(
      (d) => d.name === target || d.ip === target || (d.records && d.records.some((r) => r.name === target))
    );
    if (!targetDevice && target === 'airport.local') {
      targetDevice = NETWORK_DEVICES['DNS-Server'];
    }

    if (!targetDevice) {
      return `% Destination ${target} unreachable or unknown host.`;
    }

    const path = findShortestPath(routerId, targetDevice.id, failedLinks);
    if (!path) {
      return `Sending 5, 100-byte ICMP Echos to ${target}, timeout is 2 seconds:
.....
Success rate is 0 percent (0/5)`;
    }

    return `Sending 5, 100-byte ICMP Echos to ${targetDevice.ip || target}, timeout is 2 seconds:
!!!!!
Success rate is 100 percent (5/5), round-trip min/avg/max = 1/2/3 ms`;
  }

  if (cmd.startsWith('traceroute ')) {
    const target = commandStr.trim().split(/\s+/)[1];
    let targetDevice = Object.values(NETWORK_DEVICES).find(
      (d) => d.name === target || d.ip === target
    );
    if (target === 'airport.local') targetDevice = NETWORK_DEVICES['DNS-Server'];

    if (!targetDevice) return `% Unknown destination ${target}.`;

    const path = findShortestPath(routerId, targetDevice.id, failedLinks);
    if (!path) {
      return `Tracing route to ${target} (${targetDevice.ip || target})\n  1 * * * Request timed out.`;
    }

    let out = `Type escape sequence to abort.\nTracing the route to ${target} (${targetDevice.ip || target})\n\n`;
    path.forEach((node, idx) => {
      if (idx === 0) return;
      const dev = NETWORK_DEVICES[node];
      out += `  ${idx}  ${node} (${dev.ip || dev.routerId || 'Switch'}) 1 msec 2 msec 1 msec\n`;
    });
    return out;
  }

  if (cmd === 'show version' || cmd === 'sh ver') {
    return `Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4
Compiled Wed 23-Feb-26 14:12 by cisco
${router.hostname} uptime is 4 hours, 28 minutes
System image file is "flash0:c2900-universalk9-mz.SPA.151-4.M4.bin"

Cisco CISCO2901/K9 (revision 1.0) with 491520K/32768K bytes of memory.
Processor board ID FDO173428ZJ
3 Gigabit Ethernet interfaces
DRAM configuration is 64 bits wide with parity disabled.
255K bytes of non-volatile configuration memory.
249856K bytes of ATA CompactFlash (Read/Write)

Configuration register is 0x2102`;
  }

  if (cmd === 'show running-config' || cmd === 'sh run') {
    return `Building configuration...

Current configuration : 1842 bytes
!
version 15.1
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
hostname ${router.hostname}
!
ip cef
!
interface GigabitEthernet0/0
 ip address ${router.interfaces[0].ip.replace('/', ' ')}
 duplex auto
 speed auto
!
interface GigabitEthernet0/1
 ip address ${router.interfaces[1].ip.replace('/', ' ')}
 duplex auto
 speed auto
!
interface GigabitEthernet0/2
 ip address ${router.interfaces[2].ip.replace('/', ' ')}
 duplex auto
 speed auto
!
router ospf 1
 router-id ${router.routerId}
 log-adjacency-changes
 network 10.0.0.0 0.0.0.255 area 0
 network 192.168.0.0 0.0.255.255 area 0
!
end`;
  }

  return `% Unrecognized command: "${commandStr}". Type "?" or "help" for list of supported commands.`;
}

/**
 * Execute simulated commands on PC command prompt.
 */
export function executePCCLI(pcId, commandStr, failedLinks = new Set()) {
  const pc = NETWORK_DEVICES[pcId];
  if (!pc) return `% Device ${pcId} not found.`;

  const cmd = commandStr.trim().toLowerCase();
  if (!cmd) return '';

  if (cmd === 'ipconfig' || cmd === 'ipconfig /all') {
    return `FastEthernet0 Connection:
   Connection-specific DNS Suffix..: airport.local
   Link-local IPv6 Address.........: fe80::a00:27ff:fe4a:1234
   IPv4 Address....................: ${pc.ip}
   Subnet Mask.....................: ${pc.mask || '255.255.255.0'}
   Default Gateway.................: ${pc.gateway}
   DHCP Server.....................: 192.168.40.1
   DNS Servers.....................: ${pc.dns}
   Physical Address (MAC)..........: ${pc.mac}`;
  }

  if (cmd === 'arp -a') {
    return `Interface: ${pc.ip} --- 0x2
  Internet Address      Physical Address      Type
  ${pc.gateway}           0001.42A1.0003        dynamic
  192.168.40.20         000C.29F5.E550        dynamic
  255.255.255.255       ffff.ffff.ffff        static`;
  }

  if (cmd.startsWith('ping ')) {
    const target = commandStr.trim().split(/\s+/)[1];
    let dest = target;
    if (target === 'airport.local') dest = '192.168.40.20';

    const targetDev = Object.values(NETWORK_DEVICES).find((d) => d.ip === dest || d.name === dest);
    if (!targetDev) {
      return `Ping request could not find host ${target}. Please check the name and try again.`;
    }

    const path = findShortestPath(pcId, targetDev.id, failedLinks);
    if (!path) {
      return `Pinging ${dest} with 32 bytes of data:
Request timed out.
Request timed out.
Request timed out.
Request timed out.

Ping statistics for ${dest}:
    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)`;
    }

    return `Pinging ${dest} with 32 bytes of data:
Reply from ${dest}: bytes=32 time=2ms TTL=126
Reply from ${dest}: bytes=32 time=1ms TTL=126
Reply from ${dest}: bytes=32 time=2ms TTL=126
Reply from ${dest}: bytes=32 time=1ms TTL=126

Ping statistics for ${dest}:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 1ms, Maximum = 2ms, Average = 1ms`;
  }

  if (cmd.startsWith('nslookup ')) {
    const domain = commandStr.trim().split(/\s+/)[1];
    const dnsServer = NETWORK_DEVICES['DNS-Server'];
    const record = dnsServer.records.find((r) => r.name === domain);
    if (record) {
      return `Server:  airport.local
Address:  ${dnsServer.ip}

Name:    ${domain}
Address:  ${record.value}`;
    }
    return `Server:  airport.local
Address:  ${dnsServer.ip}

*** airport.local can't find ${domain}: Non-existent domain`;
  }

  return `Command not recognized. Try: ipconfig, ipconfig /all, ping <ip_or_name>, arp -a, nslookup <domain>`;
}
