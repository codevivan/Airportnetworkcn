function donutColor(lossPct = 0) {
  if (lossPct <= 0.01) return 'var(--status-ok)';
  if (lossPct < 1) return 'var(--status-warn)';
  return 'var(--status-crit)';
}

function donutPercent(lossPct = 0) {
  return Math.min(100, Math.max(0, lossPct * 10));
}

export function PacketLossPanel({ packetLoss = {} }) {
  const overall = packetLoss.overall ?? 0;
  const perRouter = packetLoss.perRouter || {};
  const perNetwork = packetLoss.perNetwork || {};

  const items = [
    { label: 'Overall', value: overall },
    { label: 'Core RTR', value: perRouter['Airport-Core-RTR'] ?? perRouter.R0 ?? 0 },
    { label: 'Passenger RTR', value: perRouter['Passenger-RTR'] ?? perRouter.R1 ?? 0 },
    { label: 'Security RTR', value: perRouter['Security-RTR'] ?? perRouter.R2 ?? 0 },
    { label: 'Operations RTR', value: perRouter['Operations-RTR'] ?? perRouter.R3 ?? 0 },
  ];

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <h3>Packet Loss Monitoring</h3>
          <span className="sub">ICMP Echo Probes · 5-min Sample Window</span>
        </div>
        <span className={overall <= 0.01 ? 'badge badge-ok' : overall < 1 ? 'badge badge-warn' : 'badge badge-crit'}>
          <span className="led" />{(Number(overall) || 0).toFixed(2)}%
        </span>
      </div>

      <div className="gauge-row">
        {items.map((g) => {
          const val = Number(g.value) || 0;
          return (
            <div className="gauge" key={g.label}>
              <h4>{g.label}</h4>
              <div
                className="donut"
                style={{
                  '--p': donutPercent(val),
                  '--c': donutColor(val),
                }}
              >
                <span>{val.toFixed(2)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="metric-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Department LAN</th>
              <th>Subnet</th>
              <th>Loss %</th>
              <th>Probes Sent</th>
              <th>Probes Lost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: 'var(--passenger)', fontWeight: 600 }}>Passenger Services</td>
              <td style={{ fontFamily: 'var(--mono)' }}>192.168.10.0/24</td>
              <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                {(Number(perNetwork.passenger) || 0).toFixed(2)}%
              </td>
              <td style={{ fontFamily: 'var(--mono)' }}>1000</td>
              <td style={{ fontFamily: 'var(--mono)' }}>{Math.round((Number(perNetwork.passenger) || 0) * 10)}</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--security)', fontWeight: 600 }}>Security & Surveillance</td>
              <td style={{ fontFamily: 'var(--mono)' }}>192.168.20.0/24</td>
              <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                {(Number(perNetwork.security) || 0).toFixed(2)}%
              </td>
              <td style={{ fontFamily: 'var(--mono)' }}>1000</td>
              <td style={{ fontFamily: 'var(--mono)' }}>{Math.round((Number(perNetwork.security) || 0) * 10)}</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--operations)', fontWeight: 600 }}>Flight Operations</td>
              <td style={{ fontFamily: 'var(--mono)' }}>192.168.30.0/24</td>
              <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                {(Number(perNetwork.operations) || 0).toFixed(2)}%
              </td>
              <td style={{ fontFamily: 'var(--mono)' }}>1000</td>
              <td style={{ fontFamily: 'var(--mono)' }}>{Math.round((Number(perNetwork.operations) || 0) * 10)}</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--administration)', fontWeight: 600 }}>Administration & DNS</td>
              <td style={{ fontFamily: 'var(--mono)' }}>192.168.40.0/24</td>
              <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
                {(Number(perNetwork.administration) || 0).toFixed(2)}%
              </td>
              <td style={{ fontFamily: 'var(--mono)' }}>1000</td>
              <td style={{ fontFamily: 'var(--mono)' }}>{Math.round((Number(perNetwork.administration) || 0) * 10)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InterfaceErrorsPanel({ interfaceErrors = {} }) {
  const entries = Object.entries(interfaceErrors);

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <h3>Interface Error Counters</h3>
          <span className="sub">Per-Router Input/Output/CRC/Collisions (SNMP Counters)</span>
        </div>
        <span className="badge badge-ok"><span className="led" />Baseline: Clean</span>
      </div>

      <div className="error-grid">
        {entries.map(([rid, rawEr]) => {
          const er = rawEr || { input: 0, output: 0, crc: 0, collisions: 0 };
          const input = Number(er.input) || 0;
          const output = Number(er.output) || 0;
          const crc = Number(er.crc) || 0;
          const collisions = Number(er.collisions) || 0;
          const hot = input + output + crc + collisions > 0;

          return (
            <div className="error-card" key={rid}>
              <div className="er-head">
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{rid}</span>
                {hot ? (
                  <span className="badge badge-warn"><span className="led" />Drifting</span>
                ) : (
                  <span className="badge badge-ok"><span className="led" />Clean</span>
                )}
              </div>
              <div className="er-body">
                <div className="er-stat">
                  <span className="er-l">Input</span>
                  <span className={`er-v ${input > 0 ? 'hot' : ''}`}>{input}</span>
                </div>
                <div className="er-stat">
                  <span className="er-l">Output</span>
                  <span className={`er-v ${output > 0 ? 'hot' : ''}`}>{output}</span>
                </div>
                <div className="er-stat">
                  <span className="er-l">CRC</span>
                  <span className={`er-v ${crc > 0 ? 'hot' : ''}`}>{crc}</span>
                </div>
                <div className="er-stat">
                  <span className="er-l">Collisions</span>
                  <span className={`er-v ${collisions > 0 ? 'hot' : ''}`}>{collisions}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-m)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span>• Counters cleared: <span style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>Today 06:00</span></span>
        <span>• Detection: <span style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>SNMP Polling / 30s</span></span>
        <span>• Action threshold: <span style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>CRC ≥ 100/min</span></span>
      </div>
    </div>
  );
}
