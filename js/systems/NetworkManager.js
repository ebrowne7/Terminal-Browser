import { DEFAULT_FILES, NETWORK_CONFIG } from '../config/networkData.js';
import { VirtualFileSystem } from '../core/VirtualFileSystem.js';

export class NetworkManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.bounceChain = [];
    this.nodes = Object.fromEntries(
      Object.entries(NETWORK_CONFIG).map(([ip, config]) => [
        ip,
        { ...config, vfs: new VirtualFileSystem() }
      ])
    );

    for (const [ip, files] of Object.entries(DEFAULT_FILES)) {
      for (const file of files) {
        this.nodes[ip].vfs.createFile(file.path, file.content, file.isEncrypted);
      }
    }
  }

  has(ip) {
    return Boolean(this.nodes[ip]);
  }

  get(ip) {
    return this.nodes[ip];
  }

  getActiveVFS(ip) {
    return this.nodes[ip].vfs;
  }

  addProxy(ip) {
    if (!this.has(ip) || !this.get(ip).isProxyable) return { success: false, reason: 'invalid' };
    if (this.bounceChain.includes(ip)) return { success: false, reason: 'duplicate' };
    this.bounceChain.push(ip);
    return { success: true };
  }

  setBounceChain(chain) {
    this.bounceChain = Array.isArray(chain) ? [...chain].filter(ip => this.has(ip) && this.get(ip).isProxyable) : [];
  }
}
