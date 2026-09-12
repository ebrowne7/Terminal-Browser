import { LEVEL_OBJECTIVES } from './levelData.js';

const CORE_OBJECTIVES = [
  { id: 'tutorial_complete', description: 'Complete the terminal tutorial' },
  { id: 'inspect_home', description: 'Inspect the localhost home directory' },
  { id: 'add_proxy_us', description: 'Add the US relay (10.0.8.2) to the route' },
  { id: 'connect_proxy_us', description: 'Connect to the US relay' },
  { id: 'probe_bank', description: 'Probe open ports on Bank Central Gateway (192.168.1.104)' },
  { id: 'inspect_bank_files', description: 'Inspect the bank gateway system directory' },
  { id: 'crack_pass', description: 'Crack /sys/passwords.enc on Bank Central Gateway' },
  { id: 'read_pass', description: 'Read the decrypted bank password file' },
  { id: 'download_db', description: 'Download accounts.db from Bank Central Gateway' },
  { id: 'disconnect_bank', description: 'Disconnect from the bank gateway' },
  { id: 'probe_military', description: 'Probe open ports on Defense Grid Node (10.0.99.1)' },
  { id: 'crack_payload', description: 'Crack and retrieve missile_schematics.enc on Defense Grid Node' },
  { id: 'clear_logs', description: 'Delete /var/logs/access.log on Defense Grid Node' },
  { id: 'add_proxy_eu', description: 'Add the European relay (10.0.8.9) to the route' },
  { id: 'connect_proxy_eu', description: 'Connect to the European relay' },
  { id: 'inspect_military_files', description: 'Inspect the defense node classified directory' },
  { id: 'read_payload', description: 'Read the decrypted missile schematics' },
  { id: 'disconnect_defense', description: 'Disconnect from the defense grid' },
  { id: 'download_payload', description: 'Download missile_schematics.enc to localhost' },
  { id: 'return_home', description: 'Return to localhost after the final download' }
];

export const MISSION_OBJECTIVES = [...CORE_OBJECTIVES, ...LEVEL_OBJECTIVES];
