import { NetworkManager } from './systems/NetworkManager.js';
import { MissionManager } from './systems/MissionManager.js';
import { TraceEngine } from './systems/TraceEngine.js';
import { SaveManager } from './systems/SaveManager.js';
import { LevelManager } from './systems/LevelManager.js';
import { TerminalUI } from './ui/TerminalUI.js';
import { InputController } from './ui/InputController.js';
import { createFilesystemCommands } from './commands/filesystemCommands.js';
import { createNetworkCommands } from './commands/networkCommands.js';
import { createMissionCommands } from './commands/missionCommands.js';
import { createSystemCommands } from './commands/systemCommands.js';

const outputEl = document.getElementById('output-log');
const promptEl = document.getElementById('prompt-label');
const inputEl = document.getElementById('cmd-input');
const hudNodeEl = document.getElementById('hud-node');
const traceFillEl = document.getElementById('trace-fill');
const traceValEl = document.getElementById('trace-val');
const recoveryControlsEl = document.getElementById('recovery-controls');
const loadGameButtonEl = document.getElementById('load-game-button');
const resetGameButtonEl = document.getElementById('reset-game-button');

const ui = new TerminalUI(outputEl, promptEl, inputEl);
const network = new NetworkManager();
let saveManager;
const levelManager = new LevelManager(({ levelWon, campaignWon }) => {
  if (levelWon) {
    ui.print(`\n[LEVEL ${levelManager.currentLevel - (campaignWon ? 0 : 1)} COMPLETE] Contract won.`, 'warn');
  }
  if (campaignWon) {
    ui.print('[CAMPAIGN COMPLETE] You won all 10 levels.', 'warn');
  } else {
    ui.print(`\n${levelManager.getIntro()}`, 'warn');
  }
});
const missions = new MissionManager(() => saveManager?.save(true), levelManager);

const setRecoveryControlsVisible = isVisible => {
  recoveryControlsEl.classList.toggle('visible', isVisible);
};

const trace = new TraceEngine(network, levelManager, hudNodeEl, traceFillEl, traceValEl, () => {
  ui.print('\n[ALERT] TRACE 100% COMPLETE. PHYSICAL LOCATION IDENTIFIED.', 'alert');
  ui.print('[SYSTEM LOCKDOWN] CONNECTION TERMINATED BY NETWORK SECURITY.', 'alert');
  inputEl.disabled = true;
  setRecoveryControlsVisible(true);
});

const updatePrompt = () => ui.setPrompt(trace.currentIp, trace.getActiveVFS().getAbsolutePath(), network);

saveManager = new SaveManager(network, missions, levelManager, trace, ui);

const context = {
  ui,
  network,
  trace,
  missions,
  levelManager,
  saveManager,
  showStageIntro: () => ui.print(`\n${levelManager.getIntro()}`, 'warn'),
  checkWinState: () => {
    if (missions.checkMissionComplete()) {
      ui.print('\n==================================================', 'warn');
      ui.print('  ALL SYSTEM OBJECTIVES COMPLETED. CONTRACT WON!', 'warn');
      ui.print('==================================================\n', 'warn');
      setRecoveryControlsVisible(true);
    }
  },
  resetGame: () => {
    saveManager.reset();
    inputEl.disabled = false;
    setRecoveryControlsVisible(false);
    ui.clear();
    ui.print('NODE-OS Terminal System v1.09');
    ui.print('[SYSTEM RESET] Environment restored to default parameters.');
    ui.print("Type 'tutorial' for startup guidance.");
    ui.print("Type 'objectives' to list contract targets.");
    ui.print("Type 'cat home/user/bounces.txt' to discover proxy IPs.\n");
    ui.print(`\n${levelManager.getIntro()}`, 'warn');
    updatePrompt();
  },
  onRecoveryVisibilityChange: setRecoveryControlsVisible
};

const commands = {
  ...createSystemCommands(context),
  ...createFilesystemCommands(context),
  ...createNetworkCommands(context),
  ...createMissionCommands(context)
};

new InputController(inputEl, ui, commands);

loadGameButtonEl.addEventListener('click', () => {
  if (saveManager.load()) {
    inputEl.disabled = false;
    setRecoveryControlsVisible(false);
    ui.print('[SYSTEM] State reloaded from browser local storage.', 'warn');
    inputEl.focus();
  } else {
    ui.print('[SYSTEM] No valid save file found in storage.', 'alert');
  }
});

resetGameButtonEl.addEventListener('click', () => {
  context.resetGame();
  inputEl.focus();
});

const loaded = saveManager.load();
ui.print('NODE-OS Terminal System v1.09');
if (loaded) ui.print('[RESTORED] Loaded active state from local storage.');
ui.print("Type 'tutorial' for startup guidance.");
ui.print("Type 'objectives' to list contract targets.");
ui.print("Type 'cat home/user/bounces.txt' to discover proxy IPs.\n");
ui.print(`\n${levelManager.getIntro()}`, 'warn');
updatePrompt();
