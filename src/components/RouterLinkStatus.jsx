function ifaceBadge(status, protocol) {
  const up = status === 'UP' && protocol === 'UP';
  return (
    <span className={`iface-status ${up ? 'up' : 'down'}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: 'currentColor',
      }} />
      {status}/{protocol}
    </span>
  );
}

export default function RouterLinkStatus({ routers, switches }) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <h3>Router & Link Status</h3>
          <span className="sub">4 Routers · 4 Switches · Point-to-Point + LAN Interfaces</span>
        </div>
        <span className="badge badge-ok"><span className="led" />All Interfaces Monitored</span>
      </div>

      <div className="routers-grid">
        {routers.map((r) => {
          const downCount = r.interfaces.filter((i) => i.status !== 'UP' || i.protocol !== 'UP').length;
          return (
            <div className="router-card" key={r.id}>
              <h4>
                <span style={{ fontFamily: 'var(--mono)' }}>{r.id}</span>
                {downCount > 0
                  ? <span className="badge badge-crit"><span className="led" />{downCount} DOWN</span>
                  : <span className="badge badge-ok"><span className="led" />Healthy</span>}
              </h4>
              <div className="router-id">Router ID {r.routerId}</div>
              {r.interfaces.map((i) => (
                <div className="iface" key={i.name}>
                  <span className="iname">{i.name}</span>
                  <span className="iip">{i.ip}</span>
                  {ifaceBadge(i.status, i.protocol)}
                  <span className="ito">→ {i.to}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="switches-row">
        {switches.map((sw) => (
          <div className="sw-chip" key={sw.id}>
            <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{sw.id}</span>
              <span className="badge badge-ok"><span className="led" />{sw.status}</span>
            </strong>
            <span>Uplink: {sw.uplink}</span>
            <span>VLAN {sw.vlan} · {sw.hosts} host ports</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-m)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span>• Backbone bandwidth: <span style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>1 Gbps</span></span>
        <span>• LAN access: <span style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>1 Gbps</span></span>
        <span>• Duplex: <span style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>Full</span> on all links</span>
      </div>
    </div>
  );
}
