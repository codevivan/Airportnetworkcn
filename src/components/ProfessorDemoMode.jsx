export default function ProfessorDemoMode({
  demoStep,
  demoSteps,
  onNext,
  onPrev,
  onExecuteStep,
  onClose,
}) {
  const currentStepData = demoSteps[demoStep] || demoSteps[0];
  const isLastStep = demoStep === demoSteps.length - 1;
  const isFirstStep = demoStep === 0;

  return (
    <div
      className="card"
      style={{
        border: '2px solid var(--accent)',
        background: 'linear-gradient(180deg, var(--bg-elev) 0%, var(--accent-bg) 100%)',
        boxShadow: '0 8px 30px rgba(124, 58, 237, 0.15)',
        marginBottom: 24,
      }}
    >
      <div className="card-head">
        <div className="card-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>🎓</span>
            <h3 style={{ fontSize: 17, color: 'var(--accent)' }}>
              Professor Demonstration Mode · Step {currentStepData.step} of {demoSteps.length}
            </h3>
          </div>
          <span className="sub">
            Interactive Presentation Walkthrough for Computer Networks Mini-Project
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => onExecuteStep(0)}
          >
            ↺ Reset Demo
          </button>
          <button
            className="btn"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={onClose}
          >
            ✕ Exit Demo Mode
          </button>
        </div>
      </div>

      {/* Progress Dots */}
      <div style={{ display: 'flex', gap: 6, margin: '8px 0 16px', overflowX: 'auto', paddingBottom: 4 }}>
        {demoSteps.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onExecuteStep(idx)}
            style={{
              flex: 1,
              minWidth: 26,
              height: 8,
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background:
                idx === demoStep
                  ? 'var(--accent)'
                  : idx < demoStep
                  ? 'var(--status-ok)'
                  : 'var(--border-strong)',
              transition: 'all 0.2s',
            }}
            title={`Step ${s.step}: ${s.title}`}
          />
        ))}
      </div>

      {/* Step Title & Script Box */}
      <div
        style={{
          background: 'var(--bg-elev)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius)',
          padding: '16px 20px',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-h)', marginBottom: 8 }}>
          Step {currentStepData.step}: {currentStepData.title}
        </div>

        {/* Read-Aloud Script for College Presentation */}
        <div
          style={{
            background: 'var(--accent-bg)',
            borderLeft: '4px solid var(--accent)',
            padding: '12px 16px',
            borderRadius: '0 8px 8px 0',
            fontSize: 13.5,
            lineHeight: '160%',
            color: 'var(--text-h)',
            fontStyle: 'italic',
          }}
        >
          <strong style={{ fontStyle: 'normal', color: 'var(--accent)' }}>🗣 Presentation Script (Read aloud to Professor):</strong>
          <p style={{ marginTop: 6, margin: 0 }}>"{currentStepData.script}"</p>
        </div>
      </div>

      {/* Navigation and Action Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={onPrev}
            disabled={isFirstStep}
            style={{ padding: '8px 14px' }}
          >
            ← Previous Step
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onExecuteStep(demoStep)}
            style={{ padding: '8px 16px', fontWeight: 600 }}
          >
            ⚡ {currentStepData.actionLabel}
          </button>
        </div>

        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={isLastStep}
          style={{ padding: '8px 18px', fontWeight: 600 }}
        >
          {isLastStep ? 'Demo Completed ✓' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}
