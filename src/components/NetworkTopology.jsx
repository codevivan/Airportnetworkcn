import { useMemo } from 'react';
import { NETWORK_DEVICES, NETWORK_LINKS, getLinkBetween } from '../utils/networkGraph.js';

export default function NetworkTopology({
  failedLinks,
  recoveringLinks,
  packetState,
  onSelectEntity,
  selectedEntity,
  onToggleLink,
}) {
  const W = 1180;
  const H = 680;

  // Node layout coordinates (Diamond topology in center with LAN trees)
  const nodePositions = {
    // Area 0 Diamond Routers
    'Airport-Core-RTR': { x: 590, y: 150, type: 'router', label: 'Airport-Core-RTR', sub: '1.1.1.1 · Backbone' },
    'Passenger-RTR': { x: 330, y: 310, type: 'router', label: 'Passenger-RTR', sub: '2.2.2.2 · GW 192.168.10.1' },
    'Security-RTR': { x: 850, y: 310, type: 'router', label: 'Security-RTR', sub: '3.3.3.3 · GW 192.168.20.1' },
    'Operations-RTR': { x: 590, y: 470, type: 'router', label: 'Operations-RTR', sub: '4.4.4.4 · GW 192.168.30.1' },

    // Switches
    'Passenger-SW': { x: 130, y: 310, type: 'switch', label: 'Passenger-SW', sub: 'VLAN 10 · 48 Ports' },
    'Security-SW': { x: 1050, y: 310, type: 'switch', label: 'Security-SW', sub: 'VLAN 20 · 24 Ports' },
    'Operations-SW': { x: 590, y: 590, type: 'switch', label: 'Operations-SW', sub: 'VLAN 30 · 36 Ports' },
    'Admin-SW': { x: 590, y: 38, type: 'switch', label: 'Admin-SW', sub: 'VLAN 40 · 18 Ports' },

    // Endpoints
    'Passenger-PC': { x: 40, y: 440, type: 'pc', label: 'Passenger-PC', sub: '192.168.10.10' },
    'Security-PC': { x: 1140, y: 440, type: 'pc', label: 'Security-PC', sub: '192.168.20.10' },
    'Operations-PC': { x: 740, y: 640, type: 'pc', label: 'Operations-PC', sub: '192.168.30.10' },
    'Admin-PC': { x: 420, y: 38, type: 'pc', label: 'Admin-PC', sub: '192.168.40.10' },
    'DNS-Server': { x: 760, y: 38, type: 'server', label: 'DNS Server', sub: 'airport.local · 192.168.40.20' },
  };

  // Determine which link is currently being traversed by the packet
  const activePacketLink = useMemo(() => {
    if (!packetState.active || packetState.status === 'IDLE') return null;
    const { path, currentHopIndex } = packetState;
    if (path.length < 2 || currentHopIndex >= path.length) return null;
    const curr = path[currentHopIndex];
    const prev = currentHopIndex > 0 ? path[currentHopIndex - 1] : null;
    if (prev) {
      return getLinkBetween(prev, curr);
    }
    return null;
  }, [packetState]);

  // Current node where packet is located
  const currentPacketNode = useMemo(() => {
    if (!packetState.active || packetState.status === 'IDLE') return null;
    return packetState.path[packetState.currentHopIndex] || null;
  }, [packetState]);

  // Check if a link is in the planned packet route
  const isLinkInPacketRoute = (linkId) => {
    if (!packetState.active || !packetState.path || packetState.path.length < 2) return false;
    for (let i = 0; i < packetState.path.length - 1; i++) {
      const l = getLinkBetween(packetState.path[i], packetState.path[i + 1]);
      if (l && l.id === linkId) return true;
    }
    return false;
  };

  // Packet coordinates
  const packetPos = currentPacketNode ? nodePositions[currentPacketNode] : null;

  return (
    <div className="card topology-card">
      <div className="card-head">
        <div className="card-title">
          <h3>Interactive Campus Network Topology (OSPF Area 0 Diamond)</h3>
          <span className="sub">
            4 OSPF Routers · 4 Departmental Switches · 4 Client PCs · 1 DNS Server
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {failedLinks.size > 0 ? (
            <span className="badge badge-crit">
              <span className="led" />
              {failedLinks.size} LINK{failedLinks.size > 1 ? 'S' : ''} DOWN
            </span>
          ) : (
            <span className="badge badge-ok">
              <span className="led" />
              ALL LINKS OPERATIONAL
            </span>
          )}
          {recoveringLinks.size > 0 && (
            <span className="badge badge-warn">
              <span className="led" />
              RECOVERING...
            </span>
          )}
        </div>
      </div>

      <div className="legend" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11.5 }}>
        <span>
          <span className="swatch" style={{ background: 'var(--accent)', borderRadius: '50%' }} /> OSPF Router
        </span>
        <span>
          <span className="swatch" style={{ background: 'var(--accent-2)', borderRadius: 3 }} /> Switch
        </span>
        <span>
          <span className="swatch" style={{ background: 'var(--passenger)', borderRadius: 3 }} /> Client PC
        </span>
        <span>
          <span className="swatch" style={{ background: 'var(--administration)', borderRadius: 3 }} /> DNS Server
        </span>
        <span>
          <i style={{ background: 'var(--status-ok)', width: 14, height: 3, display: 'inline-block' }} /> Link UP
        </span>
        <span>
          <i
            style={{
              background: 'var(--status-crit)',
              width: 14,
              height: 3,
              display: 'inline-block',
              borderStyle: 'dashed',
            }}
          />{' '}
          Link FAILED
        </span>
        <span>
          <i style={{ background: 'var(--passenger)', width: 14, height: 4, display: 'inline-block' }} /> Active Packet Route
        </span>
      </div>

      <div className="topo-wrap">
        <svg
          className="topo-svg"
          viewBox={`0 0 ${W} ${H}`}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Airport network diamond topology"
        >
          <defs>
            {/* Area 0 Hatching Pattern */}
            <pattern id="area0Hatch" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0 20 L20 0" stroke="var(--accent-bg)" strokeWidth="1.2" fill="none" />
            </pattern>

            {/* Glowing filter for active packet and route */}
            <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="var(--accent)" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* OSPF Area 0 Diamond Zone Enclosure */}
          <polygon
            points="590,80 950,310 590,540 230,310"
            fill="url(#area0Hatch)"
            stroke="var(--accent-border)"
            strokeWidth="1.8"
            strokeDasharray="7 5"
            opacity="0.85"
          />
          <text
            x="590"
            y="285"
            textAnchor="middle"
            fontSize="15"
            fill="var(--accent)"
            fontFamily="var(--mono)"
            fontWeight="800"
            letterSpacing="0.1em"
            opacity="0.75"
          >
            ⬡ OSPF AREA 0 BACKBONE
          </text>
          <text
            x="590"
            y="305"
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-m)"
            fontFamily="var(--mono)"
          >
            Process ID 1 · Cost: 10 per Backbone Link
          </text>

          {/* Departmental LAN Background Cloud Outlines */}
          {/* Passenger LAN (Left) */}
          <path
            d="M 10 240 Q 150 220 220 310 Q 180 490 20 480 Z"
            fill="rgba(14, 165, 233, 0.05)"
            stroke="var(--passenger)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text x="70" y="260" fontSize="11" fill="var(--passenger)" fontFamily="var(--mono)" fontWeight="700">
            Passenger VLAN 10 (192.168.10.0/24)
          </text>

          {/* Security LAN (Right) */}
          <path
            d="M 970 240 Q 1160 220 1170 340 Q 1160 490 980 460 Z"
            fill="rgba(239, 68, 68, 0.05)"
            stroke="var(--security)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text x="1100" y="260" textAnchor="end" fontSize="11" fill="var(--security)" fontFamily="var(--mono)" fontWeight="700">
            Security VLAN 20 (192.168.20.0/24)
          </text>

          {/* Operations LAN (Bottom) */}
          <rect
            x="480"
            y="560"
            width="370"
            height="110"
            rx="12"
            fill="rgba(245, 158, 11, 0.05)"
            stroke="var(--operations)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text x="500" y="580" fontSize="11" fill="var(--operations)" fontFamily="var(--mono)" fontWeight="700">
            Flight Operations VLAN 30 (192.168.30.0/24)
          </text>

          {/* Admin & DNS LAN (Top) */}
          <rect
            x="320"
            y="10"
            width="550"
            height="85"
            rx="12"
            fill="rgba(139, 92, 246, 0.05)"
            stroke="var(--administration)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text x="340" y="28" fontSize="11" fill="var(--administration)" fontFamily="var(--mono)" fontWeight="700">
            Admin & DNS VLAN 40 (192.168.40.0/24)
          </text>

          {/* Render All Links */}
          {NETWORK_LINKS.map((link) => {
            const pFrom = nodePositions[link.from];
            const pTo = nodePositions[link.to];
            if (!pFrom || !pTo) return null;

            const isFailed = failedLinks.has(link.id);
            const isRecovering = recoveringLinks.has(link.id);
            const isInRoute = isLinkInPacketRoute(link.id);
            const isTraversing = activePacketLink && activePacketLink.id === link.id;

            let strokeColor = 'var(--status-ok)';
            let strokeWidth = link.isBackbone ? 3.5 : 2.2;
            let strokeDash = undefined;

            if (isFailed) {
              strokeColor = 'var(--status-crit)';
              strokeDash = '8 6';
            } else if (isRecovering) {
              strokeColor = 'var(--status-warn)';
              strokeDash = '6 4';
            } else if (isTraversing) {
              strokeColor = '#06b6d4';
              strokeWidth = link.isBackbone ? 5 : 4;
            } else if (isInRoute) {
              strokeColor = 'var(--accent-2)';
              strokeWidth = link.isBackbone ? 4.2 : 3;
            }

            const midX = (pFrom.x + pTo.x) / 2;
            const midY = (pFrom.y + pTo.y) / 2;

            return (
              <g
                key={link.id}
                className="topo-link-group"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onSelectEntity({ type: 'link', id: link.id });
                  if (link.isBackbone) {
                    onToggleLink(link.id);
                  }
                }}
              >
                {/* Background fat line for easy hover/clicking */}
                <line
                  x1={pFrom.x}
                  y1={pFrom.y}
                  x2={pTo.x}
                  y2={pTo.y}
                  stroke="transparent"
                  strokeWidth="18"
                />

                {/* Visible Link Line */}
                <line
                  x1={pFrom.x}
                  y1={pFrom.y}
                  x2={pTo.x}
                  y2={pTo.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  opacity={isFailed ? 0.75 : 1}
                  className={isTraversing ? 'pulse-link' : ''}
                />

                {/* Animated traveling dash if link is active in packet simulation */}
                {isInRoute && !isFailed && (
                  <line
                    x1={pFrom.x}
                    y1={pFrom.y}
                    x2={pTo.x}
                    y2={pTo.y}
                    stroke="#38bdf8"
                    strokeWidth={strokeWidth - 1}
                    strokeDasharray="6 8"
                    className="animated-flow"
                  />
                )}

                {/* Link Label Tag (Backbone Links only for clarity) */}
                {link.isBackbone && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-65"
                      y="-12"
                      width="130"
                      height="24"
                      rx="6"
                      fill="var(--bg-elev)"
                      stroke={isFailed ? 'var(--status-crit)' : isRecovering ? 'var(--status-warn)' : 'var(--border)'}
                      strokeWidth={isFailed ? 1.5 : 1}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fontSize="10"
                      fontFamily="var(--mono)"
                      fontWeight="700"
                      fill={isFailed ? 'var(--status-crit)' : isRecovering ? 'var(--status-warn)' : 'var(--text-h)'}
                    >
                      {isFailed ? '⚠ LINK DOWN' : isRecovering ? '⟳ RECOVERING' : link.subnet}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render All Nodes */}
          {Object.entries(nodePositions).map(([nodeId, pos]) => {
            const isSelected = selectedEntity && selectedEntity.id === nodeId;
            const isCurrentHop = currentPacketNode === nodeId;
            const device = NETWORK_DEVICES[nodeId] || {};

            if (pos.type === 'router') {
              return (
                <g
                  key={nodeId}
                  className="topo-node-group"
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectEntity({ type: 'router', id: nodeId })}
                >
                  {/* Active Hop Pulse Effect */}
                  {isCurrentHop && (
                    <circle r="52" fill="none" stroke="var(--passenger)" strokeWidth="3" opacity="0.8">
                      <animate attributeName="r" values="38;56;38" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Outer glow ring */}
                  <circle
                    r="40"
                    fill="var(--bg-elev)"
                    stroke={isSelected ? 'var(--accent-2)' : 'var(--accent)'}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    filter="url(#nodeGlow)"
                  />
                  <circle r="46" fill="none" stroke="var(--accent-border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

                  {/* Router Center Symbol (Crossed 4 Arrows) */}
                  <g fill="var(--accent)">
                    {/* Top Arrow */}
                    <path d="M 0 -24 L -5 -16 L -2 -16 L -2 -4 L 2 -4 L 2 -16 L 5 -16 Z" />
                    {/* Bottom Arrow */}
                    <path d="M 0 24 L -5 16 L -2 16 L -2 4 L 2 4 L 2 16 L 5 16 Z" />
                    {/* Left Arrow */}
                    <path d="M -24 0 L -16 -5 L -16 -2 L -4 -2 L -4 2 L -16 2 L -16 5 Z" />
                    {/* Right Arrow */}
                    <path d="M 24 0 L 16 -5 L 16 -2 L 4 -2 L 4 2 L 16 2 L 16 5 Z" />
                    <circle r="4" fill="var(--accent)" />
                  </g>

                  {/* Router Label Box */}
                  <rect
                    x="-80"
                    y="50"
                    width="160"
                    height="38"
                    rx="6"
                    fill="var(--bg-elev)"
                    stroke={isSelected ? 'var(--accent-2)' : 'var(--border)'}
                    strokeWidth={isSelected ? 2 : 1}
                    filter="drop-shadow(0 2px 5px rgba(0,0,0,0.1))"
                  />
                  <text x="0" y="65" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--text-h)" fontFamily="var(--mono)">
                    {nodeId}
                  </text>
                  <text x="0" y="80" textAnchor="middle" fontSize="10" fill="var(--accent)" fontFamily="var(--mono)" fontWeight="600">
                    ID: {device.routerId || '1.1.1.1'} · Area 0
                  </text>
                </g>
              );
            }

            if (pos.type === 'switch') {
              const swColor =
                nodeId.includes('Passenger') ? 'var(--passenger)' :
                nodeId.includes('Security') ? 'var(--security)' :
                nodeId.includes('Operations') ? 'var(--operations)' : 'var(--administration)';

              return (
                <g
                  key={nodeId}
                  className="topo-node-group"
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectEntity({ type: 'switch', id: nodeId })}
                >
                  {isCurrentHop && (
                    <rect x="-65" y="-30" width="130" height="60" rx="10" fill="none" stroke={swColor} strokeWidth="3">
                      <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
                    </rect>
                  )}

                  {/* Switch Chassis Box */}
                  <rect
                    x="-55"
                    y="-22"
                    width="110"
                    height="44"
                    rx="6"
                    fill="var(--bg-elev)"
                    stroke={isSelected ? 'var(--accent-2)' : swColor}
                    strokeWidth={isSelected ? 3 : 2}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                  />

                  {/* Switch Port Indicators */}
                  <g fill={swColor} opacity="0.8">
                    <rect x="-45" y="-12" width="7" height="6" rx="1" />
                    <rect x="-35" y="-12" width="7" height="6" rx="1" />
                    <rect x="-25" y="-12" width="7" height="6" rx="1" />
                    <rect x="-15" y="-12" width="7" height="6" rx="1" />
                    <rect x="8" y="-12" width="7" height="6" rx="1" />
                    <rect x="18" y="-12" width="7" height="6" rx="1" />
                    <rect x="28" y="-12" width="7" height="6" rx="1" />
                    <rect x="38" y="-12" width="7" height="6" rx="1" />
                  </g>

                  {/* Switch Label */}
                  <text x="0" y="8" textAnchor="middle" fontSize="11" fontWeight="800" fill={swColor} fontFamily="var(--mono)">
                    {nodeId}
                  </text>
                  <text x="0" y="34" textAnchor="middle" fontSize="9.5" fill="var(--text-m)" fontFamily="var(--mono)">
                    {pos.sub}
                  </text>
                </g>
              );
            }

            if (pos.type === 'pc') {
              const pcColor =
                nodeId.includes('Passenger') ? 'var(--passenger)' :
                nodeId.includes('Security') ? 'var(--security)' :
                nodeId.includes('Operations') ? 'var(--operations)' : 'var(--administration)';

              return (
                <g
                  key={nodeId}
                  className="topo-node-group"
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectEntity({ type: 'pc', id: nodeId })}
                >
                  {isCurrentHop && (
                    <circle r="36" fill="none" stroke={pcColor} strokeWidth="3">
                      <animate attributeName="r" values="24;40;24" dur="1s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* PC Screen SVG */}
                  <rect
                    x="-24"
                    y="-20"
                    width="48"
                    height="32"
                    rx="4"
                    fill="var(--bg-elev)"
                    stroke={isSelected ? 'var(--accent-2)' : pcColor}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <rect x="-20" y="-16" width="40" height="24" rx="2" fill={pcColor} opacity="0.18" />
                  {/* Stand */}
                  <line x1="0" y1="12" x2="0" y2="18" stroke={pcColor} strokeWidth="3" />
                  <line x1="-12" y1="18" x2="12" y2="18" stroke={pcColor} strokeWidth="3" strokeLinecap="round" />

                  {/* Label */}
                  <text x="0" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-h)" fontFamily="var(--mono)">
                    {nodeId}
                  </text>
                  <text x="0" y="45" textAnchor="middle" fontSize="9.5" fill={pcColor} fontFamily="var(--mono)" fontWeight="600">
                    {pos.sub}
                  </text>
                </g>
              );
            }

            if (pos.type === 'server') {
              return (
                <g
                  key={nodeId}
                  className="topo-node-group"
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectEntity({ type: 'server', id: nodeId })}
                >
                  {isCurrentHop && (
                    <rect x="-42" y="-28" width="84" height="56" rx="8" fill="none" stroke="var(--administration)" strokeWidth="3">
                      <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
                    </rect>
                  )}

                  {/* Server Rack Box */}
                  <rect
                    x="-32"
                    y="-22"
                    width="64"
                    height="44"
                    rx="4"
                    fill="var(--bg-elev)"
                    stroke={isSelected ? 'var(--accent-2)' : 'var(--administration)'}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  {/* Server bays */}
                  <line x1="-26" y1="-8" x2="26" y2="-8" stroke="var(--administration)" strokeWidth="1.5" />
                  <line x1="-26" y1="6" x2="26" y2="6" stroke="var(--administration)" strokeWidth="1.5" />
                  {/* LEDs */}
                  <circle cx="20" cy="-15" r="2" fill="var(--status-ok)" />
                  <circle cx="20" cy="-1" r="2" fill="var(--status-ok)" />
                  <circle cx="20" cy="13" r="2" fill="var(--passenger)" />

                  <text x="0" y="34" textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--administration)" fontFamily="var(--mono)">
                    airport.local
                  </text>
                  <text x="0" y="47" textAnchor="middle" fontSize="9.5" fill="var(--text-m)" fontFamily="var(--mono)">
                    DNS · 192.168.40.20
                  </text>
                </g>
              );
            }

            return null;
          })}

          {/* Animated Packet Marker */}
          {packetState.active && packetPos && (
            <g
              transform={`translate(${packetPos.x}, ${packetPos.y})`}
              filter="url(#packetGlow)"
              style={{ pointerEvents: 'none' }}
            >
              {packetState.status === 'DROPPED' ? (
                // Dropped marker (Red X)
                <g>
                  <circle r="18" fill="var(--status-crit)" />
                  <path d="M -7 -7 L 7 7 M 7 -7 L -7 7" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
                  <rect x="-60" y="-46" width="120" height="22" rx="4" fill="var(--status-crit)" />
                  <text x="0" y="-31" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fff" fontFamily="var(--mono)">
                    PACKET DROPPED
                  </text>
                </g>
              ) : packetState.status === 'DELIVERED' ? (
                // Delivered marker (Green Check)
                <g>
                  <circle r="18" fill="var(--status-ok)" />
                  <path d="M -7 0 L -2 5 L 8 -5" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  <rect x="-60" y="-46" width="120" height="22" rx="4" fill="var(--status-ok)" />
                  <text x="0" y="-31" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fff" fontFamily="var(--mono)">
                    DELIVERED ✓
                  </text>
                </g>
              ) : (
                // Moving Packet Marker (Cyan Glowing Beacon)
                <g>
                  <circle r="16" fill="#06b6d4" />
                  <circle r="24" fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.8">
                    <animate attributeName="r" values="16;30;16" dur="0.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.1;0.9" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                  <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff" fontFamily="var(--mono)">
                    PKT
                  </text>
                  <rect x="-50" y="-38" width="100" height="20" rx="4" fill="#0891b2" />
                  <text x="0" y="-24" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff" fontFamily="var(--mono)">
                    {packetState.id}
                  </text>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--text-m)' }}>
        <span>• Tip: Click any device to inspect properties in the Packet Inspector.</span>
        <span>• Click any backbone link or fault button to inject a link failure and watch OSPF reconverge.</span>
      </div>
    </div>
  );
}
