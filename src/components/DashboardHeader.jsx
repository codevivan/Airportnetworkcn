export default function DashboardHeader({
  timestamp,
  overallSummary,
  failedLinks,
  onSimulateCoreSecurity,
  onRestoreAll,
  onRefresh,
  demoMode,
  onToggleDemoMode,
  theme = 'light',
  onToggleTheme,
  activeTab = 'simulator',
  onSelectTab,
}) {
  const {
    healthScore = 100,
    routersUp,
    routersTotal,
    opsStatus,
    activeFaults = 0,
  } = overallSummary;

  const healthClass =
    healthScore >= 95 ? '' : healthScore >= 80 ? 'warn' : 'crit';

  const isCoreSecDown = failedLinks && failedLinks.has('core-security');
  const isDark = theme === 'dark';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand-mark" aria-hidden="true">✈</div>
        <div className="brand-text">
          <h1>Airport Network Monitoring & Fault Detection</h1>
          <p>Cisco Packet Tracer Architecture · OSPF Area 0 Campus NOC · Digital Twin</p>
        </div>

        {/* View Switcher: Packet Tracer Simulator vs NOC Dashboard */}
        {onSelectTab && (
          <div
            style={{
              display: 'flex',
              background: 'var(--bg)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-strong)',
              overflow: 'hidden',
              marginLeft: 8,
            }}
          >
            <button
              className={`btn ${activeTab === 'simulator' ? 'btn-primary' : ''}`}
              style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 0, border: 'none' }}
              onClick={() => onSelectTab('simulator')}
              title="Switch to Cisco Packet Tracer Simulation Workspace"
            >
              🔌 Network Simulator
            </button>
            <button
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
              style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 0, border: 'none' }}
              onClick={() => onSelectTab('dashboard')}
              title="Switch to NOC Overview & Health Dashboard"
            >
              📊 NOC Dashboard
            </button>
          </div>
        )}
      </div>

      <div className="topbar-center">
        <span>⏱ {timestamp}</span>
        <span>·</span>
        <span>Routers {routersUp}/{routersTotal}</span>
        <span>·</span>
        <span>DNS: <span className="sev-OK">192.168.40.20</span></span>
        <span>·</span>
        <span>
          Ops Route:{' '}
          <span className={opsStatus === 'FAILOVER' ? 'sev-WARN' : opsStatus === 'DOWN' ? 'sev-CRIT' : 'sev-OK'}>
            {opsStatus}
          </span>
        </span>
        {activeFaults > 0 && (
          <>
            <span>·</span>
            <span className="sev-CRIT">⚠ {activeFaults} Fault{activeFaults > 1 ? 's' : ''}</span>
          </>
        )}
      </div>

      <div className="topbar-right">
        {/* Theme Toggle Button */}
        <button
          className="btn btn-theme-toggle"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isDark ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>Dark</span>
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" fill="#f59e0b" stroke="#d97706" />
                <line x1="12" y1="1" x2="12" y2="3" stroke="#d97706" />
                <line x1="12" y1="21" x2="12" y2="23" stroke="#d97706" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#d97706" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#d97706" />
                <line x1="1" y1="12" x2="3" y2="12" stroke="#d97706" />
                <line x1="21" y1="12" x2="23" y2="12" stroke="#d97706" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#d97706" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#d97706" />
              </svg>
              <span>Light</span>
            </>
          )}
        </button>

        {/* Professor Demo Mode Button */}
        <button
          className={`btn ${demoMode ? 'btn-primary' : ''}`}
          onClick={onToggleDemoMode}
          style={{
            fontWeight: 700,
            border: demoMode ? '1px solid var(--accent)' : '1px solid var(--accent-border)',
            boxShadow: demoMode ? '0 0 12px rgba(124, 58, 237, 0.4)' : undefined,
          }}
          title="Toggle Guided Presentation Walkthrough for Professor"
        >
          🎓 Professor Demo Mode
        </button>

        <div className={`health-score ${healthClass}`}>
          <span className="dot" />
          Health {healthScore}/100
        </div>

        <button className="btn" onClick={onRefresh} title="Refresh counters">
          ⟳ Refresh
        </button>

        {isCoreSecDown ? (
          <button className="btn btn-success" onClick={onRestoreAll}>
            ✓ Restore Links
          </button>
        ) : (
          <button className="btn btn-danger" onClick={onSimulateCoreSecurity}>
            ⚠ Simulate Fault
          </button>
        )}
      </div>
    </header>
  );
}
