import { useState, useRef, useMemo, useEffect } from 'react';
import { NETWORK_DEVICES, NETWORK_LINKS, getLinkBetween } from '../../utils/networkGraph.js';

export default function SimulatorWorkspace({
  failedLinks,
  recoveringLinks,
  packetState,
  selectedEntity,
  onSelectEntity,
  onToggleLink,
  zoom,
  pan,
  setPan,
}) {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Base canvas dimensions
  const W = 1200;
  const H = 720;

  // Packet Tracer Layout Coordinates (matching user's topology)
  const nodePositions = {
    // Area 0 Diamond Backbone
    'Airport-Core-RTR': { x: 580, y: 140, type: 'router', label: 'Airport-Core-RTR', sub: '1.1.1.1' },
    'Passenger-RTR': { x: 320, y: 310, type: 'router', label: 'Passenger-RTR', sub: '2.2.2.2' },
    'Security-RTR': { x: 840, y: 310, type: 'router', label: 'Security-RTR', sub: '3.3.3.3' },
    'Operations-RTR': { x: 580, y: 480, type: 'router', label: 'Operations-RTR', sub: '4.4.4.4' },

    // Switches
    'Passenger-SW': { x: 140, y: 310, type: 'switch', label: 'Passenger-SW', sub: 'VLAN 10' },
    'Security-SW': { x: 1020, y: 310, type: 'switch', label: 'Security-SW', sub: 'VLAN 20' },
    'Operations-SW': { x: 580, y: 620, type: 'switch', label: 'Operations-SW', sub: 'VLAN 30' },
    'Admin-SW': { x: 880, y: 140, type: 'switch', label: 'Admin-SW', sub: 'VLAN 40' },

    // End Devices
    'Passenger-PC': { x: 40, y: 450, type: 'pc', label: 'Passenger-PC', sub: '192.168.10.10' },
    'Security-PC': { x: 1120, y: 450, type: 'pc', label: 'Security-PC', sub: '192.168.20.10' },
    'Operations-PC': { x: 740, y: 640, type: 'pc', label: 'Operations-PC', sub: '192.168.30.10' },
    'Admin-PC': { x: 880, y: 26, type: 'pc', label: 'Admin-PC', sub: '192.168.40.10' },
    'DNS-Server': { x: 1060, y: 140, type: 'server', label: 'DNS Server', sub: '192.168.40.20' },
  };

  // Mouse pan handlers
  const handleMouseDown = (e) => {
    // Only drag when clicking canvas background, not nodes
    if (e.target.tagName === 'svg' || e.target.id === 'workspace-bg' || e.target.id === 'grid-pattern') {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingRef.current) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Active packet current location with smooth link interpolation
  const activePath = packetState.stage === 'RETURN' ? packetState.returnPath : packetState.path;
  const currentHopNode = activePath ? activePath[packetState.currentHopIndex] : null;

  let packetX = 0;
  let packetY = 0;
  let isPacketVisible = false;

  if (packetState.active && packetState.status !== 'IDLE') {
    const fromId = packetState.fromNode || currentHopNode;
    const toId = packetState.toNode || fromId;
    const fromPos = fromId ? nodePositions[fromId] : null;
    const toPos = toId ? nodePositions[toId] : fromPos;
    const progress = typeof packetState.animProgress === 'number' ? Math.max(0, Math.min(1, packetState.animProgress)) : 0;

    if (fromPos && toPos) {
      packetX = fromPos.x + progress * (toPos.x - fromPos.x);
      packetY = fromPos.y + progress * (toPos.y - fromPos.y);
      isPacketVisible = true;
    } else if (fromPos) {
      packetX = fromPos.x;
      packetY = fromPos.y;
      isPacketVisible = true;
    }
  }

  // Active traversed link
  const activeLink = useMemo(() => {
    if (!packetState.active || packetState.status === 'IDLE') return null;
    if (packetState.currentLink) return packetState.currentLink;
    const fromId = packetState.fromNode;
    const toId = packetState.toNode;
    if (fromId && toId && fromId !== toId) {
      return getLinkBetween(fromId, toId);
    }
    return null;
  }, [packetState.active, packetState.status, packetState.currentLink, packetState.fromNode, packetState.toNode]);

  return (
    <div
      className="simulator-canvas-wrapper"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        cursor: isDraggingRef.current ? 'grabbing' : 'default',
        background: 'var(--bg)',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        style={{ width: '100%', height: '100%', display: 'block' }}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Packet Tracer Style Engineering Grid */}
          <pattern id="simGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--border)" strokeWidth="0.6" opacity="0.45" />
          </pattern>

          {/* Area 0 Hatching Pattern */}
          <pattern id="simArea0" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 0 24 L 24 0" fill="none" stroke="var(--accent-bg)" strokeWidth="1" />
          </pattern>

          {/* Glowing Filter for Moving PDU */}
          <filter id="pduGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Scaled & Panned Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background Grid */}
          <rect id="workspace-bg" x="-1000" y="-1000" width="3200" height="2700" fill="url(#simGrid)" />

          {/* OSPF Area 0 Diamond Enclosure */}
          <polygon
            points="580,70 940,310 580,550 220,310"
            fill="url(#simArea0)"
            stroke="var(--accent-border)"
            strokeWidth="1.8"
            strokeDasharray="6 4"
            opacity="0.8"
          />
          <text
            x="580"
            y="285"
            textAnchor="middle"
            fontSize="14"
            fill="var(--accent)"
            fontFamily="var(--mono)"
            fontWeight="800"
            letterSpacing="0.1em"
          >
            OSPF AREA 0 (BACKBONE)
          </text>
          <text
            x="580"
            y="305"
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-m)"
            fontFamily="var(--mono)"
          >
            Process 1 · 10.0.0.0/29 Point-to-Point Links
          </text>

          {/* LAN Shading Containers */}
          {/* Passenger LAN */}
          <rect x="15" y="240" width="220" height="250" rx="12" fill="rgba(14, 165, 233, 0.05)" stroke="var(--passenger)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="30" y="260" fontSize="11" fill="var(--passenger)" fontFamily="var(--mono)" fontWeight="700">Passenger VLAN 10 (192.168.10.0/24)</text>

          {/* Security LAN */}
          <rect x="940" y="240" width="230" height="250" rx="12" fill="rgba(239, 68, 68, 0.05)" stroke="var(--security)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="955" y="260" fontSize="11" fill="var(--security)" fontFamily="var(--mono)" fontWeight="700">Security VLAN 20 (192.168.20.0/24)</text>

          {/* Operations LAN */}
          <rect x="470" y="580" width="370" height="110" rx="12" fill="rgba(245, 158, 11, 0.05)" stroke="var(--operations)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="490" y="600" fontSize="11" fill="var(--operations)" fontFamily="var(--mono)" fontWeight="700">Operations VLAN 30 (192.168.30.0/24)</text>

          {/* Admin & DNS LAN */}
          <rect x="760" y="10" width="380" height="170" rx="12" fill="rgba(139, 92, 246, 0.05)" stroke="var(--administration)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="780" y="30" fontSize="11" fill="var(--administration)" fontFamily="var(--mono)" fontWeight="700">Admin & DNS VLAN 40 (192.168.40.0/24)</text>

          {/* Render All Network Links */}
          {NETWORK_LINKS.map((link) => {
            const pFrom = nodePositions[link.from];
            const pTo = nodePositions[link.to];
            if (!pFrom || !pTo) return null;

            const isFailed = failedLinks.has(link.id) || (link.lanId && failedLinks.has(link.lanId));
            const isRecovering = recoveringLinks.has(link.id);
            const isTraversing = activeLink && activeLink.id === link.id;

            let strokeColor = isFailed ? 'var(--status-crit)' : isRecovering ? 'var(--status-warn)' : link.isBackbone ? 'var(--text-h)' : 'var(--text-m)';
            let strokeWidth = link.isBackbone ? 3 : 2;
            let strokeDash = isFailed ? '8 6' : isRecovering ? '6 4' : undefined;

            if (isTraversing) {
              strokeColor = '#06b6d4';
              strokeWidth = 4.5;
            }

            const midX = (pFrom.x + pTo.x) / 2;
            const midY = (pFrom.y + pTo.y) / 2;

            // Packet Tracer interface Link LEDs coordinates
            const dx = pTo.x - pFrom.x;
            const dy = pTo.y - pFrom.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const offset = 46;
            const ledFromX = pFrom.x + (dx / dist) * offset;
            const ledFromY = pFrom.y + (dy / dist) * offset;
            const ledToX = pTo.x - (dx / dist) * offset;
            const ledToY = pTo.y - (dy / dist) * offset;

            return (
              <g
                key={link.id}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  onSelectEntity({ type: 'link', id: link.id });
                  if (link.isBackbone) onToggleLink(link.id);
                }}
              >
                {/* Click target line */}
                <line x1={pFrom.x} y1={pFrom.y} x2={pTo.x} y2={pTo.y} stroke="transparent" strokeWidth="18" />

                {/* Visible link wire */}
                <line
                  x1={pFrom.x}
                  y1={pFrom.y}
                  x2={pTo.x}
                  y2={pTo.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  opacity={isFailed ? 0.75 : 0.9}
                />

                {/* Packet Tracer style Port Link LEDs (Green Triangles or Red Circles) */}
                {/* From Port LED */}
                {isFailed ? (
                  <circle cx={ledFromX} cy={ledFromY} r="4.5" fill="var(--status-crit)" />
                ) : (
                  <polygon
                    points={`${ledFromX},${ledFromY - 4.5} ${ledFromX - 4.5},${ledFromY + 4.5} ${ledFromX + 4.5},${ledFromY + 4.5}`}
                    fill="var(--status-ok)"
                  />
                )}

                {/* To Port LED */}
                {isFailed ? (
                  <circle cx={ledToX} cy={ledToY} r="4.5" fill="var(--status-crit)" />
                ) : (
                  <polygon
                    points={`${ledToX},${ledToY - 4.5} ${ledToX - 4.5},${ledToY + 4.5} ${ledToX + 4.5},${ledToY + 4.5}`}
                    fill="var(--status-ok)"
                  />
                )}

                {/* Backbone Link Label */}
                {link.isBackbone && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-60"
                      y="-12"
                      width="120"
                      height="22"
                      rx="4"
                      fill="var(--bg-elev)"
                      stroke={isFailed ? 'var(--status-crit)' : 'var(--border)'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fontSize="9.5"
                      fontFamily="var(--mono)"
                      fontWeight="700"
                      fill={isFailed ? 'var(--status-crit)' : 'var(--text-h)'}
                    >
                      {isFailed ? 'DOWN' : link.subnet}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render All Devices */}
          {Object.entries(nodePositions).map(([nodeId, pos]) => {
            const isSelected = selectedEntity && selectedEntity.id === nodeId;
            const isCurrentHop = currentHopNode === nodeId;
            const dev = NETWORK_DEVICES[nodeId] || {};

            return (
              <g
                key={nodeId}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectEntity({ type: dev.type || 'device', id: nodeId })}
              >
                {/* Selected Halo Ring */}
                {isSelected && (
                  <circle r="44" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray="4 3">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Active Packet Hop Ping Wave */}
                {isCurrentHop && (
                  <circle r="48" fill="none" stroke="#06b6d4" strokeWidth="3">
                    <animate attributeName="r" values="32;54;32" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Device Graphics */}
                {pos.type === 'router' && (
                  // Cisco Router Symbol (Blue Cylinder with 4 Arrows)
                  <g>
                    <ellipse cx="0" cy="0" rx="30" ry="24" fill="var(--bg-elev)" stroke="#0284c7" strokeWidth="2.5" />
                    {/* Cisco Router Arrow Cross */}
                    <g fill="#0284c7">
                      <path d="M 0 -16 L -4 -10 L -1 -10 L -1 -3 L 1 -3 L 1 -10 L 4 -10 Z" />
                      <path d="M 0 16 L -4 10 L -1 10 L -1 3 L 1 3 L 1 10 L 4 10 Z" />
                      <path d="M -16 0 L -10 -4 L -10 -1 L -3 -1 L -3 1 L -10 1 L -10 4 Z" />
                      <path d="M 16 0 L 10 -4 L 10 -1 L 3 -1 L 3 1 L 10 1 L 10 4 Z" />
                    </g>
                  </g>
                )}

                {pos.type === 'switch' && (
                  // Cisco Switch Symbol (Rectangle with port arrows)
                  <g>
                    <rect x="-30" y="-18" width="60" height="36" rx="4" fill="var(--bg-elev)" stroke="#2563eb" strokeWidth="2.2" />
                    <path d="M -20 -8 L 20 -8 M 16 -12 L 20 -8 L 16 -4" stroke="#2563eb" strokeWidth="1.8" fill="none" />
                    <path d="M 20 8 L -20 8 M -16 4 L -20 8 L -16 12" stroke="#2563eb" strokeWidth="1.8" fill="none" />
                  </g>
                )}

                {pos.type === 'pc' && (
                  // Desktop PC
                  <g>
                    <rect x="-20" y="-18" width="40" height="28" rx="3" fill="var(--bg-elev)" stroke="var(--passenger)" strokeWidth="2" />
                    <rect x="-16" y="-14" width="32" height="20" rx="2" fill="var(--passenger)" opacity="0.18" />
                    <line x1="0" y1="10" x2="0" y2="16" stroke="var(--passenger)" strokeWidth="2.5" />
                    <line x1="-10" y1="16" x2="10" y2="16" stroke="var(--passenger)" strokeWidth="2.5" strokeLinecap="round" />
                  </g>
                )}

                {pos.type === 'server' && (
                  // Server Rack Tower
                  <g>
                    <rect x="-18" y="-22" width="36" height="44" rx="4" fill="var(--bg-elev)" stroke="var(--administration)" strokeWidth="2" />
                    <line x1="-12" y1="-8" x2="12" y2="-8" stroke="var(--administration)" strokeWidth="1.5" />
                    <line x1="-12" y1="4" x2="12" y2="4" stroke="var(--administration)" strokeWidth="1.5" />
                    <circle cx="8" cy="-14" r="2" fill="var(--status-ok)" />
                    <circle cx="8" cy="-2" r="2" fill="var(--status-ok)" />
                    <circle cx="8" cy="10" r="2" fill="var(--passenger)" />
                  </g>
                )}

                {/* Device Labels */}
                <text x="0" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-h)" fontFamily="var(--mono)">
                  {nodeId}
                </text>
                <text x="0" y="50" textAnchor="middle" fontSize="9.5" fill="var(--text-m)" fontFamily="var(--mono)">
                  {pos.sub}
                </text>
              </g>
            );
          })}

          {/* Animated Packet Tracer PDU Envelope */}
          {isPacketVisible && (
            <g transform={`translate(${packetX}, ${packetY - 14})`} filter="url(#pduGlow)" style={{ pointerEvents: 'none' }}>
              {/* Cisco Packet Tracer Envelope Icon */}
              <rect
                x="-18"
                y="-13"
                width="36"
                height="26"
                rx="4"
                fill={
                  packetState.status === 'DROPPED'
                    ? '#ef4444'
                    : packetState.stage === 'RETURN'
                    ? '#10b981'
                    : '#f59e0b'
                }
                stroke="#ffffff"
                strokeWidth="1.8"
              />
              <path d="M -18 -13 L 0 2 L 18 -13" fill="none" stroke="#ffffff" strokeWidth="1.8" />
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill="var(--text-h)"
                fontFamily="var(--mono)"
              >
                {packetState.protocol} {packetState.stage === 'RETURN' ? 'REPLY' : ''}
              </text>
              {packetState.status === 'DROPPED' && (
                <g>
                  <rect x="-35" y="16" width="70" height="18" rx="3" fill="#ef4444" />
                  <text x="0" y="29" textAnchor="middle" fontSize="9" fontWeight="800" fill="#ffffff" fontFamily="var(--mono)">
                    DROPPED
                  </text>
                </g>
              )}
              {packetState.status === 'DELIVERED' && (
                <g>
                  <rect x="-38" y="16" width="76" height="18" rx="3" fill="#10b981" />
                  <text x="0" y="29" textAnchor="middle" fontSize="9" fontWeight="800" fill="#ffffff" fontFamily="var(--mono)">
                    DELIVERED
                  </text>
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
