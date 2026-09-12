export function createSystemCommands(context) {
  const { ui, missions, saveManager, resetGame, onRecoveryVisibilityChange, showStageIntro, checkWinState } = context;

  return {
    help: async () => {
      ui.print('AVAILABLE SYSTEM COMMANDS:');
      ui.print('  ls [path]         - List directory contents');
      ui.print('  cd <path>         - Change directory');
      ui.print('  cat <file>        - Read file contents');
      ui.print('  rm <file>         - Delete file');
      ui.print('  probe <ip>        - Scan target host open ports');
      ui.print('  crack <file>      - Run brute-force module on encrypted file');
      ui.print('  download <file>   - Transfer file to localhost storage');
      ui.print('  bounce <ip>       - Add open proxy node to active route chain');
      ui.print('  connect <ip>      - Connect to host via proxy route');
      ui.print('  disconnect        - Terminate remote session and clear route');
      ui.print('  objectives [level] - Display objectives for a level');
      ui.print('  level             - Display the current level briefing');
      ui.print('  levels            - Display all level states');
      ui.print('  stage             - Display the current stage briefing');
      ui.print('  tutorial          - Show the terminal tutorial');
      ui.print('  save              - Manually save current state to browser storage');
      ui.print('  load              - Reload saved game state');
      ui.print('  reset             - Wipe local state and start fresh');
      ui.print('  clear             - Clear output log');
    },

    save: async () => saveManager.save(false),

    load: async () => {
      if (saveManager.load()) {
        onRecoveryVisibilityChange(false);
        ui.print('[SYSTEM] State reloaded from browser local storage.', 'warn');
      } else {
        ui.print('[SYSTEM] No valid save file found in storage.', 'alert');
      }
    },

    reset: async () => resetGame(),
    stage: async () => showStageIntro(),
    tutorial: async () => {
      ui.print('TERMINAL TUTORIAL:');
      ui.print('  1. Use ls and cd to inspect the virtual filesystem.');
      ui.print('  2. Use cat home/user/bounces.txt to discover relay nodes.');
      ui.print('  3. Use bounce <IP> to add a relay before connecting.');
      ui.print('  4. Use connect <IP>, then probe, crack, download, or rm.');
      ui.print('  5. Disconnect when finished. More relays reduce trace speed.');
      if (missions.completeObjective('tutorial_complete')) {
        ui.print('[OBJECTIVE UPDATED] Terminal tutorial complete.', 'warn');
        checkWinState();
      }
    },
    clear: async () => ui.clear()
  };
}
