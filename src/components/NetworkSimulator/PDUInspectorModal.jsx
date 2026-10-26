import { useState } from 'react';

export default function PDUInspectorModal({
  pdu,
  packetState,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('osi'); // 'osi' | 'inbound' | 'outbound'

  const pkt = packetState || {};
  const isReturn = pkt.stage === 'RETURN';
  const srcIp = isReturn ? (pkt.destIp || '192.168.30.10') : (pkt.sourceIp || '192.168.10.10');
  const dstIp = isReturn ? (pkt.sourceIp || '192.168.10.10') : (pkt.destIp || '192.168.30.10');

  const pduData = pdu || pkt.pdu || {
    layer7: { name: 'Application', info: `${pkt.protocol || 'ICMP'} Protocol Payload` },
    layer4: { name: 'Transport', info: `${pkt.protocol || 'ICMP'} Protocol Layer` },
    layer3: { name: 'Network', sourceIp: srcIp, destIp: dstIp, ttl: 128 },
    layer2: { name: 'Data Link', sourceMac: '000C.29F1.A110', destMac: '0001.42A1.0001' },
    layer1: { name: 'Physical', inPort: 'FastEthernet0/1', outPort: 'GigabitEthernet0/0' },
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
        className="pdu-modal-card card"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Packet Tracer Window Title Bar */}
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
              PDU Information · {packetState.id || 'Packet Details'}
            </strong>
          </div>
          <button
            className="btn"
            style={{ padding: '2px 8px', fontSize: 12, borderRadius: 4 }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Tab Selector: OSI Model / Inbound PDU / Outbound PDU */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
            padding: '4px 12px 0',
            gap: 6,
          }}
        >
          <button
            className={`btn ${activeTab === 'osi' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', borderRadius: '4px 4px 0 0', borderBottom: 'none', fontSize: 12 }}
            onClick={() => setActiveTab('osi')}
          >
            OSI Model
          </button>
          <button
            className={`btn ${activeTab === 'inbound' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', borderRadius: '4px 4px 0 0', borderBottom: 'none', fontSize: 12 }}
            onClick={() => setActiveTab('inbound')}
          >
            Inbound PDU Details
          </button>
          <button
            className={`btn ${activeTab === 'outbound' ? 'btn-primary' : ''}`}
            style={{ padding: '6px 14px', borderRadius: '4px 4px 0 0', borderBottom: 'none', fontSize: 12 }}
            onClick={() => setActiveTab('outbound')}
          >
            Outbound PDU Details
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
          {activeTab === 'osi' && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-m)', marginBottom: 12 }}>
                Cisco Packet Tracer OSI Protocol Stack Analysis at Current Hop:
              </div>

              {/* Layer 7: Application */}
              <div style={{ marginBottom: 10, padding: 10, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12, color: 'var(--accent)' }}>
                  <span>Layer 7: Application</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>{packetState.protocol}</span>
                </div>
                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-h)' }}>
                  {pduData.layer7?.info || `${packetState.protocol} exchange in progress.`}
                </div>
              </div>

              {/* Layer 4: Transport */}
              <div style={{ marginBottom: 10, padding: 10, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12, color: 'var(--accent-2)' }}>
                  <span>Layer 4: Transport</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>{packetState.protocol === 'DNS' ? 'UDP 53' : packetState.protocol === 'HTTP' ? 'TCP 80' : 'ICMP'}</span>
                </div>
                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-h)' }}>
                  {pduData.layer4?.info || 'Process payload through transport layer encapsulation.'}
                </div>
              </div>

              {/* Layer 3: Network */}
              <div style={{ marginBottom: 10, padding: 10, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12, color: 'var(--status-ok)' }}>
                  <span>Layer 3: Network (IPv4)</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>TTL: {pduData.layer3?.ttl || 128}</span>
                </div>
                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-h)' }}>
                  Source IP: <strong style={{ fontFamily: 'var(--mono)' }}>{srcIp}</strong> → Destination IP: <strong style={{ fontFamily: 'var(--mono)' }}>{dstIp}</strong>.
                  The device looks up the next-hop in its CEF / routing table.
                </div>
              </div>

              {/* Layer 2: Data Link */}
              <div style={{ marginBottom: 10, padding: 10, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12, color: 'var(--passenger)' }}>
                  <span>Layer 2: Data Link</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>Ethernet II</span>
                </div>
                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-h)' }}>
                  Source MAC: <span style={{ fontFamily: 'var(--mono)' }}>{pduData.layer2?.sourceMac || '000C.29F1.A110'}</span> →
                  Dest MAC: <span style={{ fontFamily: 'var(--mono)' }}>{pduData.layer2?.destMac || '0001.42A1.0001'}</span>.
                  The outgoing interface encapsulates the packet in an Ethernet frame.
                </div>
              </div>

              {/* Layer 1: Physical */}
              <div style={{ padding: 10, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 12, color: 'var(--operations)' }}>
                  <span>Layer 1: Physical</span>
                  <span style={{ fontFamily: 'var(--mono)' }}>Port: {pduData.layer1?.inPort || 'FastEthernet0'}</span>
                </div>
                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-h)' }}>
                  Physical Media: {pduData.layer1?.media || '1000Base-TX Full Duplex'}. Frame transmitted as electrical/optical signal.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inbound' && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>ETHERNET II HEADER:</div>
              <div style={{ background: 'var(--code-bg)', padding: 10, borderRadius: 6, marginBottom: 12 }}>
                <div>PREAMBLE: 10101010...</div>
                <div>DESTINATION MAC: {pduData.layer2?.destMac || '0001.42A1.0001'}</div>
                <div>SOURCE MAC: {pduData.layer2?.sourceMac || '000C.29F1.A110'}</div>
                <div>TYPE: 0x0800 (IPv4)</div>
              </div>

              <div style={{ fontWeight: 700, color: 'var(--status-ok)', marginBottom: 8 }}>IP HEADER:</div>
              <div style={{ background: 'var(--code-bg)', padding: 10, borderRadius: 6, marginBottom: 12 }}>
                <div>VER: 4 · IHL: 5 · TOS: 0x00 · TOTAL LEN: {packetState.sizeBytes || 64}</div>
                <div>IDENT: 0x4A12 · FLAGS: [DF] · FRAG OFFSET: 0</div>
                <div>TTL: {pduData.layer3?.ttl || 128} · PROTOCOL: {packetState.protocol === 'ICMP' ? '1 (ICMP)' : packetState.protocol === 'UDP' ? '17 (UDP)' : '6 (TCP)'}</div>
                <div>SRC IP: {srcIp}</div>
                <div>DST IP: {dstIp}</div>
              </div>

              <div style={{ fontWeight: 700, color: 'var(--accent-2)', marginBottom: 8 }}>PAYLOAD ({packetState.protocol}):</div>
              <div style={{ background: 'var(--code-bg)', padding: 10, borderRadius: 6 }}>
                <div>{pduData.layer7?.info || 'Standard Protocol Payload Data'}</div>
              </div>
            </div>
          )}

          {activeTab === 'outbound' && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: 'var(--operations)', marginBottom: 8 }}>OUTBOUND FORWARDING DETAILS:</div>
              <div style={{ background: 'var(--code-bg)', padding: 10, borderRadius: 6, marginBottom: 12 }}>
                <div>OUTGOING INTERFACE: {pduData.layer1?.outPort || 'GigabitEthernet0/1'}</div>
                <div>NEXT HOP IP: {pduData.layer3?.destIp || dstIp}</div>
                <div>NEW TTL: {Math.max(1, (pduData.layer3?.ttl || 128) - 1)}</div>
                <div>CHECKSUM RECALCULATED: Valid (0x3F82)</div>
              </div>

              <div style={{ color: 'var(--text-m)', fontSize: 11.5, marginTop: 8 }}>
                The device decrements the Time to Live (TTL), updates the checksum, and pushes the frame onto the wire.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
