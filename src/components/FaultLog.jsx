import { useState } from 'react';

export default function FaultLog({
  faultLog,
  onClearLog,
  onSelectEvent,
}) {
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filteredLog = faultLog.filter((e) => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'PACKETS') return e.category === 'PACKET';
    if (filterCategory === 'ROUTING') return e.category === 'ROUTING';
    if (filterCategory === 'FAULTS') return e.category === 'FAULT';
    if (filterCategory === 'RECOVERY') return e.category === 'RECOVERY';
    return true;
  });

  const counts = faultLog.reduce(
    (acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    },
    { OK: 0, INFO: 0, WARN: 0, CRIT: 0 }
  );

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <h3>Event Timeline & NOC Audit Log</h3>
          <span className="sub">Real-time OSPF, link failure, packet forwarding, and recovery events</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {counts.CRIT > 0 && <span className="badge badge-crit"><span className="led" />CRIT {counts.CRIT}</span>}
          {counts.WARN > 0 && <span className="badge badge-warn"><span className="led" />WARN {counts.WARN}</span>}
          {counts.INFO > 0 && <span className="badge badge-info"><span className="led" />INFO {counts.INFO}</span>}
          {counts.OK > 0 && <span className="badge badge-ok"><span className="led" />OK {counts.OK}</span>}
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['ALL', 'PACKETS', 'ROUTING', 'FAULTS', 'RECOVERY'].map((cat) => (
            <button
              key={cat}
              className={`btn ${filterCategory === cat ? 'btn-primary' : ''}`}
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => setFilterCategory(cat)}
            >
              {cat === 'ALL' ? 'All Events' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {onClearLog && (
          <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={onClearLog}>
            🗑 Clear Log
          </button>
        )}
      </div>

      {/* Log Table */}
      <div className="log-wrap" style={{ maxHeight: 340, overflowY: 'auto' }}>
        <table>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th style={{ width: 155 }}>Timestamp</th>
              <th style={{ width: 80 }}>Severity</th>
              <th style={{ width: 90 }}>Category</th>
              <th style={{ width: 160 }}>Source Device</th>
              <th>Event Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredLog.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-m)', padding: '24px 0' }}>
                  No events recorded under filter "{filterCategory}".
                </td>
              </tr>
            ) : (
              filteredLog.map((e, i) => (
                <tr
                  key={i}
                  style={{
                    cursor: onSelectEvent ? 'pointer' : 'default',
                    background:
                      e.severity === 'CRIT'
                        ? 'var(--status-crit-bg)'
                        : e.severity === 'WARN'
                        ? 'var(--status-warn-bg)'
                        : e.severity === 'OK'
                        ? 'var(--status-ok-bg)'
                        : undefined,
                  }}
                  onClick={() => onSelectEvent && onSelectEvent({ type: 'event', data: e })}
                  title="Click to view details in inspector"
                >
                  <td className="ts-cell">{e.ts}</td>
                  <td className={`sev-cell sev-${e.severity}`}>{e.severity}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>
                    {e.category || 'SYSTEM'}
                  </td>
                  <td className="src-cell">{e.source}</td>
                  <td style={{ color: 'var(--text-h)' }}>{e.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-m)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span>• Showing: <span style={{ color: 'var(--text-h)', fontFamily: 'var(--mono)' }}>{filteredLog.length}</span> of {faultLog.length} events</span>
        <span>• Click any row to inspect in the Inspector panel.</span>
        <span>• Deterministic event logging synchronized with network simulation state.</span>
      </div>
    </div>
  );
}
