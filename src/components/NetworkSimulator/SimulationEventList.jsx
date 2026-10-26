import { useState } from 'react';

export default function SimulationEventList({
  eventHistory = [],
  userEvents = [],
  simTimeSec = 4.806,
  onSelectEvent,
  selectedEventIndex,
  onResetSimulation,
  onClearEvents,
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeProtocols, setActiveProtocols] = useState({
    ICMP: true,
    ARP: true,
    DNS: true,
    TCP: true,
    UDP: true,
    HTTP: true,
    OSPF: true,
  });

  const toggleProtocol = (proto) => {
    setActiveProtocols((prev) => ({ ...prev, [proto]: !prev[proto] }));
  };

  const handleSelectAll = (val) => {
    setActiveProtocols({
      ICMP: val,
      ARP: val,
      DNS: val,
      TCP: val,
      UDP: val,
      HTTP: val,
      OSPF: val,
    });
  };

  // Combine user events and active packet simulation steps
  const displayEvents = userEvents.filter((e) => {
    if (!activeProtocols[e.protocol] && e.protocol !== 'SYSTEM' && e.protocol !== 'FAULT') {
      return false;
    }
    if (filterType === 'ALL') return true;
    if (filterType === 'SUCCESS') return e.status === 'Success';
    if (filterType === 'FAILED') return e.status === 'Failed';
    return e.protocol === filterType;
  });

  return (
    <div
      className="simulation-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--bg-elev)',
        borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        fontSize: 12,
      }}
    >
      {/* Simulation Panel Title Bar (Packet Tracer style) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'var(--accent-bg)',
          borderBottom: '1px solid var(--accent-border)',
        }}
      >
        <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 13 }}>
          Simulation Panel · Event List
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-m)' }}>
          Captured: {simTimeSec.toFixed(3)} s
        </span>
      </div>

      {/* Top Action Buttons (Reset Simulation & Constant Delay) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderBottom: '1px solid var(--border)',
          gap: 6,
        }}
      >
        <button
          className="btn"
          style={{ padding: '3px 8px', fontSize: 11.5 }}
          onClick={onResetSimulation}
        >
          Reset Simulation
        </button>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-m)', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked />
          Constant Delay
        </label>

        <button
          className="btn"
          style={{ padding: '3px 8px', fontSize: 11.5 }}
          onClick={onClearEvents}
          title="Clear Event List"
        >
          Clear
        </button>
      </div>

      {/* Event List Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg)' }}>
            <tr>
              <th style={{ width: 34, textAlign: 'center', padding: '6px 4px' }} title="Visible / Inspect PDU">
                Vis.
              </th>
              <th style={{ width: 62, padding: '6px 6px' }}>Time(sec)</th>
              <th style={{ width: 100, padding: '6px 6px' }}>Last Device</th>
              <th style={{ width: 55, padding: '6px 4px' }}>Type</th>
              <th style={{ padding: '6px 6px' }}>Info / Action</th>
            </tr>
          </thead>
          <tbody>
            {displayEvents.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-m)', fontStyle: 'italic' }}>
                  No packet events captured yet.<br />
                  Click "✉ Add Simple PDU" or pick a scenario above.
                </td>
              </tr>
            ) : (
              displayEvents.map((evt, idx) => {
                const isSelected = selectedEventIndex === idx;
                return (
                  <tr
                    key={evt.id || idx}
                    style={{
                      cursor: 'pointer',
                      background: isSelected
                        ? 'var(--accent-bg)'
                        : evt.status === 'Failed'
                        ? 'var(--status-crit-bg)'
                        : undefined,
                      borderBottom: '1px solid var(--border)',
                    }}
                    onClick={() => onSelectEvent(evt, idx)}
                    title="Click to view PDU Information in Inspector"
                  >
                    <td style={{ textAlign: 'center', padding: '4px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          background: evt.status === 'Failed' ? 'var(--status-crit)' : 'var(--status-ok)',
                          color: '#fff',
                          fontSize: 9,
                          lineHeight: '14px',
                          textAlign: 'center',
                          fontWeight: 700,
                        }}
                      >
                        👁
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 6px' }}>
                      {evt.timeSec ? evt.timeSec.toFixed(3) : '4.762'}
                    </td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 11, padding: '4px 6px' }}>
                      {evt.device || evt.source}
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, padding: '4px 4px' }}>
                      <span
                        style={{
                          color:
                            evt.protocol === 'ICMP' ? 'var(--passenger)' :
                            evt.protocol === 'DNS' ? 'var(--administration)' :
                            evt.protocol === 'OSPF' ? 'var(--operations)' : 'var(--accent)',
                        }}
                      >
                        {evt.protocol || 'ICMP'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-h)', fontSize: 11, padding: '4px 6px' }}>
                      {evt.message || evt.action}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Packet Tracer Style Event Filter Footer */}
      <div
        style={{
          padding: '8px 10px',
          background: 'var(--bg)',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <strong style={{ color: 'var(--text-h)' }}>Event List Filters - Visible Events</strong>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="btn"
              style={{ padding: '2px 6px', fontSize: 10 }}
              onClick={() => handleSelectAll(true)}
            >
              All
            </button>
            <button
              className="btn"
              style={{ padding: '2px 6px', fontSize: 10 }}
              onClick={() => handleSelectAll(false)}
            >
              None
            </button>
          </div>
        </div>

        {/* Protocol Checkboxes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 10.5 }}>
          {['ICMP', 'ARP', 'DNS', 'TCP', 'UDP', 'HTTP', 'OSPF'].map((proto) => (
            <label
              key={proto}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                cursor: 'pointer',
                color: activeProtocols[proto] ? 'var(--text-h)' : 'var(--text-m)',
                fontWeight: activeProtocols[proto] ? 600 : 400,
              }}
            >
              <input
                type="checkbox"
                checked={!!activeProtocols[proto]}
                onChange={() => toggleProtocol(proto)}
                style={{ width: 12, height: 12 }}
              />
              {proto}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
