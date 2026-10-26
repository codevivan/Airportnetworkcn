function pathCardClass(status) {
  if (status.startsWith('ACTIVE')) return 'path-card active';
  if (status.includes('DEGRADED') || status.includes('DOWN')) return 'path-card degraded';
  return 'path-card standby';
}

function Hop({ node }) {
  const isRouter = node.includes('RTR') || node.startsWith('R');
  const isSwitch = node.includes('SW');
  return (
    <span className={`hop ${isRouter ? 'router' : isSwitch ? 'sw' : 'pc'}`}>
      {node}
    </span>
  );
}

export default function RedundantRoutes({ paths, failedLinks }) {
  const hasFailures = failedLinks && failedLinks.size > 0;
  const isCoreSecDown = failedLinks && failedLinks.has('core-security');
  const isCorePassDown = failedLinks && failedLinks.has('core-passenger');

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <h3>Redundant Route & ECMP Status</h3>
          <span className="sub">Destination Subnet: 192.168.30.0/24 (Flight Operations Network)</span>
        </div>
        {hasFailures ? (
          <span className="badge badge-warn">
            <span className="led" />Failover Active
          </span>
        ) : (
          <span className="badge badge-ok">
            <span className="led" />Equal-Cost Multi-Path Active
          </span>
        )}
      </div>

      <div className="path-row">
        {paths.map((p) => {
          const isActive = p.status.startsWith('ACTIVE');
          const isDegraded = p.status.includes('DEGRADED') || p.status.includes('DOWN');
          return (
            <div className={pathCardClass(p.status)} key={p.id}>
              <div className="path-head">
                <h4>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: isActive
                        ? 'var(--status-ok)'
                        : isDegraded
                        ? 'var(--status-crit)'
                        : 'var(--status-idle)',
                      display: 'inline-block',
                      boxShadow: isActive ? '0 0 0 3px var(--status-ok-bg)' : undefined,
                    }}
                  />
                  {p.label}
                </h4>
                <div className="pmeta">
                  <span>METRIC {p.metric}</span>
                  <span>{p.latencyMs}ms</span>
                  <span
                    className={
                      isActive ? 'sev-OK' : isDegraded ? 'sev-CRIT' : 'sev-WARN'
                    }
                  >
                    {p.status}
                  </span>
                </div>
              </div>

              <div className="hop-chain">
                {p.hops.map((h, idx) => (
                  <span key={`${p.id}-${h}-${idx}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Hop node={h} />
                    {idx < p.hops.length - 1 && <span className="hop-arrow">→</span>}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: 11.5, color: 'var(--text-m)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                Links: {p.links.join(' · ')}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="kpi">
          <span className="k-label">OSPF ECMP Status</span>
          <span className="k-value" style={{ fontSize: 14 }}>
            {!hasFailures
              ? 'Active: 2 Equal-Cost Paths (Metric 20)'
              : isCoreSecDown
              ? 'Degraded: Path via Passenger-RTR active'
              : isCorePassDown
              ? 'Degraded: Path via Security-RTR active'
              : 'Recalculating alternative path'}
          </span>
        </div>
        <div className="kpi">
          <span className="k-label">OSPF Convergence Interval</span>
          <span className="k-value" style={{ fontSize: 14 }}>
            {hasFailures ? '≈ 3.5s (SPF Recomputed)' : 'Sub-second forwarding'}
          </span>
        </div>
      </div>
    </div>
  );
}
