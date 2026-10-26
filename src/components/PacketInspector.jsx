import { NETWORK_DEVICES, NETWORK_LINKS } from '../utils/networkGraph.js';

export default function PacketInspector({
  packetState,
  selectedEntity,
  routers,
  ospfNeighbors,
  routingTables,
}) {
  const currentHopNode = packetState.path ? packetState.path[packetState.currentHopIndex] : null;
  const currentHopDevice = currentHopNode ? NETWORK_DEVICES[currentHopNode] : null;

  // Selected device info (from topology click)
  const selectedDevice = selectedEntity ? NETWORK_DEVICES[selectedEntity.id] : null;
  const selectedRouter = selectedEntity && selectedEntity.type === 'router'
    ? routers.find((r) => r.id === selectedEntity.id || r.name === selectedEntity.id)
    : null;
  const selectedLink = selectedEntity && selectedEntity.type === 'link'
    ? NETWORK_LINKS.find((l) => l.id === selectedEntity.id)
    : null;

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <h3>Packet & Entity Inspector</h3>
          <span className="sub">Live telemetry for in-flight packets and inspected network nodes</span>
        </div>
        {packetState.active ? (
          <span
            className={
              packetState.status === 'DELIVERED'
                ? 'badge badge-ok'
                : packetState.status === 'DROPPED'
                ? 'badge badge-crit'
                : 'badge badge-info'
            }
          >
            <span className="led" />
            {packetState.status}
          </span>
        ) : (
          <span className="badge badge-idle">Ready / Idle</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Packet Live Inspector */}
        <div
          style={{
            padding: 14,
            background: 'var(--bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>Active Packet Details</span>
            {packetState.id && <span style={{ fontFamily: 'var(--mono)' }}>{packetState.id}</span>}
          </div>

          {packetState.active ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div className="stat-row">
                <span className="lbl">Source</span>
                <span className="val" style={{ fontFamily: 'var(--mono)' }}>
                  {packetState.sourceId} ({NETWORK_DEVICES[packetState.sourceId]?.ip || 'Host'})
                </span>
              </div>
              <div className="stat-row">
                <span className="lbl">Destination</span>
                <span className="val" style={{ fontFamily: 'var(--mono)' }}>
                  {packetState.destId} ({NETWORK_DEVICES[packetState.destId]?.ip || 'airport.local'})
                </span>
              </div>
              <div className="stat-row">
                <span className="lbl">Protocol</span>
                <span className="val" style={{ fontFamily: 'var(--mono)' }}>{packetState.protocol}</span>
              </div>
              <div className="stat-row">
                <span className="lbl">Current Hop</span>
                <span className="val" style={{ fontWeight: 700, color: 'var(--text-h)' }}>
                  {currentHopNode || 'None'}
                </span>
              </div>
              <div className="stat-row">
                <span className="lbl">Hop Progress</span>
                <span className="val">
                  Hop {packetState.currentHopIndex + 1} of {packetState.path.length}
                </span>
              </div>
              <div className="stat-row">
                <span className="lbl">Current IP</span>
                <span className="val" style={{ fontFamily: 'var(--mono)' }}>
                  {currentHopDevice?.ip || currentHopDevice?.routerId || 'N/A'}
                </span>
              </div>

              {packetState.dropReason && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: 'var(--status-crit-bg)',
                    border: '1px solid var(--status-crit)',
                    color: 'var(--status-crit)',
                    fontWeight: 600,
                  }}
                >
                  ⚠ Drop Reason: {packetState.dropReason}
                </div>
              )}

              {/* Hop Chain */}
              <div style={{ marginTop: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-m)', fontWeight: 600 }}>HOP PATH:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                  {packetState.path.map((node, i) => {
                    const isPassed = i <= packetState.currentHopIndex;
                    const isCurrent = i === packetState.currentHopIndex;
                    return (
                      <span
                        key={node + i}
                        style={{
                          padding: '2px 7px',
                          borderRadius: 4,
                          fontSize: 10.5,
                          fontFamily: 'var(--mono)',
                          background: isCurrent
                            ? 'var(--accent)'
                            : isPassed
                            ? 'var(--status-ok-bg)'
                            : 'var(--bg-elev)',
                          color: isCurrent
                            ? '#fff'
                            : isPassed
                            ? 'var(--status-ok)'
                            : 'var(--text-m)',
                          border: '1px solid var(--border)',
                          fontWeight: isCurrent ? 700 : 500,
                        }}
                      >
                        {node}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-m)', fontStyle: 'italic', padding: '12px 0' }}>
              No packet currently in transit. Click a preset or "Send Packet" above to start live inspection.
            </p>
          )}
        </div>

        {/* Selected Node / Link Inspector */}
        <div
          style={{
            padding: 14,
            background: 'var(--bg)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-2)', marginBottom: 10 }}>
            Inspected Entity:{' '}
            <span style={{ color: 'var(--text-h)' }}>
              {selectedDevice?.name || selectedLink?.label || selectedEntity?.id || 'None Selected'}
            </span>
          </div>

          {selectedRouter ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div className="stat-row">
                <span className="lbl">Role</span>
                <span className="val">{selectedRouter.role}</span>
              </div>
              <div className="stat-row">
                <span className="lbl">Router ID</span>
                <span className="val" style={{ fontFamily: 'var(--mono)' }}>{selectedRouter.routerId}</span>
              </div>
              <div className="stat-row">
                <span className="lbl">OSPF Area</span>
                <span className="val">Area 0 (Backbone)</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-m)' }}>INTERFACES:</span>
                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedRouter.interfaces.map((iface) => (
                    <div
                      key={iface.name}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        background: 'var(--bg-elev)',
                        borderRadius: 4,
                        fontSize: 11,
                        fontFamily: 'var(--mono)',
                      }}
                    >
                      <span>
                        <strong>{iface.name}</strong> · {iface.ip}
                      </span>
                      <span className={iface.status === 'UP' ? 'sev-OK' : 'sev-CRIT'}>
                        {iface.status}/{iface.protocol}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedLink ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div className="stat-row">
                <span className="lbl">Endpoints</span>
                <span className="val">{selectedLink.from} ↔ {selectedLink.to}</span>
              </div>
              <div className="stat-row">
                <span className="lbl">Subnet / Type</span>
                <span className="val" style={{ fontFamily: 'var(--mono)' }}>{selectedLink.subnet || 'Access Link'}</span>
              </div>
              <div className="stat-row">
                <span className="lbl">Bandwidth</span>
                <span className="val">{selectedLink.bandwidth}</span>
              </div>
              <div className="stat-row">
                <span className="lbl">OSPF Cost</span>
                <span className="val">{selectedLink.cost * 10}</span>
              </div>
            </div>
          ) : selectedDevice ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div className="stat-row">
                <span className="lbl">Type</span>
                <span className="val">{selectedDevice.type.toUpperCase()}</span>
              </div>
              {selectedDevice.ip && (
                <div className="stat-row">
                  <span className="lbl">IP Address</span>
                  <span className="val" style={{ fontFamily: 'var(--mono)' }}>{selectedDevice.ip}</span>
                </div>
              )}
              {selectedDevice.gateway && (
                <div className="stat-row">
                  <span className="lbl">Default Gateway</span>
                  <span className="val" style={{ fontFamily: 'var(--mono)' }}>{selectedDevice.gateway}</span>
                </div>
              )}
              {selectedDevice.vlan && (
                <div className="stat-row">
                  <span className="lbl">VLAN</span>
                  <span className="val">VLAN {selectedDevice.vlan}</span>
                </div>
              )}
              {selectedDevice.role && (
                <div className="stat-row">
                  <span className="lbl">Role</span>
                  <span className="val">{selectedDevice.role}</span>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-m)', fontStyle: 'italic', padding: '12px 0' }}>
              Click any router, switch, PC, or link in the topology diagram to view interface states and configuration.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
