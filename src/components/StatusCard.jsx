function Badge({ status, label }) {
  const map = {
    OK: 'badge-ok',
    WARN: 'badge-warn',
    FAILOVER: 'badge-warn',
    CRIT: 'badge-crit',
    DOWN: 'badge-crit',
    INFO: 'badge-info',
    STANDBY: 'badge-idle',
  };
  const cls = map[status] || 'badge-idle';
  return (
    <span className={`badge ${cls}`}>
      <span className="led" />
      {label || status}
    </span>
  );
}

function progressClass(pct) {
  if (pct >= 85) return 'crit';
  if (pct >= 65) return 'warn';
  return 'ok';
}

function UtilBar({ value, color }) {
  const cls = color ? '' : progressClass(value);
  const style = color ? { background: color } : undefined;
  return (
    <div className={`progress ${cls}`} style={{ margin: '6px 0' }}>
      <span style={{ width: `${Math.min(100, value)}%`, ...style }} />
    </div>
  );
}

export function OverallHealthCard({ summary, metrics, failedLinksCount = 0 }) {
  const {
    routersTotal,
    routersUp,
    switchesTotal,
    switchesUp,
    networksTotal,
    networksUp,
    hostsTotal,
    hostsActive,
    ospfAdjacencies,
    activeRedundantPaths,
    healthScore = 100,
  } = summary;

  const totalBackboneLinks = 4;
  const operationalLinks = Math.max(0, totalBackboneLinks - failedLinksCount);
  const overallStatus = healthScore >= 95 ? 'OK' : healthScore >= 80 ? 'WARN' : 'CRIT';

  // Calculate simulated availability based on health score
  const simulatedAvailability = (99.0 + (healthScore / 100) * 0.99).toFixed(2);

  return (
    <div className="card">
      <div className="accent-bar" style={{ background: 'linear-gradient(180deg, var(--accent), var(--accent-2))' }} />
      <div className="card-head">
        <div className="card-title">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Overall Network Health
          </h3>
          <span className="sub">Airport Campus NOC · OSPF Area 0 (Simulated Telemetry)</span>
        </div>
        <Badge status={overallStatus} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div
          className="donut"
          style={{
            '--p': healthScore,
            '--c':
              overallStatus === 'OK'
                ? 'var(--status-ok)'
                : overallStatus === 'WARN'
                ? 'var(--status-warn)'
                : 'var(--status-crit)',
            flexShrink: 0,
          }}
        >
          <span>{healthScore}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="stat-row">
            <span className="lbl">Backbone Links</span>
            <span className="val" style={{ fontWeight: 700, color: failedLinksCount > 0 ? 'var(--status-warn)' : 'var(--status-ok)' }}>
              {operationalLinks}/{totalBackboneLinks} UP
            </span>
          </div>
          <div className="stat-row">
            <span className="lbl">OSPF Routers</span>
            <span className="val">{routersUp}/{routersTotal}</span>
          </div>
          <div className="stat-row">
            <span className="lbl">Campus Switches</span>
            <span className="val">{switchesUp}/{switchesTotal}</span>
          </div>
          <div className="stat-row">
            <span className="lbl">Active Faults</span>
            <span className="val" style={{ color: failedLinksCount > 0 ? 'var(--status-crit)' : 'var(--status-ok)', fontWeight: 700 }}>
              {failedLinksCount} Active
            </span>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <span className="k-label">OSPF Adjacencies</span>
          <span className="k-value">{ospfAdjacencies}</span>
        </div>
        <div className="kpi">
          <span className="k-label">Redundant Paths</span>
          <span className="k-value">{activeRedundantPaths} Active</span>
        </div>
        <div className="kpi">
          <span className="k-label">Simulated Uptime</span>
          <span className="k-value" style={{ color: 'var(--status-ok)' }}>{simulatedAvailability}%</span>
        </div>
        <div className="kpi">
          <span className="k-label">Packets Delivered</span>
          <span className="k-value" style={{ color: 'var(--status-ok)' }}>
            {metrics ? `${metrics.packetsDelivered}/${metrics.packetsSent}` : '0/0'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DepartmentCard({ network }) {
  const {
    name,
    subnet,
    gateway,
    vlan,
    color,
    hostsTotal,
    hostsActive,
    utilization,
    router,
    status,
    description,
    sampleHosts,
    note,
  } = network;

  return (
    <div className="card">
      <div className="accent-bar" style={{ background: color }} />
      <div className="card-head">
        <div className="card-title">
          <h3>{name}</h3>
          <span className="sub">{subnet} · VLAN {vlan}</span>
        </div>
        <Badge status={note ? 'WARN' : status} label={note || status} />
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--text-m)', marginBottom: 10 }}>{description}</p>

      <div className="stat-row"><span className="lbl">Default GW</span><span className="val">{gateway}</span></div>
      <div className="stat-row"><span className="lbl">Router</span><span className="val">{router}</span></div>
      <div className="stat-row"><span className="lbl">Hosts Active</span><span className="val">{hostsActive}/{hostsTotal}</span></div>

      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-m)', marginBottom: 2 }}>
          <span>Bandwidth Utilization</span>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--text-h)' }}>{utilization}%</span>
        </div>
        <UtilBar value={utilization} color={color} />
      </div>

      <div className="hosts-row">
        {sampleHosts.map((h) => (
          <div className="host-pill" key={h.ip}>
            <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{h.name}</span>
            <span className="rip">{h.ip}</span>
            <span className="reach">Reachable</span>
          </div>
        ))}
      </div>
    </div>
  );
}
