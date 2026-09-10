// --- 1. Virtual File System Engine ---
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

// --- 2. Mission Objective Manager ---
class MissionManager {
  constructor() {
    this.objectives = [
      {
        id: 'probe_bank',
        description: 'Probe open ports on Bank Central Gateway (192.168.1.104)',
        completed: false
      },
      {
        id: 'crack_pass',
        description: 'Crack /sys/passwords.enc on Bank Central Gateway',
        completed: false
      },
      {
        id: 'download_db',
        description: 'Download accounts.db from Bank Central Gateway',
        completed: false
      },
      {
        id: 'probe_military',
        description: 'Probe open ports on Defense Grid Node (10.0.99.1)',
        completed: false
      },
      {
        id: 'crack_payload',
        description: 'Crack and retrieve missile_schematics.enc on Defense Grid Node',
        completed: false
      },
      {
        id: 'clear_logs',
        description: 'Delete /var/logs/access.log on Defense Grid Node',
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

// --- 3. Network Registry & Nodes Data ---
const bounceChain = [];

const networkNodes = {
  "127.0.0.1": {
    hostname: "LOCALHOST",
    baseTraceRate: 0,
    isProxyable: false,
    ports: [22, 80],
    vfs: new VirtualFileSystem()
  },
  "10.0.8.2": {
    hostname: "OPEN-PROXY-US",
    baseTraceRate: 0,
    isProxyable: true,
    ports: [80, 8080, 3128],
    vfs: new VirtualFileSystem()
  },
  "10.0.8.9": {
    hostname: "OPEN-PROXY-EU",
    baseTraceRate: 0,
    isProxyable: true,
    ports: [80, 1080],
    vfs: new VirtualFileSystem()
  },
  "192.168.1.104": {
    hostname: "BANK-CENTRAL-GATEWAY",
    baseTraceRate: 3.5, // % per second base
    isProxyable: false,
    ports: [21, 22, 80, 443],
    vfs: new VirtualFileSystem()
  },
  "10.0.99.1": {
    hostname: "DEFENSE-GRID-NODE",
    baseTraceRate: 9.0, // Extremely fast trace! Must use multiple proxies
    isProxyable: false,
    ports: [22, 8080, 9001],
    vfs: new VirtualFileSystem()
  }
};

// Seed Local & Node Filesystems
networkNodes["127.0.0.1"].vfs.createFile('/home/user/bounces.txt', 'Available Open Proxies:\n - 10.0.8.2\n - 10.0.8.9');

// Bank Gateway Files
networkNodes["192.168.1.104"].vfs.createFile('/sys/accounts.db', 'PAYLOAD_DATA::HASH_BANK_ACC_00192');
networkNodes["192.168.1.104"].vfs.createFile('/sys/passwords.enc', 'ENC::MILITARY_GATEWAY_IP=10.0.99.1', true);

// Military Node Files
networkNodes["10.0.99.1"].vfs.createFile('/classified/missile_schematics.enc', 'ENC::TOP_SECRET_CORE_DIAGRAM_V4', true);
networkNodes["10.0.99.1"].vfs.createFile('/var/logs/access.log', '127.0.0.1 INTRUSION DETECTED');

// --- 4. Dynamic Trace Engine ---
class TraceEngine {
  constructor(hudNodeEl, traceFillEl, traceValEl, onTraceBurn) {
    this.hudNodeEl = hudNodeEl;
    this.traceFillEl = traceFillEl;
    this.traceValEl = traceValEl;
    this.onTraceBurn = onTraceBurn;

    this.currentIp = "127.0.0.1";
    this.tracePercent = 0;
    this.timer = null;
    this.currentEffectiveRate = 0;
  }

  connect(ip) {
    if (!networkNodes[ip]) return false;

    this.currentIp = ip;
    const node = networkNodes[ip];
    this.hudNodeEl.textContent = `${node.hostname} (${ip})`;

    if (this.timer) clearInterval(this.timer);

    if (node.baseTraceRate > 0) {
      // Trace reduction formula: BaseRate / (1 + 0.5 * hops)
      const proxyHops = bounceChain.length;
      this.currentEffectiveRate = node.baseTraceRate / (1 + 0.5 * proxyHops);

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
    this.currentIp = "127.0.0.1";
    this.hudNodeEl.textContent = "LOCALHOST (127.0.0.1)";
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

// --- 5. Terminal Controller ---
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

  printReplace(text) {
    if (this.outputEl.lastElementChild) {
      this.outputEl.lastElementChild.textContent = text;
    } else {
      this.print(text);
    }
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
  ui.print("[SYSTEM LOCKDOWN] CONNECTION TERMINATED BY NETWORK SECURITY.", "alert");
  inputEl.disabled = true;
});

// Command Handlers
const commands = {
  help: async () => {
    ui.print("AVAILABLE SYSTEM COMMANDS:");
    ui.print("  ls [path]         - List directory contents");
    ui.print("  cd <path>         - Change directory");
    ui.print("  cat <file>        - Read file contents");
    ui.print("  rm <file>         - Delete file");
    ui.print("  probe <ip>        - Scan target host open ports");
    ui.print("  crack <file>      - Run brute-force module on encrypted file");
    ui.print("  download <file>   - Transfer file to localhost storage");
    ui.print("  bounce <ip>       - Add open proxy node to active route chain");
    ui.print("  connect <ip>      - Connect to host via proxy route");
    ui.print("  disconnect        - Terminate remote session and clear route");
    ui.print("  objectives        - Display contract objectives status");
    ui.print("  clear             - Clear output log");
  },

  objectives: async () => {
    ui.print("ACTIVE CONTRACT OBJECTIVES:");
    missions.objectives.forEach(obj => {
      const status = obj.completed ? "[COMPLETE]" : "[PENDING]";
      ui.print(`  ${status} ${obj.description}`);
    });
  },

  probe: async (args) => {
    const targetIp = args[0] || traceEngine.currentIp;
    if (!networkNodes[targetIp]) return ui.print(`Host ${targetIp} not found.`, "warn");

    ui.print(`Initiating port probe on target [${targetIp}]...`);
    for (let i = 1; i <= 5; i++) {
      await delay(120);
      const percent = i * 20;
      const filled = "=".repeat(i * 4);
      const empty = " ".repeat(20 - i * 4);
      ui.printReplace(`PROBE: [${filled}${empty}] ${percent}%`);
    }

    const node = networkNodes[targetIp];
    ui.print(`\nPROBE COMPLETE FOR ${node.hostname} (${targetIp}):`);
    node.ports.forEach(port => {
      ui.print(`  PORT ${port}: OPEN`);
    });

    // Mission check for probing
    if (targetIp === "192.168.1.104" && missions.completeObjective('probe_bank')) {
      ui.print(`\n[OBJECTIVE UPDATED] Probed Bank Central Gateway!`, "warn");
      checkWinState();
    } else if (targetIp === "10.0.99.1" && missions.completeObjective('probe_military')) {
      ui.print(`\n[OBJECTIVE UPDATED] Probed Defense Grid Node!`, "warn");
      checkWinState();
    }
  },

  crack: async (args) => {
    if (!args[0]) return ui.print("Usage: crack <filename>");
    const vfs = traceEngine.getActiveVFS();
    const curr = vfs.getNode();

    if (!curr || curr.type !== 'dir' || !curr.children.has(args[0])) {
      return ui.print(`Target file '${args[0]}' not found.`);
    }

    const file = curr.children.get(args[0]);
    if (!file.isEncrypted) {
      return ui.print(`File '${args[0]}' is already decrypted.`);
    }

    ui.print(`Bruteforcing encryption keys for '${args[0]}'...`);
    const hex = "0123456789ABCDEF";
    for (let i = 0; i < 10; i++) {
      await delay(150);
      let key = Array.from({ length: 8 }, () => hex[Math.floor(Math.random() * 16)]).join('');
      ui.printReplace(`KEYSPACE SEARCH: 0x${key}`);
    }

    file.isEncrypted = false;
    
    // Unmask contents
    if (traceEngine.currentIp === "192.168.1.104" && args[0] === "passwords.enc") {
      file.content = "MILITARY_GRID_GATEWAY_IP=10.0.99.1";
      ui.print(`\n[DECRYPT SUCCESS] Content unlocked: ${file.content}`);
      if (missions.completeObjective('crack_pass')) {
        ui.print(`[OBJECTIVE UPDATED] Cracked Bank Central passwords file!`, "warn");
        checkWinState();
      }
    } else if (traceEngine.currentIp === "10.0.99.1" && args[0] === "missile_schematics.enc") {
      file.content = "SCHEMATICS_CORE_PAYLOAD_VALIDATED";
      ui.print(`\n[DECRYPT SUCCESS] Classified schematics unlocked.`);
      if (missions.completeObjective('crack_payload')) {
        ui.print(`[OBJECTIVE UPDATED] Cracked Military Missile Schematics!`, "warn");
        checkWinState();
      }
    } else {
      ui.print(`\n[DECRYPT SUCCESS] Decrypted contents of '${args[0]}'.`);
    }
  },

  bounce: async (args) => {
    if (!args[0]) return ui.print("Usage: bounce <IP>");
    const ip = args[0];

    if (!networkNodes[ip] || !networkNodes[ip].isProxyable) {
      return ui.print(`[ERROR] IP '${ip}' is not an open proxy node.`, "warn");
    }

    if (bounceChain.includes(ip)) {
      return ui.print(`Proxy ${ip} already present in route.`);
    }

    bounceChain.push(ip);
    ui.print(`[PROXY ADDED] Active Chain: Localhost -> ${bounceChain.join(' -> ')}`);
  },

  connect: async (args) => {
    if (!args[0]) return ui.print("Usage: connect <IP>");
    const targetIp = args[0];

    if (!networkNodes[targetIp]) {
      return ui.print(`[ERROR] Connection failed: Target IP ${targetIp} unreachable.`, "alert");
    }

    const routeStr = bounceChain.length > 0 ? `${bounceChain.join(' -> ')} -> ${targetIp}` : targetIp;
    ui.print(`Establishing route via: Localhost -> ${routeStr}...`);
    await delay(500);

    const success = traceEngine.connect(targetIp);
    if (success) {
      ui.print(`[CONNECTED] Session active on ${networkNodes[targetIp].hostname}.`, "warn");
      
      const base = networkNodes[targetIp].baseTraceRate;
      if (base > 0) {
        const eff = traceEngine.currentEffectiveRate.toFixed(1);
        ui.print(`WARNING: Security active! Base Trace: ${base}%/s | Effective Trace: ${eff}%/s (${bounceChain.length} Proxies)`);
      } else {
        ui.print("Secure Proxy Node. Trace inactive.");
      }
      ui.setPrompt(traceEngine.currentIp, traceEngine.getActiveVFS().getAbsolutePath());
    }
  },

  disconnect: async () => {
    if (traceEngine.currentIp === "127.0.0.1") return ui.print("Already connected to localhost.");
    
    traceEngine.disconnect();
    bounceChain.length = 0;
    ui.print("[DISCONNECTED] Session terminated. Route chain reset.");
    ui.setPrompt(traceEngine.currentIp, traceEngine.getActiveVFS().getAbsolutePath());
  },

  download: async (args) => {
    if (!args[0]) return ui.print("Usage: download <filename>");
    const vfs = traceEngine.getActiveVFS();
    const curr = vfs.getNode();

    if (curr && curr.type === 'dir' && curr.children.has(args[0])) {
      const file = curr.children.get(args[0]);
      if (file.type === 'file') {
        if (file.isEncrypted) {
          return ui.print(`Cannot download encrypted payload. Run 'crack ${args[0]}' first.`, "warn");
        }
        ui.print(`Downloading '${args[0]}'...`);
        await delay(800);
        
        networkNodes["127.0.0.1"].vfs.createFile(`/home/user/${args[0]}`, file.content);
        ui.print(`[SUCCESS] '${args[0]}' saved to localhost.`);

        if (traceEngine.currentIp === "192.168.1.104" && args[0] === "accounts.db") {
          if (missions.completeObjective('download_db')) {
            ui.print(`\n[OBJECTIVE UPDATED] Downloaded Bank accounts database!`, "warn");
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
    
    const isMilitaryLog = traceEngine.currentIp === "10.0.99.1" && args[0] === "access.log" && vfs.getAbsolutePath() === "/var/logs";
    
    const removed = vfs.removeNode(args[0]);
    if (removed) {
      ui.print(`Deleted '${args[0]}'.`);
      if (isMilitaryLog) {
        if (missions.completeObjective('clear_logs')) {
          ui.print(`\n[OBJECTIVE UPDATED] Cleared intrusion logs on Defense Grid Node!`, "warn");
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
      const enc = child.isEncrypted ? ' (ENCRYPTED)' : '';
      ui.print(`${type} ${child.name}${enc}`);
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
      const file = curr.children.get(args[0]);
      if (file.isEncrypted) {
        ui.print(`[ERROR] File encrypted. Run 'crack ${args[0]}' to execute key recovery.`, "warn");
      } else {
        ui.print(file.content);
      }
    } else {
      ui.print(`cat: ${args[0]}: No such file`);
    }
  },

  clear: async () => ui.clear()
};

function checkWinState() {
  if (missions.checkMissionComplete()) {
    ui.print("\n==================================================", "warn");
    ui.print("  ALL SYSTEM OBJECTIVES COMPLETED. CONTRACT WON!", "warn");
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
ui.print("Type 'objectives' to list contract targets.");
ui.print("Type 'cat home/user/bounces.txt' to discover proxy IPs.\n");
ui.setPrompt(traceEngine.currentIp, traceEngine.getActiveVFS().getAbsolutePath());