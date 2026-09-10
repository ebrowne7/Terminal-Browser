// --- 1. VFS Engine ---
class VirtualFileSystem {
  constructor() {
    this.root = { type: 'dir', name: '/', children: new Map() };
    this.currentPath = [];
  }

  getAbsolutePath() {
    return '/' + this.currentPath.join('/');
  }

  cd(targetPath) {
    if (targetPath === '/') {
      this.currentPath = [];
      return { success: true };
    }

    const segments = targetPath.startsWith('/')
      ? targetPath.split('/').filter(Boolean)
      : [...this.currentPath, ...targetPath.split('/').filter(Boolean)];

    let curr = this.root;
    const newPath = [];

    for (const seg of segments) {
      if (seg === '.') continue;
      if (seg === '..') {
        newPath.pop();
        continue;
      }

      if (curr.type !== 'dir' || !curr.children.has(seg)) {
        return { success: false, message: `Directory not found: ${targetPath}` };
      }

      const nextNode = curr.children.get(seg);
      if (nextNode.type !== 'dir') {
        return { success: false, message: `Not a directory: ${seg}` };
      }

      curr = nextNode;
      newPath.push(seg);
    }

    this.currentPath = newPath;
    return { success: true };
  }

  getNode(path) {
    const targetPath = path ? path : this.getAbsolutePath();
    const segments = targetPath.split('/').filter(Boolean);
    let curr = this.root;

    for (const seg of segments) {
      if (curr.type !== 'dir' || !curr.children.has(seg)) return null;
      curr = curr.children.get(seg);
    }
    return curr;
  }

  createDirectory(path) {
    const segments = path.split('/').filter(Boolean);
    let curr = this.root;

    for (const seg of segments) {
      if (!curr.children.has(seg)) {
        curr.children.set(seg, { type: 'dir', name: seg, children: new Map() });
      }
      curr = curr.children.get(seg);
    }
  }

  createFile(path, content, isEncrypted = false) {
    const segments = path.split('/').filter(Boolean);
    const fileName = segments.pop();
    if (!fileName) return;

    const dirPath = '/' + segments.join('/');
    this.createDirectory(dirPath);
    const parent = this.getNode(dirPath);

    if (parent && parent.type === 'dir') {
      parent.children.set(fileName, {
        type: 'file',
        name: fileName,
        content,
        isEncrypted
      });
    }
  }

  removeNode(name) {
    const curr = this.getNode();
    if (curr && curr.type === 'dir') {
      return curr.children.delete(name);
    }
    return false;
  }
}

// --- 2. Mission Objective Engine ---
class MissionManager {
  constructor() {
    this.objectives = [
      {
        id: 'download_db',
        description: 'Download accounts.db from Bank Central (192.168.1.104)',
        completed: false
      },
      {
        id: 'clear_logs',
        description: 'Delete /sys/logs/access.log on Bank Central',
        completed: false
      }
    ];
  }

  completeObjective(id) {
    const obj = this.objectives.find(o => o.id === id);
    if (obj && !obj.completed) {
      obj.completed = true;
      return true;
    }
    return false;
  }

  checkMissionComplete() {
    return this.objectives.every(o => o.completed);
  }
}

// --- 3. Network Registry & Bounce Proxy State ---
const bounceChain = []; // Proxy IPs chained before connecting

const networkNodes = {
  "127.0.0.1": {
    hostname: "LOCALHOST",
    traceRate: 0,
    isProxyable: false,
    vfs: new VirtualFileSystem()
  },
  "10.0.8.2": {
    hostname: "OPEN-PROXY-US",
    traceRate: 0,
    isProxyable: true,
    vfs: new VirtualFileSystem()
  },
  "10.0.8.9": {
    hostname: "OPEN-PROXY-EU",
    traceRate: 0,
    isProxyable: true,
    vfs: new VirtualFileSystem()
  },
  "192.168.1.104": {
    hostname: "BANK-CENTRAL-GATEWAY",
    traceRate: 3.0, // High trace rate by default
    isProxyable: false,
    vfs: new VirtualFileSystem()
  }
};

// Seed Filesystems
networkNodes["127.0.0.1"].vfs.createFile('/home/user/bounces.txt', 'Available Open Bounces:\n - 10.0.8.2\n - 10.0.8.9');
networkNodes["192.168.1.104"].vfs.createFile('/sys/accounts.db', 'ACCOUNT_PAYLOAD_DATA_HASH::88a91c');
networkNodes["192.168.1.104"].vfs.createFile('/sys/logs/access.log', '127.0.0.1 LOGIN ATTEMPT');

// --- 4. Trace Engine with Proxy Multipliers ---
class TraceEngine {
  constructor(hudNodeEl, traceFillEl, traceValEl, onTraceBurn) {
    this.hudNodeEl = hudNodeEl;
    this.traceFillEl = traceFillEl;
    this.traceValEl = traceValEl;
    this.onTraceBurn = onTraceBurn;

    this.currentIp = "127.0.0.1";
    this.tracePercent = 0;
    this.timer = null;
  }

  connect(ip) {
    if (!networkNodes[ip]) return false;

    this.currentIp = ip;
    const node = networkNodes[ip];
    this.hudNodeEl.textContent = `${node.hostname} (${ip})`;

    if (this.timer) clearInterval(this.timer);

    if (node.traceRate > 0) {
      // Each bounce proxy reduces effective trace rate by 40%
      const reductionFactor = Math.pow(0.6, bounceChain.length);
      const effectiveRate = node.traceRate * reductionFactor;

      this.timer = setInterval(() => {
        this.tracePercent += effectiveRate / 2;
        if (this.tracePercent >= 100) {
          this.tracePercent = 100;
          this.updateHUD();
          this.stop();
          this.onTraceBurn();
        } else {
          this.updateHUD();
        }
      }, 500);
    }
    return true;
  }

  disconnect() {
    this.stop();
    this.currentIp = "127.0.0.1";
    this.hudNodeEl.textContent = "LOCALHOST (127.0.0.1)";
    this.tracePercent = 0;
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

    if (rounded > 70) {
      this.traceFillEl.style.backgroundColor = 'var(--text-alert)';
    } else if (rounded > 35) {
      this.traceFillEl.style.backgroundColor = 'var(--text-warn)';
    } else {
      this.traceFillEl.style.backgroundColor = 'var(--text-color)';
    }
  }

  getActiveVFS() {
    return networkNodes[this.currentIp].vfs;
  }
}

// --- 5. Terminal UI & Command Router ---
class TerminalUI {
  constructor(outputEl, promptEl, inputEl) {
    this.outputEl = outputEl;
    this.promptEl = promptEl;
    this.inputEl = inputEl;
    this.history = [];
    this.historyIdx = -1;
    this.isProcessing = false;
  }

  print(text, className = '') {
    const line = document.createElement('div');
    if (className) line.className = className;
    line.textContent = text;
    this.outputEl.appendChild(line);
    this.scrollToBottom();
  }

  clear() {
    this.outputEl.innerHTML = '';
  }

  setPrompt(ip, path) {
    const host = networkNodes[ip].hostname.toLowerCase();
    this.promptEl.textContent = `root@${host}:${path}#`;
  }

  scrollToBottom() {
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Setup Instances
const outputEl = document.getElementById('output-log');
const promptEl = document.getElementById('prompt-label');
const inputEl = document.getElementById('cmd-input');
const hudNodeEl = document.getElementById('hud-node');
const traceFillEl = document.getElementById('trace-fill');
const traceValEl = document.getElementById('trace-val');

const ui = new TerminalUI(outputEl, promptEl, inputEl);
const missions = new MissionManager();

const traceEngine = new TraceEngine(hudNodeEl, traceFillEl, traceValEl, () => {
  ui.print("\n[ALERT] TRACE 100% COMPLETE. PHYSICAL LOCATION IDENTIFIED.", "alert");
  ui.print("[SYSTEM LOCKDOWN] CONNECTION TERMINATED.", "alert");
  inputEl.disabled = true;
});

// Commands Engine
const commands = {
  help: async () => {
    ui.print("SYSTEM COMMANDS:");
    ui.print("  ls [path]         - List directory contents");
    ui.print("  cd <path>         - Change directory");
    ui.print("  cat <file>        - Read file");
    ui.print("  rm <file>         - Delete file");
    ui.print("  download <file>   - Download target file to localhost");
    ui.print("  bounce <ip>       - Append proxy node to route chain");
    ui.print("  connect <ip>      - Establish connection using active proxy chain");
    ui.print("  disconnect        - Disconnect and clear bounce route");
    ui.print("  objectives        - Show current mission status");
    ui.print("  clear             - Clear display");
  },

  objectives: async () => {
    ui.print("ACTIVE MISSION OBJECTIVES:");
    missions.objectives.forEach(obj => {
      const status = obj.completed ? "[COMPLETE]" : "[PENDING]";
      ui.print(`  ${status} ${obj.description}`);
    });
  },

  bounce: async (args) => {
    if (!args[0]) return ui.print("Usage: bounce <IP>");
    const ip = args[0];

    if (!networkNodes[ip] || !networkNodes[ip].isProxyable) {
      return ui.print(`[ERROR] Invalid proxy node: ${ip}`, "warn");
    }

    if (bounceChain.includes(ip)) {
      return ui.print(`Proxy ${ip} already present in bounce chain.`);
    }

    bounceChain.push(ip);
    ui.print(`[PROXY ADDED] Route chain: Localhost -> ${bounceChain.join(' -> ')}`);
  },

  connect: async (args) => {
    if (!args[0]) return ui.print("Usage: connect <IP>");
    const targetIp = args[0];

    const chainStr = bounceChain.length > 0 ? `${bounceChain.join(' -> ')} -> ${targetIp}` : targetIp;
    ui.print(`Routing connection via: Localhost -> ${chainStr}...`);
    await delay(600);

    const success = traceEngine.connect(targetIp);
    if (success) {
      ui.print(`[CONNECTED] Session established.`, "warn");
      if (bounceChain.length > 0) {
        ui.print(`Trace speed reduced by ${100 - Math.round(Math.pow(0.6, bounceChain.length) * 100)}% via bounce nodes.`);
      }
      ui.setPrompt(traceEngine.currentIp, traceEngine.getActiveVFS().getAbsolutePath());
    } else {
      ui.print(`[ERROR] Host connection timed out: ${targetIp}`, "alert");
    }
  },

  disconnect: async () => {
    if (traceEngine.currentIp === "127.0.0.1") return ui.print("Already connected to localhost.");
    
    traceEngine.disconnect();
    bounceChain.length = 0; // Clear proxy chain on disconnect
    ui.print("[DISCONNECTED] Proxy chain reset. Returned to localhost.");
    ui.setPrompt(traceEngine.currentIp, traceEngine.getActiveVFS().getAbsolutePath());
  },

  download: async (args) => {
    if (!args[0]) return ui.print("Usage: download <filename>");
    const vfs = traceEngine.getActiveVFS();
    const curr = vfs.getNode();

    if (curr && curr.type === 'dir' && curr.children.has(args[0])) {
      const file = curr.children.get(args[0]);
      if (file.type === 'file') {
        ui.print(`Downloading '${args[0]}' to local storage...`);
        await delay(1000);
        
        // Copy to localhost VFS
        networkNodes["127.0.0.1"].vfs.createFile(`/home/user/${args[0]}`, file.content);
        ui.print(`[SUCCESS] File '${args[0]}' saved locally.`);

        // Mission Objective Check
        if (traceEngine.currentIp === "192.168.1.104" && args[0] === "accounts.db") {
          if (missions.completeObjective('download_db')) {
            ui.print(`\n[OBJECTIVE UPDATED] Downloaded accounts.db from Bank Central!`, "warn");
            checkWinState();
          }
        }
      }
    } else {
      ui.print(`File '${args[0]}' not found.`);
    }
  },

  rm: async (args) => {
    if (!args[0]) return ui.print("Usage: rm <filename>");
    const vfs = traceEngine.getActiveVFS();
    
    // Check path for mission objective
    const isAccessLog = traceEngine.currentIp === "192.168.1.104" && args[0] === "access.log" && vfs.getAbsolutePath() === "/sys/logs";
    
    const removed = vfs.removeNode(args[0]);
    if (removed) {
      ui.print(`File '${args[0]}' deleted.`);
      if (isAccessLog) {
        if (missions.completeObjective('clear_logs')) {
          ui.print(`\n[OBJECTIVE UPDATED] Cleared system logs from Bank Central!`, "warn");
          checkWinState();
        }
      }
    } else {
      ui.print(`rm: cannot remove '${args[0]}': No such file or directory`);
    }
  },

  ls: async () => {
    const vfs = traceEngine.getActiveVFS();
    const node = vfs.getNode();
    if (!node || node.type !== 'dir') return ui.print("Error reading directory.", "warn");
    if (node.children.size === 0) return ui.print("(empty)", "dim");

    node.children.forEach((child) => {
      const type = child.type === 'dir' ? '[DIR] ' : '      ';
      ui.print(`${type} ${child.name}`);
    });
  },

  cd: async (args) => {
    const vfs = traceEngine.getActiveVFS();
    const res = vfs.cd(args[0] || '/');
    if (!res.success) {
      ui.print(res.message, "warn");
    } else {
      ui.setPrompt(traceEngine.currentIp, vfs.getAbsolutePath());
    }
  },

  cat: async (args) => {
    if (!args[0]) return ui.print("Usage: cat <filename>");
    const vfs = traceEngine.getActiveVFS();
    const curr = vfs.getNode();

    if (curr && curr.type === 'dir' && curr.children.has(args[0])) {
      ui.print(curr.children.get(args[0]).content);
    } else {
      ui.print(`cat: ${args[0]}: No such file`);
    }
  },

  clear: async () => ui.clear()
};

function checkWinState() {
  if (missions.checkMissionComplete()) {
    ui.print("\n==================================================", "warn");
    ui.print("  ALL MISSION OBJECTIVES COMPLETE! CONTRACT WON.", "warn");
    ui.print("==================================================\n", "warn");
  }
}

// Input Listener
inputEl.addEventListener('keydown', async (e) => {
  if (ui.isProcessing) return;

  if (e.key === 'Enter') {
    const rawInput = inputEl.value;
    inputEl.value = '';

    if (!rawInput.trim()) return;

    ui.print(`${promptEl.textContent} ${rawInput}`);
    ui.history.push(rawInput);
    ui.historyIdx = ui.history.length;

    const tokens = rawInput.trim().match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1).map(a => a.replace(/^"|"$/g, ''));

    if (commands[cmd]) {
      ui.isProcessing = true;
      inputEl.disabled = true;
      try {
        await commands[cmd](args);
      } catch (err) {
        ui.print(`Execution error: ${err.message}`, "warn");
      }
      inputEl.disabled = false;
      ui.isProcessing = false;
      inputEl.focus();
    } else {
      ui.print(`Command not recognized: '${cmd}'`, "warn");
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (ui.historyIdx > 0) {
      ui.historyIdx--;
      inputEl.value = ui.history[ui.historyIdx];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (ui.historyIdx < ui.history.length - 1) {
      ui.historyIdx++;
      inputEl.value = ui.history[ui.historyIdx];
    } else {
      ui.historyIdx = ui.history.length;
      inputEl.value = '';
    }
  }
});

// Boot Banner
ui.print("NODE-OS Terminal System v1.09");
ui.print("Type 'objectives' to check active mission requirements.");
ui.print("Type 'cat home/user/bounces.txt' for proxy IPs.\n");
ui.setPrompt(traceEngine.currentIp, traceEngine.getActiveVFS().getAbsolutePath());