export class GameState {
  static version = 1;

  constructor({ objectives = [], filesystems = {}, bounceChain = [], currentIp = '127.0.0.1', workingDirectories = {} } = {}) {
    this.version = GameState.version;
    this.objectives = objectives;
    this.filesystems = filesystems;
    this.bounceChain = bounceChain;
    this.currentIp = currentIp;
    this.workingDirectories = workingDirectories;
  }

  static isValid(data) {
    return data?.version === GameState.version
      && Array.isArray(data.objectives)
      && data.filesystems && typeof data.filesystems === 'object';
  }
}
