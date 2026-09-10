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
}

// --- 2. Terminal UI Controller ---
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

  // Update line in place for real-time progress bars
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

  setPrompt(path) {
    this.promptEl.textContent = `guest@nodes-net:${path}$`;
  }

  scrollToBottom() {
    this.outputEl.scrollTop = this.outputEl.scrollHeight;
  }
}

// --- 3. Async Helper utilities ---
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// --- 4. Main Application Initialization ---
const vfs = new VirtualFileSystem();
const outputEl = document.getElementById('output-log');
const promptEl = document.getElementById('prompt-label');
const inputEl = document.getElementById('cmd-input');

const ui = new TerminalUI(outputEl, promptEl, inputEl);

// Seed initial system files
vfs.createFile('/sys/nodes.config', '192.168.1.104 - SEC_LEVEL_1\n10.0.42.1 - SEC_LEVEL_3');
vfs.createFile('/home/user/logs.txt', 'PORT 22: OPEN\nPORT 80: OPEN\nPORT 443: CLOSED');
vfs.createFile('/home/user/shadow.enc', 'ENC::77a9ff012a', true);

// Registered Commands Engine
const commands = {
  help: async (args) => {
    ui.print("AVAILABLE SYSTEM COMMANDS:");
    ui.print("  ls [path]       - List directory contents");
    ui.print("  cd <path>       - Change directory");
    ui.print("  cat <file>      - Read file contents");
    ui.print("  pwd             - Print current working directory");
    ui.print("  crack <file>    - Decrypt target system file (Async Process)");
    ui.print("  scan <ip>       - Probe remote server open ports (Async Process)");
    ui.print("  clear           - Clear screen");
  },

  pwd: async () => {
    ui.print(vfs.getAbsolutePath());
  },

  clear: async () => {
    ui.clear();
  },

  ls: async () => {
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
    const target = args[0] || '/';
    const res = vfs.cd(target);
    if (!res.success) {
      ui.print(res.message, "warn");
    } else {
      ui.setPrompt(vfs.getAbsolutePath());
    }
  },

  cat: async (args) => {
    if (!args[0]) return ui.print("Usage: cat <filename>");
    const curr = vfs.getNode();
    if (curr && curr.type === 'dir' && curr.children.has(args[0])) {
      const file = curr.children.get(args[0]);
      if (file.type === 'dir') {
        ui.print(`cat: ${args[0]}: Is a directory`, "warn");
      } else if (file.isEncrypted) {
        ui.print(`[ERROR] File encrypted. Run 'crack ${args[0]}' to execute key recovery.`, "warn");
      } else {
        ui.print(file.content);
      }
    } else {
      ui.print(`cat: ${args[0]}: No such file`);
    }
  },

  // Async Command Example 1: Port Scanner with Progress
  scan: async (args) => {
    const ip = args[0] || "127.0.0.1";
    ui.print(`Initiating port probe on target [${ip}]...`);
    ui.print("[                    ] 0%");

    for (let i = 1; i <= 10; i++) {
      await delay(150);
      const percent = i * 10;
      const filled = "=".repeat(i * 2);
      const empty = " ".repeat(20 - i * 2);
      ui.printReplace(`[${filled}${empty}] ${percent}%`);
    }

    ui.print("\nPROBE COMPLETE. TARGET RESULTS:");
    ui.print(`  192.168.1.1:21   [FTP]    - OPEN`);
    ui.print(`  192.168.1.1:22   [SSH]    - LOCKED`);
    ui.print(`  192.168.1.1:80   [HTTP]   - OPEN`);
  },

  // Async Command Example 2: Decrypting Encrypted Files
  crack: async (args) => {
    if (!args[0]) return ui.print("Usage: crack <filename>");
    const curr = vfs.getNode();

    if (!curr || !curr.children.has(args[0])) {
      return ui.print(`Target '${args[0]}' not found.`);
    }

    const file = curr.children.get(args[0]);
    if (!file.isEncrypted) {
      return ui.print(`File '${args[0]}' is already decrypted.`);
    }

    ui.print(`Initializing key-bruteforce module on '${args[0]}'...`);
    const hexChars = "0123456789ABCDEF";

    // Simulate cracking iterations
    ui.print("SEARCHING KEYSPACE: 0x0000");
    for (let i = 0; i < 15; i++) {
      await delay(120);
      let randomHex = Array.from({ length: 4 }, () => hexChars[Math.floor(Math.random() * 16)]).join('');
      ui.printReplace(`SEARCHING KEYSPACE: 0x${randomHex}`);
    }

    file.isEncrypted = false;
    file.content = "DECRYPTED_PAYLOAD: root_pass='admin_matrix_1999'";
    ui.print(`\n[SUCCESS] Key match found! Decrypted content written to '${args[0]}'.`);
  }
};

// --- 5. Input Key Event Handling ---
inputEl.addEventListener('keydown', async (e) => {
  if (ui.isProcessing) return;

  if (e.key === 'Enter') {
    const rawInput = inputEl.value;
    inputEl.value = '';

    if (!rawInput.trim()) return;

    // Output executed command line to log
    ui.print(`${promptEl.textContent} ${rawInput}`);

    // Track command history
    ui.history.push(rawInput);
    ui.historyIdx = ui.history.length;

    // Parse command
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
      ui.print(`Command not recognized: '${cmd}'. Type 'help' for options.`, "warn");
    }
  } 
  // History UP Arrow
  else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (ui.historyIdx > 0) {
      ui.historyIdx--;
      inputEl.value = ui.history[ui.historyIdx];
    }
  } 
  // History DOWN Arrow
  else if (e.key === 'ArrowDown') {
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
ui.print("Type 'help' to see available system commands.\n");
ui.setPrompt(vfs.getAbsolutePath());