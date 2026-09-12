export const STAGES = [
  {
    number: 1,
    title: 'FIRST CONTACT',
    intro: 'Your handler has given you a terminal and a clean identity. Learn the basics: inspect files, discover a relay, and make your first controlled connection.',
    objectiveIds: ['tutorial_complete', 'inspect_home'],
    traceBonus: 0
  },
  {
    number: 2,
    title: 'BUILD THE ROUTE',
    intro: 'Direct connections leave a clear trail. Add the US relay to your route before touching anything valuable. More hops mean more time.',
    objectiveIds: ['add_proxy_us', 'connect_proxy_us'],
    traceBonus: 0.5
  },
  {
    number: 3,
    title: 'RECONNAISSANCE',
    intro: 'The bank gateway is listening. Probe it first; knowledge of its open ports will tell you which tools can reach the target.',
    objectiveIds: ['probe_bank', 'inspect_bank_files'],
    traceBonus: 1
  },
  {
    number: 4,
    title: 'CRACK THE VAULT',
    intro: 'The bank is hiding a credential file behind encryption. Recover it before the gateway identifies your route.',
    objectiveIds: ['crack_pass', 'read_pass'],
    traceBonus: 1.5
  },
  {
    number: 5,
    title: 'TAKE THE LEDGER',
    intro: 'One file is worth the risk. Download the account ledger to localhost, then disconnect before the trail gets warm.',
    objectiveIds: ['download_db', 'disconnect_bank'],
    traceBonus: 2
  },
  {
    number: 6,
    title: 'FIND ANOTHER EXIT',
    intro: 'The next target is military grade. Discover the European relay and add it to your route before you move deeper.',
    objectiveIds: ['add_proxy_eu', 'connect_proxy_eu'],
    traceBonus: 2.5
  },
  {
    number: 7,
    title: 'DEFENSE GRID',
    intro: 'The defense node is active and impatient. Probe its services quickly; every second on this host is expensive.',
    objectiveIds: ['probe_military', 'inspect_military_files'],
    traceBonus: 3
  },
  {
    number: 8,
    title: 'CLASSIFIED MATERIAL',
    intro: 'You found the payload. Crack the encrypted schematics and prove that your new skills can survive a hardened system.',
    objectiveIds: ['crack_payload', 'read_payload'],
    traceBonus: 3.5
  },
  {
    number: 9,
    title: 'COVER YOUR TRACKS',
    intro: 'The access log has recorded your presence. Remove it from the defense node before the investigation becomes physical.',
    objectiveIds: ['clear_logs', 'disconnect_defense'],
    traceBonus: 4
  },
  {
    number: 10,
    title: 'THE EXFILTRATION',
    intro: 'This is the final run. Download the schematics, use every relay you found, and bring the evidence home without being traced.',
    objectiveIds: ['download_payload', 'return_home'],
    traceBonus: 5
  }
];
