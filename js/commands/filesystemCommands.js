const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export function createFilesystemCommands(context) {
  const { ui, network, trace, missions, checkWinState } = context;

  return {
    ls: async args => {
      const vfs = trace.getActiveVFS();
      const node = args[0] ? vfs.resolve(args[0]) : vfs.getNode();
      if (!node || node.type !== 'dir') return ui.print('Error reading directory.', 'warn');
      if (node.children.size === 0) return ui.print('(empty)', 'dim');

      node.children.forEach(child => {
        const type = child.type === 'dir' ? '[DIR] ' : '      ';
        const encrypted = child.isEncrypted ? ' (ENCRYPTED)' : '';
        ui.print(`${type} ${child.name}${encrypted}`);
      });
    },

    cd: async args => {
      const vfs = trace.getActiveVFS();
      const result = vfs.cd(args[0] || '/');
      if (!result.success) {
        ui.print(result.message, 'warn');
      } else {
        ui.setPrompt(trace.currentIp, vfs.getAbsolutePath(), network);
      }
    },

    cat: async args => {
      if (!args[0]) return ui.print('Usage: cat <filename>');
      const file = trace.getActiveVFS().resolve(args[0]);
      if (!file || file.type !== 'file') return ui.print(`cat: ${args[0]}: No such file`);
      if (file.isEncrypted) {
        return ui.print(`[ERROR] File encrypted. Run 'crack ${args[0]}' to execute key recovery.`, 'warn');
      }
      ui.print(file.content);
    },

    crack: async args => {
      if (!args[0]) return ui.print('Usage: crack <filename>');
      const file = trace.getActiveVFS().resolve(args[0]);
      if (!file || file.type !== 'file') return ui.print(`Target file '${args[0]}' not found.`);
      if (!file.isEncrypted) return ui.print(`File '${args[0]}' is already decrypted.`);

      ui.print(`Bruteforcing encryption keys for '${args[0]}'...`);
      const hex = '0123456789ABCDEF';
      for (let attempt = 0; attempt < 10; attempt += 1) {
        await delay(150);
        const key = Array.from({ length: 8 }, () => hex[Math.floor(Math.random() * 16)]).join('');
        ui.printReplace(`KEYSPACE SEARCH: 0x${key}`);
      }

      file.isEncrypted = false;
      const fileName = file.name;
      if (trace.currentIp === '192.168.1.104' && fileName === 'passwords.enc') {
        file.content = 'MILITARY_GRID_GATEWAY_IP=10.0.99.1';
        ui.print(`\n[DECRYPT SUCCESS] Content unlocked: ${file.content}`);
        if (missions.completeObjective('crack_pass')) {
          ui.print('[OBJECTIVE UPDATED] Cracked Bank Central passwords file!', 'warn');
          checkWinState();
        }
      } else if (trace.currentIp === '10.0.99.1' && fileName === 'missile_schematics.enc') {
        file.content = 'SCHEMATICS_CORE_PAYLOAD_VALIDATED';
        ui.print('\n[DECRYPT SUCCESS] Classified schematics unlocked.');
        if (missions.completeObjective('crack_payload')) {
          ui.print('[OBJECTIVE UPDATED] Cracked Military Missile Schematics!', 'warn');
          checkWinState();
        }
      } else {
        ui.print(`\n[DECRYPT SUCCESS] Decrypted contents of '${args[0]}'.`);
      }
    },

    download: async args => {
      if (!args[0]) return ui.print('Usage: download <filename>');
      const file = trace.getActiveVFS().resolve(args[0]);
      if (!file || file.type !== 'file') return ui.print(`File '${args[0]}' not found.`);
      if (file.isEncrypted) return ui.print(`Cannot download encrypted payload. Run 'crack ${args[0]}' first.`, 'warn');

      ui.print(`Downloading '${file.name}'...`);
      await delay(800);
      network.getActiveVFS('127.0.0.1').createFile(`/home/user/${file.name}`, file.content);
      ui.print(`[SUCCESS] '${file.name}' saved to localhost.`);

      if (trace.currentIp === '192.168.1.104' && file.name === 'accounts.db' && missions.completeObjective('download_db')) {
        ui.print('\n[OBJECTIVE UPDATED] Downloaded Bank accounts database!', 'warn');
        checkWinState();
      }
    },

    rm: async args => {
      if (!args[0]) return ui.print('Usage: rm <filename>');
      const vfs = trace.getActiveVFS();
      const file = vfs.resolve(args[0]);
      if (!file || file.type !== 'file') return ui.print(`rm: cannot remove '${args[0]}': No such file or directory`);

      const parentPath = '/' + vfs.getPathSegments(args[0]).slice(0, -1).join('/');
      const parent = vfs.getNode(parentPath);
      const removed = parent?.type === 'dir' && parent.children.delete(file.name);
      if (!removed) return ui.print(`rm: cannot remove '${args[0]}': No such file or directory`);

      ui.print(`Deleted '${file.name}'.`);
      if (trace.currentIp === '10.0.99.1' && file.name === 'access.log' && vfs.getPathSegments(args[0]).slice(0, -1).join('/') === 'var/logs' && missions.completeObjective('clear_logs')) {
        ui.print('\n[OBJECTIVE UPDATED] Cleared intrusion logs on Defense Grid Node!', 'warn');
        checkWinState();
      }
    }
  };
}
