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
const missionStateEl = document.getElementById('mission-state');
const missionLevelEl = document.getElementById('mission-level');
const missionLevelTitleEl = document.getElementById('mission-level-title');
const missionStageEl = document.getElementById('mission-stage');
const missionTargetEl = document.getElementById('mission-target');
const missionObjectivesEl = document.getElementById('mission-objectives');

let updateMissionPanel = () => {};

const ui = new TerminalUI(outputEl, promptEl, inputEl);
const network = new NetworkManager();
let saveManager;
const levelManager = new LevelManager(({ levelWon, campaignWon }) => {
  updateMissionPanel();
  if (levelWon) {
    ui.print(`\n[LEVEL ${levelManager.currentLevel - (campaignWon ? 0 : 1)} COMPLETE] Contract won.`, 'warn');
  }
  if (campaignWon) {
    ui.print('[CAMPAIGN COMPLETE] You won all 10 levels.', 'warn');
  } else {
    ui.print(`\n${levelManager.getIntro()}`, 'warn');
  }
});
const missions = new MissionManager(() => {
  saveManager?.save(true);
  updateMissionPanel();
}, levelManager);

updateMissionPanel = () => {
  const level = levelManager.level;
  const stage = levelManager.stage;
  const objectives = missions.getObjectivesForStage();
  const state = levelManager.getLevelState(levelManager.currentLevel, missions.objectives);

  missionStateEl.textContent = state.state;
  missionLevelEl.textContent = `LEVEL ${String(levelManager.currentLevel).padStart(2, '0')}/10`;
  missionLevelTitleEl.textContent = level.title;
  missionStageEl.textContent = `STAGE ${String(levelManager.currentStage).padStart(2, '0')}/10: ${stage.title}`;
  missionTargetEl.replaceChildren(...getStageTargets(stage).map(target => {
    const item = document.createElement('div');
    item.className = 'mission-target-line';
    item.textContent = target;
    return item;
  }));
  missionObjectivesEl.replaceChildren(...objectives.map(objective => {
    const item = document.createElement('div');
    item.className = `mission-objective${objective.completed ? ' complete' : ''}`;
    item.textContent = objective.description;
    return item;
  }));
};

const getStageTargets = stage => {
  const targets = {
    tutorial_complete: '127.0.0.1 | START: tutorial',
    inspect_home: '127.0.0.1 | USE: ls /home/user',
    add_proxy_us: '10.0.8.2 | USE: bounce 10.0.8.2',
    connect_proxy_us: '10.0.8.2 | USE: connect 10.0.8.2',
    probe_bank: '192.168.1.104 | USE: probe 192.168.1.104',
    inspect_bank_files: '192.168.1.104 | USE: ls /sys',
    crack_pass: '192.168.1.104 | USE: crack /sys/passwords.enc',
    read_pass: '192.168.1.104 | USE: cat /sys/passwords.enc',
    download_db: '192.168.1.104 | USE: download /sys/accounts.db',
    disconnect_bank: '192.168.1.104 | USE: disconnect',
    add_proxy_eu: '10.0.8.9 | USE: bounce 10.0.8.9',
    connect_proxy_eu: '10.0.8.9 | USE: connect 10.0.8.9',
    probe_military: '10.0.99.1 | USE: probe 10.0.99.1',
    inspect_military_files: '10.0.99.1 | USE: ls /classified',
    crack_payload: '10.0.99.1 | USE: crack /classified/missile_schematics.enc',
    read_payload: '10.0.99.1 | USE: cat /classified/missile_schematics.enc',
    clear_logs: '10.0.99.1 | USE: rm /var/logs/access.log',
    disconnect_defense: '10.0.99.1 | USE: disconnect',
    download_payload: '10.0.99.1 | USE: download /classified/missile_schematics.enc',
    return_home: '127.0.0.1 | USE: disconnect'
  };
  const stageTargets = (stage.objectiveIds || [])
    .map(objectiveId => targets[objectiveId])
    .filter((target, index, allTargets) => target && allTargets.indexOf(target) === index);
  return stageTargets.length ? stageTargets : ['CURRENT TARGET: follow the objective checklist'];
};

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
    updateMissionPanel();
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
updateMissionPanel();
ui.print('NODE-OS Terminal System v1.09');
if (loaded) ui.print('[RESTORED] Loaded active state from local storage.');
ui.print("Type 'tutorial' for startup guidance.");
ui.print("Type 'objectives' to list contract targets.");
ui.print("Type 'cat home/user/bounces.txt' to discover proxy IPs.\n");
ui.print(`\n${levelManager.getIntro()}`, 'warn');
updatePrompt();
