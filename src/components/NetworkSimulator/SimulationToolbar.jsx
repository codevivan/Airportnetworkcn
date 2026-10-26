export default function SimulationToolbar({
  mode,
  setMode,
  isPlaying,
  playbackSpeed,
  setPlaybackSpeed,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onOpenPacketCreator,
  onOpenScenarios,
  onOpenProfessorDemo,
  packetState,
}) {
  return (
    <div
      className="simulator-toolbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        padding: '8px 14px',
        background: 'var(--bg-elev)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        fontSize: 12.5,
      }}
    >
      {/* Left Group: Mode Indicator & PDU Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Packet Tracer Mode Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 8px',
            borderRadius: 4,
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            fontFamily: 'var(--mono)',
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--accent)',
          }}
        >
          <span>⬡</span>
          <span>Logical Workspace</span>
        </div>

        {/* Realtime / Simulation Mode Toggle */}
        <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', overflow: 'hidden' }}>
          <button
            className={`btn ${mode === 'Realtime' ? 'btn-primary' : ''}`}
            style={{ padding: '4px 10px', fontSize: 11.5, borderRadius: 0, border: 'none' }}
            onClick={() => setMode('Realtime')}
          >
            Realtime
          </button>
          <button
            className={`btn ${mode === 'Simulation' ? 'btn-primary' : ''}`}
            style={{ padding: '4px 10px', fontSize: 11.5, borderRadius: 0, border: 'none' }}
            onClick={() => setMode('Simulation')}
          >
            Simulation
          </button>
        </div>

        {/* Add Simple PDU Button (Cisco Envelope) */}
        <button
          className="btn btn-primary"
          onClick={onOpenPacketCreator}
          style={{ padding: '5px 11px', fontSize: 12, fontWeight: 600 }}
          title="Add Simple PDU (Send Ping/DNS/HTTP Packet)"
        >
          ✉ Add Simple PDU
        </button>

        {/* Scenarios Dropdown */}
        <button
          className="btn"
          onClick={onOpenScenarios}
          style={{ padding: '5px 11px', fontSize: 12, fontWeight: 600 }}
          title="11 Preset Educational Scenarios"
        >
          ⚡ Scenarios
        </button>
      </div>

      {/* Center Group: Simulation Play Controls (|<<  ▶/⏸  >>|  ↺) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--bg)',
          padding: '3px 8px',
          borderRadius: 6,
          border: '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-m)', marginRight: 4 }}>
          PLAY CONTROLS:
        </span>

        {/* Previous Event (|<<) */}
        <button
          className="btn"
          style={{ padding: '4px 8px', fontFamily: 'var(--mono)', fontWeight: 800 }}
          onClick={onStepBack}
          title="Previous Event (|<< Step Back)"
        >
          ⏮ Back
        </button>

        {/* Play / Pause Toggle */}
        {isPlaying ? (
          <button
            className="btn btn-danger"
            style={{ padding: '4px 12px', fontWeight: 700 }}
            onClick={onPause}
            title="Pause Simulation"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            className="btn btn-primary"
            style={{ padding: '4px 12px', fontWeight: 700 }}
            onClick={onPlay}
            title="Play / Auto Capture Simulation"
          >
            ▶ Auto Capture / Play
          </button>
        )}

        {/* Next Event (>>|) */}
        <button
          className="btn"
          style={{ padding: '4px 8px', fontFamily: 'var(--mono)', fontWeight: 800 }}
          onClick={onStepForward}
          title="Next Event (Capture / Forward Step)"
        >
          Capture / Forward ⏭
        </button>

        {/* Reset Simulation (↺) */}
        <button
          className="btn"
          style={{ padding: '4px 8px' }}
          onClick={onReset}
          title="Reset Simulation"
        >
          ↺ Reset
        </button>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-m)' }}>Speed:</span>
          {[0.5, 1, 2, 4].map((sp) => (
            <button
              key={sp}
              className={`btn ${playbackSpeed === sp ? 'btn-primary' : ''}`}
              style={{ padding: '2px 6px', fontSize: 11 }}
              onClick={() => setPlaybackSpeed(sp)}
            >
              {sp}x
            </button>
          ))}
        </div>
      </div>

      {/* Right Group: Zoom & Professor Demo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button className="btn" style={{ padding: '4px 8px' }} onClick={onZoomIn} title="Zoom In">
          🔍 +
        </button>
        <button className="btn" style={{ padding: '4px 8px' }} onClick={onZoomOut} title="Zoom Out">
          🔍 -
        </button>
        <button className="btn" style={{ padding: '4px 8px' }} onClick={onZoomReset} title="Fit to Screen">
          [ ] Fit
        </button>

        <button
          className="btn"
          onClick={onOpenProfessorDemo}
          style={{
            padding: '5px 12px',
            fontWeight: 700,
            border: '1px solid var(--accent-border)',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
          }}
          title="Launch Professor Demo Walkthrough"
        >
          🎓 Professor Demo
        </button>
      </div>
    </div>
  );
}
