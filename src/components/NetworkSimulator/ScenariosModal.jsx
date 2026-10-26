export default function ScenariosModal({
  scenarios,
  onClose,
  onRunScenario,
}) {
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
          maxWidth: 680,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: 'var(--accent-bg)',
            borderBottom: '1px solid var(--accent-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <strong style={{ fontSize: 15, color: 'var(--text-h)' }}>
              11 One-Click Educational Simulation Scenarios
            </strong>
          </div>
          <button className="btn" style={{ padding: '2px 8px', fontSize: 12 }} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scenarios.map((sc, i) => (
            <div
              key={sc.id || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-h)', marginBottom: 3 }}>
                  {sc.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-m)' }}>
                  {sc.desc}
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: '6px 14px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}
                onClick={() => {
                  onClose();
                  sc.run();
                }}
              >
                ▶ Run Scenario
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
