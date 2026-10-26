export const NETWORK_TIMESTAMP = new Date().toLocaleString();

export const ROUTERS = [
  {
    id: 'Airport-Core-RTR',
    shortId: 'R0',
    name: 'Airport-Core-RTR',
    role: 'Backbone Core Router',
    routerId: '1.1.1.1',
    area: 'Area 0',
    interfaces: [
      { name: 'G0/0', ip: '10.0.0.1/30', to: 'Passenger-RTR (G0/0)', status: 'UP', protocol: 'UP', linkId: 'core-passenger', mac: '0001.42A1.0001' },
      { name: 'G0/1', ip: '10.0.0.5/30', to: 'Security-RTR (G0/0)', status: 'UP', protocol: 'UP', linkId: 'core-security', mac: '0001.42A1.0002' },
      { name: 'G0/2', ip: '192.168.40.1/24', to: 'Admin-SW', status: 'UP', protocol: 'UP', linkId: 'core-admin-sw', mac: '0001.42A1.0003' },
    ],
  },
  {
    id: 'Passenger-RTR',
    shortId: 'R1',
    name: 'Passenger-RTR',
    role: 'Passenger Terminal Gateway',
    routerId: '2.2.2.2',
    area: 'Area 0',
    interfaces: [
      { name: 'G0/0', ip: '10.0.0.2/30', to: 'Airport-Core-RTR (G0/0)', status: 'UP', protocol: 'UP', linkId: 'core-passenger', mac: '0002.42A2.0001' },
      { name: 'G0/1', ip: '10.0.0.9/30', to: 'Operations-RTR (G0/0)', status: 'UP', protocol: 'UP', linkId: 'passenger-ops', mac: '0002.42A2.0002' },
      { name: 'G0/2', ip: '192.168.10.1/24', to: 'Passenger-SW', status: 'UP', protocol: 'UP', linkId: 'passenger-sw-link', mac: '0002.42A2.0003' },
    ],
  },
  {
    id: 'Security-RTR',
    shortId: 'R2',
    name: 'Security-RTR',
    role: 'Security & Surveillance Gateway',
    routerId: '3.3.3.3',
    area: 'Area 0',
    interfaces: [
      { name: 'G0/0', ip: '10.0.0.6/30', to: 'Airport-Core-RTR (G0/1)', status: 'UP', protocol: 'UP', linkId: 'core-security', mac: '0003.42A3.0001' },
      { name: 'G0/1', ip: '10.0.0.13/30', to: 'Operations-RTR (G0/1)', status: 'UP', protocol: 'UP', linkId: 'security-ops', mac: '0003.42A3.0002' },
      { name: 'G0/2', ip: '192.168.20.1/24', to: 'Security-SW', status: 'UP', protocol: 'UP', linkId: 'security-sw-link', mac: '0003.42A3.0003' },
    ],
  },
  {
    id: 'Operations-RTR',
    shortId: 'R3',
    name: 'Operations-RTR',
    role: 'Flight Operations Gateway',
    routerId: '4.4.4.4',
    area: 'Area 0',
    interfaces: [
      { name: 'G0/0', ip: '10.0.0.10/30', to: 'Passenger-RTR (G0/1)', status: 'UP', protocol: 'UP', linkId: 'passenger-ops', mac: '0004.42A4.0001' },
      { name: 'G0/1', ip: '10.0.0.14/30', to: 'Security-RTR (G0/1)', status: 'UP', protocol: 'UP', linkId: 'security-ops', mac: '0004.42A4.0002' },
      { name: 'G0/2', ip: '192.168.30.1/24', to: 'Operations-SW', status: 'UP', protocol: 'UP', linkId: 'ops-sw-link', mac: '0004.42A4.0003' },
    ],
  },
];

export const SWITCHES = [
  { id: 'Passenger-SW', name: 'Passenger-SW', uplink: 'Passenger-RTR (G0/2)', vlan: 10, hosts: 48, status: 'UP', department: 'Passenger Services', mac: '0060.70B1.0001' },
  { id: 'Security-SW', name: 'Security-SW', uplink: 'Security-RTR (G0/2)', vlan: 20, hosts: 24, status: 'UP', department: 'Security', mac: '0060.70B2.0001' },
  { id: 'Operations-SW', name: 'Operations-SW', uplink: 'Operations-RTR (G0/2)', vlan: 30, hosts: 36, status: 'UP', department: 'Operations', mac: '0060.70B3.0001' },
  { id: 'Admin-SW', name: 'Admin-SW', uplink: 'Airport-Core-RTR (G0/2)', vlan: 40, hosts: 18, status: 'UP', department: 'Administration', mac: '0060.70B4.0001' },
];

export const END_DEVICES = [
  { id: 'Passenger-PC', name: 'Passenger-PC', ip: '192.168.10.10', gateway: '192.168.10.1', switchId: 'Passenger-SW', vlan: 10, role: 'Check-in Kiosk / Passenger Terminal', mac: '000C.29F1.A110' },
  { id: 'Security-PC', name: 'Security-PC', ip: '192.168.20.10', gateway: '192.168.20.1', switchId: 'Security-SW', vlan: 20, role: 'CCTV / Baggage Scanner Console', mac: '000C.29F2.B220' },
  { id: 'Operations-PC', name: 'Operations-PC', ip: '192.168.30.10', gateway: '192.168.30.1', switchId: 'Operations-SW', vlan: 30, role: 'Air Traffic Control / Flight Dispatch', mac: '000C.29F3.C330' },
  { id: 'Admin-PC', name: 'Admin-PC', ip: '192.168.40.10', gateway: '192.168.40.1', switchId: 'Admin-SW', vlan: 40, role: 'Campus Network Admin Management', mac: '000C.29F4.D440' },
  { id: 'DNS-Server', name: 'DNS Server', ip: '192.168.40.20', gateway: '192.168.40.1', switchId: 'Admin-SW', vlan: 40, domain: 'airport.local', role: 'Internal DNS Server (airport.local)', mac: '000C.29F5.E550' },
];

export const NETWORKS = [
  {
    id: 'passenger',
    name: 'Passenger Services',
    subnet: '192.168.10.0/24',
    gateway: '192.168.10.1',
    vlan: 10,
    color: '#0ea5e9',
    hostsTotal: 48,
    hostsActive: 42,
    utilization: 38,
    router: 'Passenger-RTR',
    status: 'OK',
    description: 'Public Wi-Fi, check-in kiosks, FIDS displays, baggage taggers',
    sampleHosts: [
      { ip: '192.168.10.10', name: 'Passenger-PC', reachable: true },
      { ip: '192.168.10.25', name: 'AP-TerminalA', reachable: true },
      { ip: '192.168.10.40', name: 'FIDS-GateB', reachable: true },
    ],
  },
  {
    id: 'security',
    name: 'Security & Surveillance',
    subnet: '192.168.20.0/24',
    gateway: '192.168.20.1',
    vlan: 20,
    color: '#ef4444',
    hostsTotal: 24,
    hostsActive: 24,
    utilization: 62,
    router: 'Security-RTR',
    status: 'OK',
    description: 'CCTV surveillance, automated access control, biometric gates',
    sampleHosts: [
      { ip: '192.168.20.10', name: 'Security-PC', reachable: true },
      { ip: '192.168.20.12', name: 'AccessCtrl-Gate3', reachable: true },
      { ip: '192.168.20.20', name: 'Xray-Belt-2', reachable: true },
    ],
  },
  {
    id: 'operations',
    name: 'Flight Operations',
    subnet: '192.168.30.0/24',
    gateway: '192.168.30.1',
    vlan: 30,
    color: '#f59e0b',
    hostsTotal: 36,
    hostsActive: 33,
    utilization: 71,
    router: 'Operations-RTR',
    status: 'OK',
    description: 'Tower comms, ATC workstations, flight dispatch, runway radar',
    sampleHosts: [
      { ip: '192.168.30.10', name: 'Operations-PC', reachable: true },
      { ip: '192.168.30.15', name: 'Dispatch-Server', reachable: true },
      { ip: '192.168.30.28', name: 'Weather-Terminal', reachable: true },
    ],
  },
  {
    id: 'administration',
    name: 'Administration & Finance',
    subnet: '192.168.40.0/24',
    gateway: '192.168.40.1',
    vlan: 40,
    color: '#8b5cf6',
    hostsTotal: 18,
    hostsActive: 16,
    utilization: 24,
    router: 'Airport-Core-RTR',
    status: 'OK',
    description: 'Executive terminals, DNS server, database, management VLAN',
    sampleHosts: [
      { ip: '192.168.40.10', name: 'Admin-PC', reachable: true },
      { ip: '192.168.40.20', name: 'DNS Server (airport.local)', reachable: true },
      { ip: '192.168.40.16', name: 'Director-Office', reachable: true },
    ],
  },
];

export const OSPF_NEIGHBORS = [
  { router: 'Airport-Core-RTR', neighborId: '2.2.2.2', neighborName: 'Passenger-RTR', ip: '10.0.0.2', state: 'FULL/DR', area: 0, uptime: '04:22:18', iface: 'G0/0' },
  { router: 'Airport-Core-RTR', neighborId: '3.3.3.3', neighborName: 'Security-RTR', ip: '10.0.0.6', state: 'FULL/BDR', area: 0, uptime: '04:22:10', iface: 'G0/1' },
  { router: 'Passenger-RTR', neighborId: '1.1.1.1', neighborName: 'Airport-Core-RTR', ip: '10.0.0.1', state: 'FULL/BDR', area: 0, uptime: '04:22:18', iface: 'G0/0' },
  { router: 'Passenger-RTR', neighborId: '4.4.4.4', neighborName: 'Operations-RTR', ip: '10.0.0.10', state: 'FULL/DR', area: 0, uptime: '04:22:15', iface: 'G0/1' },
  { router: 'Security-RTR', neighborId: '1.1.1.1', neighborName: 'Airport-Core-RTR', ip: '10.0.0.5', state: 'FULL/DR', area: 0, uptime: '04:22:10', iface: 'G0/0' },
  { router: 'Security-RTR', neighborId: '4.4.4.4', neighborName: 'Operations-RTR', ip: '10.0.0.14', state: 'FULL/BDR', area: 0, uptime: '04:22:12', iface: 'G0/1' },
  { router: 'Operations-RTR', neighborId: '2.2.2.2', neighborName: 'Passenger-RTR', ip: '10.0.0.9', state: 'FULL/BDR', area: 0, uptime: '04:22:15', iface: 'G0/0' },
  { router: 'Operations-RTR', neighborId: '3.3.3.3', neighborName: 'Security-RTR', ip: '10.0.0.13', state: 'FULL/DR', area: 0, uptime: '04:22:12', iface: 'G0/1' },
];

export const REDUNDANT_PATHS = [
  {
    id: 'PATH-A',
    label: 'Primary Path to Operations (via Passenger-RTR)',
    role: 'primary',
    hops: ['Airport-Core-RTR', 'Passenger-RTR', 'Operations-RTR', 'Operations-SW', 'Operations-PC'],
    links: ['Airport-Core-RTR:G0/0 ↔ Passenger-RTR:G0/0 (10.0.0.0/30)', 'Passenger-RTR:G0/1 ↔ Operations-RTR:G0/0 (10.0.0.8/30)'],
    metric: 20,
    latencyMs: 2,
    status: 'ACTIVE',
  },
  {
    id: 'PATH-B',
    label: 'Equal-Cost Alternative Path to Operations (via Security-RTR)',
    role: 'backup',
    hops: ['Airport-Core-RTR', 'Security-RTR', 'Operations-RTR', 'Operations-SW', 'Operations-PC'],
    links: ['Airport-Core-RTR:G0/1 ↔ Security-RTR:G0/0 (10.0.0.4/30)', 'Security-RTR:G0/1 ↔ Operations-RTR:G0/1 (10.0.0.12/30)'],
    metric: 20,
    latencyMs: 2,
    status: 'STANDBY',
  },
];

export const PACKET_LOSS = {
  overall: 0,
  perRouter: {
    R0: 0,
    R1: 0,
    R2: 0,
    R3: 0,
    'Airport-Core-RTR': 0,
    'Passenger-RTR': 0,
    'Security-RTR': 0,
    'Operations-RTR': 0,
  },
  perNetwork: { passenger: 0, security: 0, operations: 0, administration: 0 },
};

export const INTERFACE_ERRORS = {
  R0: { input: 0, output: 0, crc: 0, collisions: 0 },
  R1: { input: 0, output: 0, crc: 0, collisions: 0 },
  R2: { input: 0, output: 0, crc: 0, collisions: 0 },
  R3: { input: 0, output: 0, crc: 0, collisions: 0 },
  'Airport-Core-RTR': { input: 0, output: 0, crc: 0, collisions: 0 },
  'Passenger-RTR': { input: 0, output: 0, crc: 0, collisions: 0 },
  'Security-RTR': { input: 0, output: 0, crc: 0, collisions: 0 },
  'Operations-RTR': { input: 0, output: 0, crc: 0, collisions: 0 },
};

export const INITIAL_FAULT_LOG = [
  {
    ts: '2026-10-26 09:15:42',
    severity: 'INFO',
    category: 'ROUTING',
    source: 'OSPF Area 0',
    message: 'OSPF process 1 initialized across 4 routers in Area 0 backbone',
  },
  {
    ts: '2026-10-26 09:15:44',
    severity: 'OK',
    category: 'ROUTING',
    source: 'Airport-Core-RTR',
    message: 'OSPF adjacency FULL with Passenger-RTR (2.2.2.2) via G0/0 (10.0.0.0/30)',
  },
  {
    ts: '2026-10-26 09:15:46',
    severity: 'OK',
    category: 'ROUTING',
    source: 'Airport-Core-RTR',
    message: 'OSPF adjacency FULL with Security-RTR (3.3.3.3) via G0/1 (10.0.0.4/30)',
  },
  {
    ts: '2026-10-26 09:15:48',
    severity: 'OK',
    category: 'ROUTING',
    source: 'Passenger-RTR',
    message: 'OSPF adjacency FULL with Operations-RTR (4.4.4.4) via G0/1 (10.0.0.8/30)',
  },
  {
    ts: '2026-10-26 09:15:50',
    severity: 'OK',
    category: 'ROUTING',
    source: 'Security-RTR',
    message: 'OSPF adjacency FULL with Operations-RTR (4.4.4.4) via G0/1 (10.0.0.12/30)',
  },
  {
    ts: '2026-10-26 09:16:02',
    severity: 'INFO',
    category: 'ROUTING',
    source: 'Airport-Core-RTR',
    message: 'Equal-Cost Multi-Path (ECMP) installed for Flight Operations (192.168.30.0/24)',
  },
  {
    ts: '2026-10-26 09:16:15',
    severity: 'OK',
    category: 'PACKET',
    source: 'DNS Server',
    message: 'Authoritative zone loaded: airport.local -> 192.168.40.20',
  },
];

export const OVERALL_SUMMARY = {
  name: 'Airport Campus NOC Network',
  ospfArea: 0,
  routersTotal: 4,
  routersUp: 4,
  switchesTotal: 4,
  switchesUp: 4,
  networksTotal: 4,
  networksUp: 4,
  hostsTotal: 126,
  hostsActive: 115,
  dnsStatus: 'OK (airport.local: 192.168.40.20)',
  ospfAdjacencies: 8,
  activeRedundantPaths: 2,
};
