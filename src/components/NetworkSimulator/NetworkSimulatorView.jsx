import { useState } from 'react';
import SimulatorWorkspace from './SimulatorWorkspace.jsx';
import SimulationToolbar from './SimulationToolbar.jsx';
import SimulationEventList from './SimulationEventList.jsx';
import PDUInspectorModal from './PDUInspectorModal.jsx';
import DeviceInspectorModal from './DeviceInspectorModal.jsx';
import PacketCreationModal from './PacketCreationModal.jsx';
import ScenariosModal from './ScenariosModal.jsx';
import ProfessorDemoMode from '../ProfessorDemoMode.jsx';
import FaultControls from '../FaultControls.jsx';

export default function NetworkSimulatorView({
  sim,
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showEventList, setShowEventList] = useState(true);
  const [showPduModal, setShowPduModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showPacketCreator, setShowPacketCreator] = useState(false);
  const [showScenariosModal, setShowScenariosModal] = useState(false);
  const [showFaultDrawer, setShowFaultDrawer] = useState(false);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSelectEntity = (entity) => {
    sim.setSelectedEntity(entity);
    if (entity.type === 'router' || entity.type === 'switch' || entity.type === 'pc' || entity.type === 'server' || entity.type === 'device') {
      setShowDeviceModal(true);
    }
  };

  const handleSelectEvent = (evt, idx) => {
    sim.setSelectedEventIndex(idx);
    if (evt && (evt.device || evt.source)) {
      sim.setSelectedEntity({ type: 'device', id: evt.device || evt.source });
    }
    const snapshot = sim.eventHistory[idx];
    if (snapshot) {
      sim.setPacketState(snapshot);
    }
    setShowPduModal(true);
  };

  return (
    <div
      className="network-simulator-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 68px)',
        minHeight: 620,
        width: '100%',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}
    >
      {/* Top Simulation Mode Toolbar */}
      <SimulationToolbar
        mode={sim.mode}
        setMode={sim.setMode}
        isPlaying={sim.isPlaying}
        playbackSpeed={sim.playbackSpeed}
        setPlaybackSpeed={sim.setPlaybackSpeed}
        onPlay={sim.resumePacket}
        onPause={sim.pausePacket}
        onStepForward={sim.stepPacketSimulation}
        onStepBack={sim.stepBackSimulation}
        onReset={sim.resetPacket}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onOpenPacketCreator={() => setShowPacketCreator(true)}
        onOpenScenarios={() => setShowScenariosModal(true)}
        onOpenProfessorDemo={() => sim.setDemoMode(true)}
        packetState={sim.packetState}
      />

      {/* Guided Professor Demo Mode Bar if Active */}
      {sim.demoMode && (
        <div style={{ padding: '8px 14px 0', background: 'var(--bg)' }}>
          <ProfessorDemoMode
            demoStep={sim.demoStep}
            demoSteps={sim.demoSteps}
            onNext={sim.nextDemoStep}
            onPrev={sim.prevDemoStep}
            onExecuteStep={sim.executeDemoStep}
            onClose={() => sim.setDemoMode(false)}
          />
        </div>
      )}

      {/* Main Workspace Split: Center Canvas + Right Event List */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Center Topology Canvas */}
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          <SimulatorWorkspace
            failedLinks={sim.failedLinks}
            recoveringLinks={sim.recoveringLinks}
            packetState={sim.packetState}
            selectedEntity={sim.selectedEntity}
            onSelectEntity={handleSelectEntity}
            onToggleLink={sim.toggleLinkFailure}
            zoom={zoom}
            pan={pan}
            setPan={setPan}
          />
        </div>

        {/* Right Dockable Simulation Panel (Event List) */}
        {showEventList && (
          <div style={{ width: 380, maxWidth: '40vw', height: '100%' }}>
            <SimulationEventList
              eventHistory={sim.eventHistory}
              userEvents={sim.faultLog}
              simTimeSec={sim.simTimeSec}
              onSelectEvent={handleSelectEvent}
              selectedEventIndex={sim.selectedEventIndex}
              onResetSimulation={sim.resetPacket}
              onClearEvents={sim.clearEvents}
            />
          </div>
        )}
      </div>

      {/* Fault Injection Drawer (Expandable) */}
      {showFaultDrawer && (
        <div
          style={{
            background: 'var(--bg-elev)',
            borderTop: '2px solid var(--accent)',
            padding: 12,
            boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong style={{ fontSize: 13, color: 'var(--text-h)' }}>
              Hardware Fault & Fiber Cut Controller (OSPF Convergence Trigger)
            </strong>
            <button className="btn" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => setShowFaultDrawer(false)}>
              ✕ Hide
            </button>
          </div>
          <FaultControls
            failedLinks={sim.failedLinks}
            recoveringLinks={sim.recoveringLinks}
            onSimulateCoreSecurity={sim.simulateCoreSecurityFailure}
            onSimulateCorePassenger={sim.simulateCorePassengerFailure}
            onRestoreAll={sim.restoreAllLinks}
            onResetNetwork={sim.resetNetwork}
          />
        </div>
      )}

      {/* Packet Tracer Style Bottom Status & Docking Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          padding: '6px 14px',
          background: 'var(--bg-elev)',
          borderTop: '1px solid var(--border)',
          fontSize: 12,
          fontFamily: 'var(--mono)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>⏱ Time: 00:0{Math.floor(sim.simTimeSec / 60)}:{Math.floor(sim.simTimeSec % 60).toString().padStart(2, '0')}.{(sim.simTimeSec % 1).toFixed(3).slice(2)}</span>
          <span>·</span>
          <span>
            PDU:{' '}
            <strong style={{ color: sim.packetState.active ? 'var(--status-ok)' : 'var(--text-m)' }}>
              {sim.packetState.active ? `${sim.packetState.id} (${sim.packetState.status})` : 'IDLE'}
            </strong>
          </span>
          {sim.failedLinks.size > 0 && (
            <>
              <span>·</span>
              <span className="sev-CRIT">⚠ {sim.failedLinks.size} LINK DOWN</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className={`btn ${showFaultDrawer ? 'btn-danger' : ''}`}
            style={{ padding: '4px 10px', fontSize: 11.5 }}
            onClick={() => setShowFaultDrawer((v) => !v)}
          >
            ⚠ Fault Controls
          </button>

          <button
            className="btn"
            style={{ padding: '4px 10px', fontSize: 11.5 }}
            onClick={() => setShowDeviceModal(true)}
            title="Inspect Selected Device CLI & Config"
          >
            📋 Device CLI
          </button>

          {sim.packetState.active && (
            <button
              className="btn btn-primary"
              style={{ padding: '4px 10px', fontSize: 11.5 }}
              onClick={() => setShowPduModal(true)}
              title="Inspect OSI Layers & Headers"
            >
              ✉ PDU Inspector
            </button>
          )}

          <button
            className={`btn ${showEventList ? 'btn-primary' : ''}`}
            style={{ padding: '4px 10px', fontSize: 11.5 }}
            onClick={() => setShowEventList((v) => !v)}
            title="Toggle Right Simulation Panel"
          >
            ☰ Event List
          </button>
        </div>
      </div>

      {/* Modals */}
      {showPduModal && (
        <PDUInspectorModal
          pdu={sim.packetState.pdu}
          packetState={sim.packetState}
          onClose={() => setShowPduModal(false)}
        />
      )}

      {showDeviceModal && (
        <DeviceInspectorModal
          deviceId={sim.selectedEntity.id || 'Airport-Core-RTR'}
          failedLinks={sim.failedLinks}
          onClose={() => setShowDeviceModal(false)}
          onSendPacket={sim.sendPacket}
        />
      )}

      {showPacketCreator && (
        <PacketCreationModal
          onClose={() => setShowPacketCreator(false)}
          onSendPacket={sim.sendPacket}
        />
      )}

      {showScenariosModal && (
        <ScenariosModal
          scenarios={sim.scenarios}
          onClose={() => setShowScenariosModal(false)}
          onRunScenario={(sc) => sc.run()}
        />
      )}
    </div>
  );
}
