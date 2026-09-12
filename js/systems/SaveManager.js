import { GameState } from '../core/GameState.js';

export class SaveManager {
  constructor(network, missions, levelManager, traceEngine, ui, storage = window.localStorage) {
    this.network = network;
    this.missions = missions;
    this.levelManager = levelManager;
    this.traceEngine = traceEngine;
    this.ui = ui;
    this.storage = storage;
    this.storageKey = 'terminal_game_save';
  }

  save(silent = false) {
    try {
      const filesystems = {};
      const workingDirectories = {};
      for (const [ip, node] of Object.entries(this.network.nodes)) {
        filesystems[ip] = node.vfs.toJSON();
        workingDirectories[ip] = node.vfs.getAbsolutePath();
      }

      const state = new GameState({
        objectives: this.missions.objectives,
        filesystems,
        bounceChain: this.network.bounceChain,
        currentIp: this.traceEngine.currentIp,
        workingDirectories,
        currentLevel: this.levelManager.currentLevel,
        currentStage: this.levelManager.currentStage
      });
      this.storage.setItem(this.storageKey, JSON.stringify(state));
      if (!silent) this.ui.print('[SYSTEM] Progress saved successfully to local storage.', 'warn');
      return true;
    } catch (error) {
      this.ui.print(`[ERROR] Failed to save state: ${error.message}`, 'alert');
      return false;
    }
  }

  load() {
    const saved = this.storage.getItem(this.storageKey);
    if (!saved) return false;

    try {
      const state = JSON.parse(saved);
      if (!GameState.isValid(state)) return false;

      if (state.version === GameState.version) {
        this.missions.objectives = state.objectives;
      } else {
        const savedObjectives = new Map(state.objectives.map(objective => [objective.id, objective]));
        this.missions.objectives = this.missions.objectives.map(objective => ({
          ...objective,
          completed: savedObjectives.get(objective.id)?.completed || false
        }));
      }
      this.levelManager.load(state.currentLevel || 1, state.currentStage);
      for (const [ip, filesystem] of Object.entries(state.filesystems)) {
        if (this.network.has(ip)) this.network.getActiveVFS(ip).fromJSON(filesystem);
      }

      this.network.setBounceChain(state.bounceChain);
      for (const [ip, path] of Object.entries(state.workingDirectories || {})) {
        if (this.network.has(ip)) this.network.getActiveVFS(ip).cd(path);
      }

      this.traceEngine.disconnect();
      if (state.currentIp && state.currentIp !== '127.0.0.1') {
        this.traceEngine.connect(state.currentIp);
      }
      this.ui.setPrompt(this.traceEngine.currentIp, this.traceEngine.getActiveVFS().getAbsolutePath(), this.network);
      if (state.version !== GameState.version) this.save(true);
      return true;
    } catch {
      return false;
    }
  }

  reset() {
    this.storage.removeItem(this.storageKey);
    this.traceEngine.disconnect();
    this.network.reset();
    this.missions.initObjectives();
    this.levelManager.reset();
  }
}
