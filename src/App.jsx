import './App.css';
import { useNetworkSimulation } from './hooks/useNetworkSimulation.js';
import DashboardHeader from './components/DashboardHeader.jsx';
import NetworkTopology from './components/NetworkTopology.jsx';
import PacketSimulationPanel from './components/PacketSimulationPanel.jsx';
import PacketInspector from './components/PacketInspector.jsx';
import FaultControls from './components/FaultControls.jsx';
import ProfessorDemoMode from './components/ProfessorDemoMode.jsx';
import { OverallHealthCard, DepartmentCard } from './components/StatusCard.jsx';
import OSPFStatus from './components/OSPFStatus.jsx';
import RedundantRoutes from './components/RedundantRoutes.jsx';
import RouterLinkStatus from './components/RouterLinkStatus.jsx';
import { PacketLossPanel, InterfaceErrorsPanel } from './components/MetricsPanels.jsx';
import FaultLog from './components/FaultLog.jsx';
import NetworkSimulatorView from './components/NetworkSimulator/NetworkSimulatorView.jsx';

import { useTheme } from './hooks/useTheme.js';

function SectionLabel({ num, title, meta }) {
  return (
    <div className="section-label">
      <h2>
        {num.toString().padStart(2, '0')} · {title}
      </h2>
      {meta && <span className="meta">{meta}</span>}
    </div>
  );
}

export default function App() {
  const sim = useNetworkSimulation();
  const theme = useTheme();

  return (
    <div className="app-shell">
      {/* Top Navigation & Status Header */}
      <DashboardHeader
        timestamp={sim.timestamp}
        overallSummary={sim.overallSummary}
        failedLinks={sim.failedLinks}
        onSimulateCoreSecurity={sim.simulateCoreSecurityFailure}
        onRestoreAll={sim.restoreAllLinks}
        onRefresh={sim.refreshTick}
        demoMode={sim.demoMode}
        onToggleDemoMode={() => sim.setDemoMode((m) => !m)}
        theme={theme.theme}
        onToggleTheme={theme.toggleTheme}
        activeTab={sim.activeTab}
        onSelectTab={sim.setActiveTab}
      />

      <main
        className="content"
        style={
          sim.activeTab === 'simulator'
            ? { padding: 0, maxWidth: '100%', margin: 0, height: 'calc(100vh - 68px)', overflow: 'hidden' }
            : undefined
        }
      >
        {sim.activeTab === 'simulator' ? (
          <NetworkSimulatorView sim={sim} />
        ) : (
          <>
            {/* Guided Professor Demonstration Banner */}
            {sim.demoMode && (
              <ProfessorDemoMode
                demoStep={sim.demoStep}
                demoSteps={sim.demoSteps}
                onNext={sim.nextDemoStep}
                onPrev={sim.prevDemoStep}
                onExecuteStep={sim.executeDemoStep}
                onClose={() => sim.setDemoMode(false)}
              />
            )}

            {/* Feature 1: Interactive Network Topology (Visual Centerpiece) */}
            <SectionLabel
              num={1}
              title="Interactive Campus Topology (OSPF Area 0 Diamond)"
              meta="Airport-Core · Passenger · Security · Operations"
            />
            <section className="grid-full">
              <NetworkTopology
                failedLinks={sim.failedLinks}
                recoveringLinks={sim.recoveringLinks}
                packetState={sim.packetState}
                onSelectEntity={sim.setSelectedEntity}
                selectedEntity={sim.selectedEntity}
                onToggleLink={sim.toggleLinkFailure}
              />
            </section>

            {/* Feature 2: Animated Packet Simulation & Feature 7: Packet Inspector */}
            <SectionLabel
              num={2}
              title="Packet Simulation & Live Inspector"
              meta="Traffic Generator · Hop Traversal · DNS & ICMP Inspection"
            />
            <section className="grid-2">
              <PacketSimulationPanel
                packetState={sim.packetState}
                isPlaying={sim.isPlaying}
                playbackSpeed={sim.playbackSpeed}
                setPlaybackSpeed={sim.setPlaybackSpeed}
                onSendPacket={sim.sendPacket}
                onPausePacket={sim.pausePacket}
                onResumePacket={sim.resumePacket}
                onStepPacket={sim.stepPacketSimulation}
                onResetPacket={sim.resetPacket}
                onClearEvents={sim.clearEvents}
                metrics={sim.metrics}
              />
              <PacketInspector
                packetState={sim.packetState}
                selectedEntity={sim.selectedEntity}
                routers={sim.routers}
                ospfNeighbors={sim.ospfNeighbors}
                routingTables={sim.routingTables}
              />
            </section>

            {/* Feature 4: Fault Simulation & Recovery Controls */}
            <SectionLabel
              num={3}
              title="Fault Simulation & Recovery Controller"
              meta={`${sim.failedLinks.size} active link faults · Deterministic OSPF convergence`}
            />
            <section className="grid-full">
              <FaultControls
                failedLinks={sim.failedLinks}
                recoveringLinks={sim.recoveringLinks}
                onSimulateCoreSecurity={sim.simulateCoreSecurityFailure}
                onSimulateCorePassenger={sim.simulateCorePassengerFailure}
                onSimulatePassengerOps={sim.simulatePassengerOpsFailure}
                onSimulateSecurityOps={sim.simulateSecurityOpsFailure}
                onSimulateLANFailure={sim.simulateLANFailure}
                onToggleLink={sim.toggleLinkFailure}
                onRestoreAll={sim.restoreAllLinks}
                onResetNetwork={sim.resetNetwork}
              />
            </section>

            {/* Feature 5: Overall Network Health & Departmental Status */}
            <SectionLabel
              num={4}
              title="Campus Network Health & Departmental LANs"
              meta={`Health Score: ${sim.healthScore}/100 · 4 Departmental VLANs`}
            />
            <section className="grid-health">
              <OverallHealthCard
                summary={sim.overallSummary}
                metrics={sim.metrics}
                failedLinksCount={sim.failedLinks.size}
              />
              {sim.networks.map((n) => (
                <DepartmentCard key={n.id} network={n} />
              ))}
            </section>

            {/* Feature 3: Routing and OSPF Simulation */}
            <SectionLabel
              num={5}
              title="OSPF Area 0 Neighbor Status & Routing Information Base (RIB)"
              meta="Process 1 · Backbone Area 0 · Dynamic SPF Routing Tables"
            />
            <section className="grid-full">
              <OSPFStatus
                neighbors={sim.ospfNeighbors}
                routingTables={sim.routingTables}
              />
            </section>

            {/* Feature 3 Cont.: Redundant Route Status & ECMP */}
            <SectionLabel
              num={6}
              title="Redundant Route & ECMP Status"
              meta="Destination: 192.168.30.0/24 (Operations Subnet)"
            />
            <section className="grid-full">
              <RedundantRoutes
                paths={sim.redundantPaths}
                failedLinks={sim.failedLinks}
              />
            </section>

            {/* Router & Physical Link Status */}
            <SectionLabel
              num={7}
              title="Router & Switch Physical Interface Status"
              meta={`${sim.routers.length} routers · ${sim.switches.length} switches monitored`}
            />
            <section className="grid-full">
              <RouterLinkStatus routers={sim.routers} switches={sim.switches} />
            </section>

            {/* Packet Loss & Interface Errors Metrics */}
            <SectionLabel
              num={8}
              title="Telemetry Metrics & Interface Error Counters"
              meta={`Packet Loss: ${sim.packetLoss.overall.toFixed(2)}% · SNMP Counters`}
            />
            <section className="grid-2">
              <PacketLossPanel packetLoss={sim.packetLoss} />
              <InterfaceErrorsPanel interfaceErrors={sim.interfaceErrors} />
            </section>

            {/* Feature 6: Event Timeline and Fault Log */}
            <SectionLabel
              num={9}
              title="Event Timeline & NOC Audit Log"
              meta={`${sim.faultLog.length} events logged · Timestamped Chronological History`}
            />
            <section className="grid-full">
              <FaultLog
                faultLog={sim.faultLog}
                onClearLog={sim.clearEvents}
                onSelectEvent={(evt) =>
                  sim.setSelectedEntity({ type: 'event', data: evt.data })
                }
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
