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
    const stage = this.levelManager?.stage;
    const stageObjectiveIds = stage?.objectiveIds || [stage?.objectiveId];
    const objective = this.objectives.find(item => (
      item.action === action && stageObjectiveIds.includes(item.id)
    ));
    return objective ? this.completeObjective(objective.id) : false;
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
