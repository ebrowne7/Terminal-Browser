import { STAGES } from '../config/stageData.js';
import { ADDITIONAL_LEVELS } from '../config/levelData.js';

export class LevelManager {
  constructor(onChange = () => {}) {
    this.onChange = onChange;
    this.levels = [
      {
        number: 1,
        title: 'FIRST CONTRACT',
        intro: 'Your first contract teaches you the fundamentals and establishes your reputation.',
        stages: STAGES
      },
      ...ADDITIONAL_LEVELS
    ];
    this.reset();
  }

  reset() {
    this.currentLevel = 1;
    this.currentStage = 1;
    this.levelWon = false;
    this.campaignWon = false;
  }

  get level() {
    return this.levels[this.currentLevel - 1];
  }

  get stage() {
    return this.level?.stages[this.currentStage - 1];
  }

  get traceBonus() {
    return this.stage?.traceBonus || 0;
  }

  getIntro() {
    return `[LEVEL ${this.currentLevel}/10: ${this.level.title}]\n[STAGE ${this.currentStage}/10: ${this.stage.title}]\n${this.stage.intro}`;
  }

  getProgress() {
    return {
      level: this.currentLevel,
      stage: this.currentStage,
      levelTitle: this.level.title,
      stageTitle: this.stage.title
    };
  }

  getLevelObjectiveIds(levelNumber) {
    const level = this.levels[levelNumber - 1];
    return level?.stages.flatMap(stage => stage.objectiveIds || [stage.objectiveId]) || [];
  }

  getLevelState(levelNumber, objectives = []) {
    const level = this.levels[levelNumber - 1];
    if (!level) return null;

    const levelObjectiveIds = this.getLevelObjectiveIds(levelNumber);
    const completed = levelObjectiveIds.every(id => objectives.find(item => item.id === id)?.completed);
    const previousLevelComplete = levelNumber === 1 || this.getLevelState(levelNumber - 1, objectives)?.state === 'COMPLETED';

    return {
      level: levelNumber,
      title: level.title,
      state: completed ? 'COMPLETED' : previousLevelComplete ? 'ACTIVE' : 'LOCKED',
      completedObjectives: levelObjectiveIds.filter(id => objectives.find(item => item.id === id)?.completed).length,
      totalObjectives: levelObjectiveIds.length
    };
  }

  getLevelStates(objectives = []) {
    return this.levels.map((_, index) => this.getLevelState(index + 1, objectives));
  }

  completeObjective(objectiveId, objectives = []) {
    if (!this.stage?.objectiveIds?.includes(objectiveId) && this.stage?.objectiveId !== objectiveId) return false;
    return this.advanceIfStageComplete(objectives);
  }

  completeAction(action, objectives = []) {
    const currentObjective = objectives.find(item => (
      item.id === this.stage?.objectiveId && item.action === action
    ));
    if (!currentObjective) return false;
    return this.advanceIfStageComplete(objectives);
  }

  advanceIfStageComplete(objectives) {
    const objectiveIds = this.stage.objectiveIds || [this.stage.objectiveId];
    const complete = objectiveIds.every(id => objectives.find(item => item.id === id)?.completed);
    if (!complete) return false;

    if (this.currentStage < this.level.stages.length) {
      this.currentStage += 1;
    } else if (this.currentLevel < this.levels.length) {
      this.levelWon = true;
      this.currentLevel += 1;
      this.currentStage = 1;
    } else {
      this.levelWon = true;
      this.campaignWon = true;
    }

    this.onChange({ levelWon: this.levelWon, campaignWon: this.campaignWon });
    this.levelWon = false;
    return true;
  }

  load(level, stage) {
    const parsedLevel = Number(level);
    const parsedStage = Number(stage);
    if (Number.isInteger(parsedLevel) && parsedLevel >= 1 && parsedLevel <= this.levels.length) {
      this.currentLevel = parsedLevel;
    }
    if (Number.isInteger(parsedStage) && parsedStage >= 1 && parsedStage <= this.level.stages.length) {
      this.currentStage = parsedStage;
    }
  }

  isCampaignComplete(missions) {
    return this.campaignWon || (
      this.currentLevel === this.levels.length
      && this.currentStage === this.level.stages.length
      && missions.every(objective => objective.completed)
    );
  }
}
