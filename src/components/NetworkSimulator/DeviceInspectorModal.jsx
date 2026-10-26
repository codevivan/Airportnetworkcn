import { useState, useRef, useEffect } from 'react';
import { NETWORK_DEVICES, executeRouterCLI, executePCCLI } from '../../utils/networkGraph.js';

export default function DeviceInspectorModal({
  deviceId,
  failedLinks,
  onClose,
  onSendPacket,
}) {
  const [activeTab, setActiveTab] = useState('cli'); // 'config' | 'cli' | 'interfaces' | 'dns'
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState([]);
  const cliTerminalEndRef = useRef(null);

  const device = NETWORK_DEVICES[deviceId] || {
    id: deviceId,
    name: deviceId,
    type: 'device',
  };

  const isRouter = device.type === 'router';
  const isSwitch = device.type === 'switch';
  const isPC = device.type === 'pc';
  const isServer = device.type === 'server';

  // Initialize terminal output when opening
  useEffect(() => {
    if (isRouter) {
      setCliHistory([
        `Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4`,
        `Technical Support: http://www.cisco.com/techsupport`,
        `Press RETURN to get started!`,
        ``,
        `${device.name}# show ip interface brief`,
        executeRouterCLI(deviceId, 'show ip interface brief', failedLinks),
      ]);
    } else if (isPC) {
      setCliHistory([
        `Microsoft Windows [Version 10.0.19045.3803]`,
        `(c) Microsoft Corporation. All rights reserved.`,
        ``,
        `C:\\Users\\airport>${isPC ? 'ipconfig' : ''}`,
        executePCCLI(deviceId, 'ipconfig', failedLinks),
      ]);
    }
  }, [deviceId, isRouter, isPC, device.name, failedLinks]);

  // Scroll CLI terminal to bottom on new output
  useEffect(() => {
    if (cliTerminalEndRef.current) {
      cliTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [cliHistory]);

  const handleCliSubmit = (e) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim();
    setCliInput('');

    if (isRouter) {
      const promptStr = `${device.name}# ${cmd}`;
      const output = executeRouterCLI(deviceId, cmd, failedLinks);
      setCliHistory((prev) => [...prev, promptStr, output, '']);
    } else if (isPC) {
      const promptStr = `C:\\Users\\airport>${cmd}`;
      const output = executePCCLI(deviceId, cmd, failedLinks);
      setCliHistory((prev) => [...prev, promptStr, output, '']);
    }
  };

  return (
    <div
      className="device-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="device-modal-card card"
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Packet Tracer Device Window Title Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'var(--accent-bg)',
            borderBottom: '1px solid var(--accent-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>
              {isRouter ? '🔄' : isSwitch ? '🔀' : isPC ? '💻' : '🖥️'}
            </span>
            <strong style={{ fontSize: 14, color: 'var(--text-h)' }}>
              {device.name} ({device.type.toUpperCase()})
            </strong>
          </div>
          <button className="btn" style={{ padding: '2px 8px', fontSize: 12 }} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
            padding: '4px 12px 0',
            gap: 6,
          }}
        >
          {(isRouter || isPC) && (
            <button
              className={`btn ${activeTab === 'cli' ? 'btn-primary' : ''}`}
              style={{ padding: '6px 14px', borderRadius: '4px 4px 0 0', borderBottom: 'none', fontSize: 12 }}
              onClick={() => setActiveTab('cli')}
            >
              {isRouter ? 'CLI (Cisco IOS)' : 'Command Prompt'}
            </button>
          )}
          <button
            className={`btn ${activeTab === 'config' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', borderRadius: '4px 4px 0 0', borderBottom: 'none', fontSize: 12 }}
            onClick={() => setActiveTab('config')}
          >
            Config & Addressing
          </button>
          {isRouter && (
            <button
              className={`btn ${activeTab === 'interfaces' ? 'btn-primary' : ''}`}
              style={{ padding: '6px 14px', borderRadius: '4px 4px 0 0', borderBottom: 'none', fontSize: 12 }}
              onClick={() => setActiveTab('interfaces')}
            >
              Interfaces & Status
            </button>
          )}
          {isServer && (
            <button
              className={`btn ${activeTab === 'dns' ? 'btn-primary' : ''}`}
              style={{ padding: '6px 14px', borderRadius: '4px 4px 0 0', borderBottom: 'none', fontSize: 12 }}
              onClick={() => setActiveTab('dns')}
            >
              DNS Service Table
            </button>
          )}
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'cli' && (
            <div
              style={{
                flex: 1,
                minHeight: 380,
                background: '#0d1117',
                color: '#58a6ff',
                fontFamily: 'var(--mono)',
                fontSize: 12.5,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ flex: 1, overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: '145%' }}>
                {cliHistory.map((line, idx) => (
                  <div key={idx} style={{ color: line.startsWith('Airport') || line.startsWith('Passenger') || line.startsWith('Security') || line.startsWith('Operations') || line.startsWith('C:\\') ? '#79c0ff' : '#c9d1d9' }}>
                    {line}
                  </div>
                ))}
                <div ref={cliTerminalEndRef} />
              </div>

              {/* Terminal Command Input Prompt */}
              <form onSubmit={handleCliSubmit} style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                <span style={{ color: '#7ee787', fontWeight: 700, marginRight: 6 }}>
                  {isRouter ? `${device.name}#` : `C:\\Users\\airport>`}
                </span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder={isRouter ? 'Type Cisco command (e.g., "show ip route", "sh ip int br", "ping 192.168.30.10", "help")' : 'Type command (e.g., "ping 192.168.40.20", "ipconfig", "arp -a", "nslookup airport.local")'}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'var(--mono)',
                    fontSize: 12.5,
                    outline: 'none',
                  }}
                  autoFocus
                />
              </form>
            </div>
          )}

          {activeTab === 'config' && (
            <div style={{ padding: 18, fontSize: 13 }}>
              <div style={{ marginBottom: 14 }}>
                <h4 style={{ margin: '0 0 6px' }}>Device Properties: {device.name}</h4>
                <div style={{ color: 'var(--text-m)', fontSize: 12 }}>Role: {device.role || device.type}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 16 }}>
                <div className="stat-row">
                  <span className="lbl">Hostname</span>
                  <span className="val" style={{ fontFamily: 'var(--mono)' }}>{device.name}</span>
                </div>
                {device.routerId && (
                  <div className="stat-row">
                    <span className="lbl">Router ID (OSPF)</span>
                    <span className="val" style={{ fontFamily: 'var(--mono)' }}>{device.routerId}</span>
                  </div>
                )}
                {device.ip && (
                  <div className="stat-row">
                    <span className="lbl">IP Address</span>
                    <span className="val" style={{ fontFamily: 'var(--mono)' }}>{device.ip}</span>
                  </div>
                )}
                {device.gateway && (
                  <div className="stat-row">
                    <span className="lbl">Default Gateway</span>
                    <span className="val" style={{ fontFamily: 'var(--mono)' }}>{device.gateway}</span>
                  </div>
                )}
                {device.dns && (
                  <div className="stat-row">
                    <span className="lbl">DNS Server</span>
                    <span className="val" style={{ fontFamily: 'var(--mono)' }}>{device.dns}</span>
                  </div>
                )}
                {device.mac && (
                  <div className="stat-row">
                    <span className="lbl">MAC Address</span>
                    <span className="val" style={{ fontFamily: 'var(--mono)' }}>{device.mac}</span>
                  </div>
                )}
              </div>

              {/* Quick Ping shortcut for PC */}
              {isPC && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Packet Dispatch:</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        onClose();
                        onSendPacket(deviceId, 'Operations-PC', 'ICMP');
                      }}
                    >
                      Ping Operations-PC
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        onClose();
                        onSendPacket(deviceId, 'airport.local', 'DNS');
                      }}
                    >
                      Resolve airport.local (DNS)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'interfaces' && isRouter && (
            <div style={{ padding: 18 }}>
              <h4 style={{ margin: '0 0 10px' }}>Interface Status & Port Addressing</h4>
              <div className="metric-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Interface</th>
                      <th>IP Address / Subnet</th>
                      <th>Connected To</th>
                      <th>Status</th>
                      <th>Protocol</th>
                      <th>Bandwidth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {device.interfaces.map((iface) => {
                      const isDown = failedLinks.has(iface.linkId);
                      return (
                        <tr key={iface.name} style={isDown ? { background: 'var(--status-crit-bg)' } : undefined}>
                          <td style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{iface.name}</td>
                          <td style={{ fontFamily: 'var(--mono)' }}>{iface.ip}</td>
                          <td style={{ fontFamily: 'var(--mono)' }}>{iface.to}</td>
                          <td>
                            <span className={isDown ? 'badge badge-crit' : 'badge badge-ok'}>
                              <span className="led" />{isDown ? 'DOWN' : 'UP'}
                            </span>
                          </td>
                          <td>
                            <span className={isDown ? 'badge badge-crit' : 'badge badge-ok'}>
                              <span className="led" />{isDown ? 'DOWN' : 'UP'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{iface.bandwidth}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'dns' && isServer && (
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h4 style={{ margin: 0 }}>Cisco DNS Service Configuration</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>SERVICE:</span>
                  <span className="badge badge-ok"><span className="led" />ON</span>
                </div>
              </div>

              <div className="metric-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Resource Record (FQDN)</th>
                      <th>Record Type</th>
                      <th>Resolved IP Address (A Record)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {device.records.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>
                          {r.name}
                        </td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{r.type}</td>
                        <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{r.value}</td>
                        <td>
                          <span className="badge badge-ok">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
