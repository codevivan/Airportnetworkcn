import { useState } from 'react';
import { NETWORK_DEVICES } from '../../utils/networkGraph.js';

export default function PacketCreationModal({
  onClose,
  onSendPacket,
}) {
  const [source, setSource] = useState('Passenger-PC');
  const [dest, setDest] = useState('Operations-PC');
  const [protocol, setProtocol] = useState('ICMP');
  const [packetSize, setPacketSize] = useState(64);
  const [continuous, setContinuous] = useState(false);
  const [validationError, setValidationError] = useState('');

  const deviceList = Object.values(NETWORK_DEVICES).filter(
    (d) => d.type === 'pc' || d.type === 'server' || d.type === 'router'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    if (!source) {
      setValidationError('Please select a valid source device.');
      return;
    }
    if (!dest) {
      setValidationError('Please select a destination device or hostname.');
      return;
    }
    console.log(`[SIMULATOR] PacketCreationModal submitted: ${source} -> ${dest} [${protocol}]`);
    onSendPacket(source, dest, protocol, Number(packetSize));
    onClose();
  };

  return (
    <div
      className="pdu-modal-overlay"
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
        className="card"
        style={{
          width: '100%',
          maxWidth: 520,
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Packet Tracer Window Title */}
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
            <span style={{ fontSize: 16 }}>✉</span>
            <strong style={{ fontSize: 14, color: 'var(--text-h)' }}>
              Create PDU / Packet Generator
            </strong>
          </div>
          <button className="btn" style={{ padding: '2px 8px', fontSize: 12 }} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 18 }}>
          {validationError && (
            <div
              style={{
                padding: '8px 12px',
                marginBottom: 12,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--status-crit-bg)',
                border: '1px solid var(--status-crit)',
                color: 'var(--status-crit)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ⚠ {validationError}
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-m)', marginBottom: 4 }}>
              SOURCE DEVICE
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                background: 'var(--bg-elev)',
                color: 'var(--text-h)',
                border: '1px solid var(--border-strong)',
                fontFamily: 'var(--mono)',
                fontSize: 13,
              }}
            >
              {deviceList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip || d.routerId})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-m)', marginBottom: 4 }}>
              DESTINATION DEVICE / DOMAIN
            </label>
            <select
              value={dest}
              onChange={(e) => {
                setDest(e.target.value);
                if (e.target.value === 'DNS-Server') setProtocol('DNS');
              }}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                background: 'var(--bg-elev)',
                color: 'var(--text-h)',
                border: '1px solid var(--border-strong)',
                fontFamily: 'var(--mono)',
                fontSize: 13,
              }}
            >
              {deviceList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.ip || d.routerId})
                </option>
              ))}
              <option value="airport.local">airport.local (Internal FQDN)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-m)', marginBottom: 4 }}>
                PROTOCOL
              </label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: 'var(--bg-elev)',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border-strong)',
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                }}
              >
                <option value="ICMP">ICMP Echo (Ping)</option>
                <option value="ARP">ARP Address Resolution</option>
                <option value="DNS">DNS Query (UDP 53)</option>
                <option value="TCP">TCP 3-Way Handshake</option>
                <option value="HTTP">HTTP Request (TCP 80)</option>
                <option value="Traceroute">Traceroute (TTL Probes)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-m)', marginBottom: 4 }}>
                PACKET SIZE (BYTES)
              </label>
              <input
                type="number"
                min="32"
                max="1500"
                value={packetSize}
                onChange={(e) => setPacketSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 6,
                  background: 'var(--bg-elev)',
                  color: 'var(--text-h)',
                  border: '1px solid var(--border-strong)',
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-h)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={continuous}
                onChange={(e) => setContinuous(e.target.checked)}
              />
              Continuous Ping (Repeat periodically until paused)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontWeight: 700 }}>
              🚀 Send PDU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
