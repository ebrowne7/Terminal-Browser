export class GameState {
  static version = 4;

  constructor({ objectives = [], filesystems = {}, bounceChain = [], currentIp = '127.0.0.1', workingDirectories = {}, currentLevel = 1, currentStage = 1 } = {}) {
    this.version = GameState.version;
    this.objectives = objectives;
    this.filesystems = filesystems;
    this.bounceChain = bounceChain;
    this.currentIp = currentIp;
    this.workingDirectories = workingDirectories;
    this.currentLevel = currentLevel;
    this.currentStage = currentStage;
  }

  static isValid(data) {
    return (data?.version === GameState.version || data?.version === 3)
      && Array.isArray(data.objectives)
      && data.filesystems && typeof data.filesystems === 'object';
  }
}
