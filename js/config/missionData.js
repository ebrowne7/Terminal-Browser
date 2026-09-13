import { LEVEL_OBJECTIVES } from './levelData.js';

const CORE_OBJECTIVES = [
  { id: 'tutorial_complete', description: 'Complete the terminal tutorial' },
  { id: 'inspect_home', description: 'Inspect the localhost home directory' },
  { id: 'add_proxy_us', description: 'Add the US relay to the route' },
  { id: 'connect_proxy_us', description: 'Connect to the US relay' },
  { id: 'probe_bank', description: 'Probe Bank Central Gateway' },
  { id: 'inspect_bank_files', description: 'Inspect Bank Central files' },
  { id: 'crack_pass', description: 'Crack the bank password file' },
  { id: 'read_pass', description: 'Read the bank password file' },
  { id: 'download_db', description: 'Download the bank account ledger' },
  { id: 'disconnect_bank', description: 'Disconnect from the bank' },
  { id: 'probe_military', description: 'Probe the Defense Grid' },
  { id: 'crack_payload', description: 'Crack the missile schematics' },
  { id: 'clear_logs', description: 'Clear the Defense Grid logs' },
  { id: 'add_proxy_eu', description: 'Add the European relay to the route' },
  { id: 'connect_proxy_eu', description: 'Connect to the European relay' },
  { id: 'inspect_military_files', description: 'Inspect Defense Grid files' },
  { id: 'read_payload', description: 'Read the missile schematics' },
  { id: 'disconnect_defense', description: 'Disconnect from the Defense Grid' },
  { id: 'download_payload', description: 'Download the missile schematics' },
  { id: 'return_home', description: 'Return to localhost' }
];

export const MISSION_OBJECTIVES = [...CORE_OBJECTIVES, ...LEVEL_OBJECTIVES];
