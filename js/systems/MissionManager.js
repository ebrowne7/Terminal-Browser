import { MISSION_OBJECTIVES } from '../config/missionData.js';

export class MissionManager {
  constructor(onChange = () => {}, levelManager = null) {
    this.onChange = onChange;
    this.levelManager = levelManager;
    this.initObjectives();
  }

  initObjectives() {
    this.objectives = MISSION_OBJECTIVES.map(objective => ({ ...objective, completed: false }));
  }

  completeObjective(id) {
    const objective = this.objectives.find(item => item.id === id);
    if (!objective || objective.completed) return false;

    objective.completed = true;
    this.levelManager?.completeObjective(id, this.objectives);
    this.onChange();
    return true;
  }

  completeAction(action) {
    const levelObjectiveIds = this.levelManager?.getLevelObjectiveIds(this.levelManager.currentLevel) || [];
    const objective = this.objectives.find(item => (
      item.action === action && levelObjectiveIds.includes(item.id) && !item.completed
    ));
    if (!objective) return false;

    objective.completed = true;
    this.levelManager.advanceProgress(this.objectives);
    this.onChange();
    return true;
  }

  getObjectivesForLevel(levelNumber = this.levelManager.currentLevel) {
    const level = this.levelManager.levels[levelNumber - 1];
    if (!level) return [];

    const objectiveIds = level.stages.flatMap(stage => (
      stage.objectiveIds || [stage.objectiveId]
    ));
    return this.objectives.filter(objective => objectiveIds.includes(objective.id));
  }

  checkMissionComplete() {
    return this.levelManager?.isCampaignComplete(this.objectives) || false;
  }
}
