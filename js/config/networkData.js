export const NETWORK_CONFIG = {
  '127.0.0.1': { hostname: 'LOCALHOST', baseTraceRate: 0, isProxyable: false, ports: [22, 80] },
  '10.0.8.2': { hostname: 'OPEN-PROXY-US', baseTraceRate: 0, isProxyable: true, ports: [80, 8080, 3128] },
  '10.0.8.9': { hostname: 'OPEN-PROXY-EU', baseTraceRate: 0, isProxyable: true, ports: [80, 1080] },
  '192.168.1.104': { hostname: 'BANK-CENTRAL-GATEWAY', baseTraceRate: 3.5, isProxyable: false, ports: [21, 22, 80, 443] },
  '10.0.99.1': { hostname: 'DEFENSE-GRID-NODE', baseTraceRate: 9.0, isProxyable: false, ports: [22, 8080, 9001] }
};

export const DEFAULT_FILES = {
  '127.0.0.1': [
    { path: '/home/user/bounces.txt', content: 'Available Open Proxies:\n - 10.0.8.2\n - 10.0.8.9' }
  ],
  '192.168.1.104': [
    { path: '/sys/accounts.db', content: 'PAYLOAD_DATA::HASH_BANK_ACC_00192' },
    { path: '/sys/passwords.enc', content: 'ENC::MILITARY_GATEWAY_IP=10.0.99.1', isEncrypted: true }
  ],
  '10.0.99.1': [
    { path: '/classified/missile_schematics.enc', content: 'ENC::TOP_SECRET_CORE_DIAGRAM_V4', isEncrypted: true },
    { path: '/var/logs/access.log', content: '127.0.0.1 INTRUSION DETECTED' }
  ]
};
