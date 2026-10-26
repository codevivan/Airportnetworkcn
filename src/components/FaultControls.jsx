export default function FaultControls({
  failedLinks,
  recoveringLinks,
  onSimulateCoreSecurity,
  onSimulateCorePassenger,
  onRestoreAll,
  onResetNetwork,
}) {
  const isCoreSecFailed = failedLinks.has('core-security');
  const isCorePassFailed = failedLinks.has('core-passenger');
  const hasFailures = failedLinks.size > 0;

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <h3>Fault Simulation & Recovery Controller</h3>
          <span className="sub">Inject Link Faults · Trigger OSPF Recalculation · Observe Dynamic Convergence</span>
        </div>
        {hasFailures ? (
          <span className="badge badge-crit">
            <span className="led" />
            {failedLinks.size} Active Fault{failedLinks.size > 1 ? 's' : ''}
          </span>
        ) : recoveringLinks.size > 0 ? (
          <span className="badge badge-warn">
            <span className="led" />
            Reconvergence in Progress
          </span>
        ) : (
          <span className="badge badge-ok">
            <span className="led" />
            Topology 100% Healthy
          </span>
        )}
      </div>

      {/* Dynamic Status / Alert Banner */}
      {hasFailures ? (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: 16,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-crit-bg)',
            border: '1px solid var(--status-crit)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 13,
          }}
        >
          <div>
            <strong style={{ color: 'var(--status-crit)' }}>⚠ ACTIVE NETWORK FAULT DETECTED: </strong>
            <span style={{ color: 'var(--text-h)' }}>
              {isCoreSecFailed && 'Core ↔ Security (192.168.1.4/30) is DOWN. '}
              {isCorePassFailed && 'Core ↔ Passenger (192.168.1.0/30) is DOWN. '}
              OSPF Dijkstra algorithm has updated the routing tables. Packets are taking alternative paths.
            </span>
          </div>
          <button className="btn btn-success" onClick={onRestoreAll} style={{ whiteSpace: 'nowrap' }}>
            ✓ Restore Links
          </button>
        </div>
      ) : recoveringLinks.size > 0 ? (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: 16,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-warn-bg)',
            border: '1px solid var(--status-warn)',
            fontSize: 13,
            color: 'var(--status-warn)',
          }}
        >
          <strong>⟳ OSPF ADJACENCY RECOVERY: </strong>
          LSA flooding and SPF calculation in progress. Adjacencies restoring to FULL state.
        </div>
      ) : (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: 16,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-ok-bg)',
            border: '1px solid var(--status-ok)',
            fontSize: 13,
            color: 'var(--status-ok)',
          }}
        >
          <strong>✓ NETWORK HEALTHY: </strong>
          All 4 backbone links and 8 OSPF neighbor adjacencies in Area 0 are in FULL operational state.
        </div>
      )}

      {/* Control Buttons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <button
          className={`btn ${isCoreSecFailed ? 'btn-success' : 'btn-danger'}`}
          onClick={onSimulateCoreSecurity}
          style={{ padding: '10px 14px', justifyContent: 'center', fontWeight: 600 }}
        >
          {isCoreSecFailed ? '✓ Restore Core-Security Link' : '⚠ Simulate Core-to-Security Failure'}
        </button>

        <button
          className={`btn ${isCorePassFailed ? 'btn-success' : 'btn-danger'}`}
          onClick={onSimulateCorePassenger}
          style={{ padding: '10px 14px', justifyContent: 'center', fontWeight: 600 }}
        >
          {isCorePassFailed ? '✓ Restore Core-Passenger Link' : '⚠ Simulate Core-to-Passenger Failure'}
        </button>

        <button
          className="btn btn-success"
          onClick={onRestoreAll}
          disabled={!hasFailures}
          style={{ padding: '10px 14px', justifyContent: 'center', fontWeight: 600 }}
        >
          ✓ Restore Failed Links
        </button>

        <button
          className="btn"
          onClick={onResetNetwork}
          style={{ padding: '10px 14px', justifyContent: 'center', fontWeight: 600 }}
        >
          ↺ Reset Entire Network
        </button>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-m)' }}>
        <span>
          Note: Faults directly trigger recalculations in OSPF neighbor states, routing tables, topology visualization, and packet forwarding paths.
        </span>
      </div>
    </div>
  );
}
