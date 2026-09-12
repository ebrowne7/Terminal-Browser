export class TraceEngine {
  constructor(network, levelManager, hudNodeEl, traceFillEl, traceValEl, onTraceBurn) {
    this.network = network;
    this.levelManager = levelManager;
    this.hudNodeEl = hudNodeEl;
    this.traceFillEl = traceFillEl;
    this.traceValEl = traceValEl;
    this.onTraceBurn = onTraceBurn;
    this.currentIp = '127.0.0.1';
    this.tracePercent = 0;
    this.timer = null;
    this.currentEffectiveRate = 0;
  }

  connect(ip) {
    if (!this.network.has(ip)) return false;

    this.currentIp = ip;
    const node = this.network.get(ip);
    this.hudNodeEl.textContent = `${node.hostname} (${ip})`;
    this.stop();

    if (node.baseTraceRate > 0) {
      const proxyHops = this.network.bounceChain.length;
      const stagePressure = this.levelManager?.traceBonus || 0;
      this.currentEffectiveRate = (node.baseTraceRate + stagePressure) / (1 + 0.5 * proxyHops);
      this.timer = setInterval(() => {
        this.tracePercent += this.currentEffectiveRate / 2;
        if (this.tracePercent >= 100) {
          this.tracePercent = 100;
          this.updateHUD();
          this.stop();
          this.onTraceBurn();
        } else {
          this.updateHUD();
        }
      }, 500);
    } else {
      this.currentEffectiveRate = 0;
    }

    return true;
  }

  disconnect() {
    this.stop();
    this.currentIp = '127.0.0.1';
    this.hudNodeEl.textContent = 'LOCALHOST (127.0.0.1)';
    this.tracePercent = 0;
    this.currentEffectiveRate = 0;
    this.updateHUD();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateHUD() {
    const rounded = Math.floor(this.tracePercent);
    this.traceValEl.textContent = `${rounded}%`;
    this.traceFillEl.style.width = `${rounded}%`;
    this.traceFillEl.style.backgroundColor = rounded > 70
      ? 'var(--text-alert)'
      : rounded > 35 ? 'var(--text-warn)' : 'var(--text-color)';
  }

  getActiveVFS() {
    return this.network.getActiveVFS(this.currentIp);
  }
}
