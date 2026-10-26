import { useState } from 'react';

const PRESETS = [
  {
    label: 'Passenger-PC → Operations-PC (Cross-Campus)',
    src: 'Passenger-PC',
    dst: 'Operations-PC',
    proto: 'ICMP',
  },
  {
    label: 'Passenger-PC → Security-PC (Inter-Terminal)',
    src: 'Passenger-PC',
    dst: 'Security-PC',
    proto: 'ICMP',
  },
  {
    label: 'Admin-PC → Passenger-PC (Management Probe)',
    src: 'Admin-PC',
    dst: 'Passenger-PC',
    proto: 'ICMP',
  },
  {
    label: 'Passenger-PC → airport.local (DNS Lookup + Ping)',
    src: 'Passenger-PC',
    dst: 'airport.local',
    proto: 'DNS+ICMP',
  },
];

const DEVICE_OPTIONS = [
  { id: 'Passenger-PC', label: 'Passenger-PC (192.168.10.10)' },
  { id: 'Security-PC', label: 'Security-PC (192.168.20.10)' },
  { id: 'Operations-PC', label: 'Operations-PC (192.168.30.10)' },
  { id: 'Admin-PC', label: 'Admin-PC (192.168.40.10)' },
  { id: 'airport.local', label: 'DNS Server: airport.local (192.168.40.20)' },
];

export default function PacketSimulationPanel({
  packetState,
  isPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  onSendPacket,
  onPausePacket,
  onResumePacket,
  onStepPacket,
  onResetPacket,
  onClearEvents,
  metrics,
}) {
  const [selectedSource, setSelectedSource] = useState('Passenger-PC');
  const [selectedDest, setSelectedDest] = useState('Operations-PC');
  const [selectedProtocol, setSelectedProtocol] = useState('ICMP');

  const handlePreset = (preset) => {
    setSelectedSource(preset.src);
    setSelectedDest(preset.dst);
    setSelectedProtocol(preset.proto);
    onSendPacket(preset.src, preset.dst, preset.proto);
  };

  const handleSendCustom = () => {
    onSendPacket(selectedSource, selectedDest, selectedProtocol);
  };

  const deliveryRate =
    metrics.packetsSent > 0
      ? ((metrics.packetsDelivered / metrics.packetsSent) * 100).toFixed(1)
      : '100.0';

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">
          <h3>Packet Simulation & Traffic Generator</h3>
          <span className="sub">Interactive ICMP & DNS Packet Flow across OSPF Area 0</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="badge badge-info">
            <span className="led" />Sent: {metrics.packetsSent}
          </span>
          <span className="badge badge-ok">
            <span className="led" />Delivered: {metrics.packetsDelivered}
          </span>
          {metrics.packetsFailed > 0 && (
            <span className="badge badge-crit">
              <span className="led" />Dropped: {metrics.packetsFailed}
            </span>
          )}
          <span className="badge badge-idle">Delivery: {deliveryRate}%</span>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-m)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Quick Demonstration Presets:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className="btn"
              style={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                padding: '9px 12px',
                fontSize: 12.5,
              }}
              onClick={() => handlePreset(p)}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>▶</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Packet Configurator */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          padding: '14px',
          background: 'var(--accent-bg)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--accent-border)',
          marginBottom: 16,
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-m)', marginBottom: 4 }}>
            SOURCE DEVICE
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 6,
              background: 'var(--bg-elev)',
              color: 'var(--text-h)',
              border: '1px solid var(--border-strong)',
              fontFamily: 'var(--mono)',
              fontSize: 12.5,
            }}
          >
            {DEVICE_OPTIONS.filter((d) => d.id !== 'airport.local').map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-m)', marginBottom: 4 }}>
            DESTINATION DEVICE / DOMAIN
          </label>
          <select
            value={selectedDest}
            onChange={(e) => {
              setSelectedDest(e.target.value);
              if (e.target.value === 'airport.local') {
                setSelectedProtocol('DNS+ICMP');
              }
            }}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 6,
              background: 'var(--bg-elev)',
              color: 'var(--text-h)',
              border: '1px solid var(--border-strong)',
              fontFamily: 'var(--mono)',
              fontSize: 12.5,
            }}
          >
            {DEVICE_OPTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-m)', marginBottom: 4 }}>
            PROTOCOL
          </label>
          <select
            value={selectedProtocol}
            onChange={(e) => setSelectedProtocol(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 6,
              background: 'var(--bg-elev)',
              color: 'var(--text-h)',
              border: '1px solid var(--border-strong)',
              fontFamily: 'var(--mono)',
              fontSize: 12.5,
            }}
          >
            <option value="ICMP">ICMP Echo Request (Ping)</option>
            <option value="DNS+ICMP">DNS Query (UDP 53) + ICMP</option>
            <option value="TCP-HTTP">TCP Handshake (HTTP 80)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', height: 36, fontWeight: 600 }}
            onClick={handleSendCustom}
          >
            🚀 Send Packet
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          paddingTop: 8,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {isPlaying ? (
            <button className="btn" onClick={onPausePacket} title="Pause animation">
              ⏸ Pause
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onResumePacket}
              disabled={!packetState.active || packetState.status !== 'IN_TRANSIT'}
              title="Resume animation"
            >
              ▶ Play
            </button>
          )}

          <button
            className="btn"
            onClick={onStepPacket}
            disabled={!packetState.active || packetState.status !== 'IN_TRANSIT'}
            title="Advance by one hop"
          >
            ⏭ Step Forward
          </button>

          <button className="btn" onClick={onResetPacket} title="Reset current packet">
            ↺ Reset Simulation
          </button>

          <button className="btn" onClick={onClearEvents} title="Clear event timeline">
            🗑 Clear Log
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-m)' }}>Speed:</span>
          {[1, 1.5, 2].map((sp) => (
            <button
              key={sp}
              className={`btn ${playbackSpeed === sp ? 'btn-primary' : ''}`}
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => setPlaybackSpeed(sp)}
            >
              {sp}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
