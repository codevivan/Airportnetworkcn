import { useState } from 'react';

function stateBadge(state) {
  const s = String(state);
  if (s.startsWith('FULL')) return <span className="badge badge-ok"><span className="led" />{s}</span>;
  if (s === 'DOWN') return <span className="badge badge-crit"><span className="led" />{s}</span>;
  if (s === 'RECOVERING' || s === 'LOADING' || s === 'EXCHANGE' || s.startsWith('2-WAY')) {
    return <span className="badge badge-warn"><span className="led" />{s}</span>;
  }
  return <span className="badge badge-info"><span className="led" />{s}</span>;
}

export default function OSPFStatus({ neighbors, routingTables }) {
  const [activeRouterTab, setActiveRouterTab] = useState('Airport-Core-RTR');

  const fullCount = neighbors.filter((n) => String(n.state).startsWith('FULL')).length;
  const downCount = neighbors.filter((n) => String(n.state) === 'DOWN').length;
  const recoveringCount = neighbors.filter((n) => String(n.state) === 'RECOVERING').length;

  const currentRoutes = (routingTables && routingTables[activeRouterTab]) || [];

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <h3>OSPF Area 0 Neighbor & Routing Table Monitor</h3>
          <span className="sub">Process ID 1 · Backbone Area 0 · Dynamic SPF Routing</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="badge badge-ok">
            <span className="led" />FULL {fullCount}/{neighbors.length}
          </span>
          {downCount > 0 && (
            <span className="badge badge-crit">
              <span className="led" />DOWN {downCount}
            </span>
          )}
          {recoveringCount > 0 && (
            <span className="badge badge-warn">
              <span className="led" />RECOVERING {recoveringCount}
            </span>
          )}
        </div>
      </div>

      {/* Neighbor Adjacency Table */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-h)', marginBottom: 8 }}>
          OSPF Neighbor Adjacencies (Hello: 10s · Dead: 40s):
        </div>
        <div className="metric-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Local Router</th>
                <th>Interface</th>
                <th>Neighbor</th>
                <th>Neighbor IP</th>
                <th>Adjacency State</th>
                <th>Area</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {neighbors.map((n, i) => (
                <tr
                  key={`${n.router}-${n.neighborId}-${i}`}
                  style={
                    String(n.state) === 'DOWN'
                      ? { background: 'var(--status-crit-bg)' }
                      : String(n.state) === 'RECOVERING'
                      ? { background: 'var(--status-warn-bg)' }
                      : undefined
                  }
                >
                  <td style={{ fontWeight: 600, fontFamily: 'var(--mono)' }}>{n.router}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{n.iface}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>
                    {n.neighbor}
                    <span style={{ color: 'var(--text-m)', fontSize: 11, marginLeft: 6 }}>({n.neighborId})</span>
                  </td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{n.ip}</td>
                  <td>{stateBadge(n.state)}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{n.area}</td>
                  <td style={{ fontFamily: 'var(--mono)', color: 'var(--text-m)' }}>{n.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Simulated Routing Tables */}
      <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-h)' }}>
            Simulated Routing Information Base (RIB / Routing Table):
          </div>
          {/* Router Tab Selectors */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['Airport-Core-RTR', 'Passenger-RTR', 'Security-RTR', 'Operations-RTR'].map((rId) => (
              <button
                key={rId}
                className={`btn ${activeRouterTab === rId ? 'btn-primary' : ''}`}
                style={{ padding: '4px 10px', fontSize: 11.5 }}
                onClick={() => setActiveRouterTab(rId)}
              >
                {rId}
              </button>
            ))}
          </div>
        </div>

        <div className="metric-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Destination Subnet</th>
                <th>Department / Purpose</th>
                <th>Next Hop</th>
                <th>Outgoing Interface</th>
                <th>OSPF Metric</th>
                <th>Route Status</th>
              </tr>
            </thead>
            <tbody>
              {currentRoutes.map((rt, idx) => (
                <tr
                  key={idx}
                  style={rt.status === 'UNREACHABLE' ? { background: 'var(--status-crit-bg)' } : undefined}
                >
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: rt.type.startsWith('C') ? 'var(--status-ok)' : 'var(--accent)' }}>
                    {rt.type}
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{rt.prefix}</td>
                  <td>{rt.desc}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{rt.nextHop}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{rt.iface}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>
                    {rt.metric === Infinity ? 'Unreachable' : rt.metric}
                  </td>
                  <td>
                    <span className={rt.status === 'ACTIVE' ? 'badge badge-ok' : 'badge badge-crit'}>
                      <span className="led" />
                      {rt.status}
                    </span>
                    {rt.note && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                        {rt.note}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-m)' }}>
        <span>• <span style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>4 / 4</span> routers in Area 0</span>
        <span>• Convergence algorithm: <span style={{ color: 'var(--text-h)' }}>Dijkstra Shortest Path First (SPF)</span></span>
        <span>• Equal-Cost Multi-Path (ECMP): <span style={{ color: 'var(--text-h)' }}>Supported across diamond paths</span></span>
        <span>• SPF runs: <span style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>{downCount > 0 ? 12 : 2}</span></span>
      </div>
    </div>
  );
}
