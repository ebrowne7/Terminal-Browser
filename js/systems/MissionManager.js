import { MISSION_OBJECTIVES } from '../config/missionData.js';

export class MissionManager {
  constructor(onChange = () => {}) {
    this.onChange = onChange;
    this.initObjectives();
  }

  initObjectives() {
    this.objectives = MISSION_OBJECTIVES.map(objective => ({ ...objective, completed: false }));
  }

  completeObjective(id) {
    const objective = this.objectives.find(item => item.id === id);
    if (!objective || objective.completed) return false;

    objective.completed = true;
    this.onChange();
    return true;
  }

  checkMissionComplete() {
    return this.objectives.every(objective => objective.completed);
  }
}
