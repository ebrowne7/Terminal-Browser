export function createMissionCommands(context) {
  const { ui, missions, levelManager } = context;

  return {
    objectives: async () => {
      const level = levelManager.level;
      const stage = levelManager.stage;
      const objectives = missions.getObjectivesForStage();
      ui.print(`LEVEL ${String(levelManager.currentLevel).padStart(2, '0')}/10: ${level.title}`);
      ui.print(`STAGE ${String(levelManager.currentStage).padStart(2, '0')}/10: ${stage.title}`);
      ui.print('OBJECTIVES:');
      objectives.forEach((objective, index) => {
        const status = objective.completed ? '[COMPLETE]' : '[PENDING]';
        ui.print(`  ${index + 1}. ${status} ${objective.description}`);
      });
    },

    level: async () => {
      const state = levelManager.getLevelState(levelManager.currentLevel, missions.objectives);
      ui.print(`LEVEL ${String(levelManager.currentLevel).padStart(2, '0')}/10: ${levelManager.level.title} [${state.state}]`);
      ui.print(`STAGE ${String(levelManager.currentStage).padStart(2, '0')}/10: ${levelManager.stage.title}`);
      ui.print(levelManager.stage.intro);
    },

    levels: async () => {
      ui.print('CAMPAIGN LEVELS:');
      levelManager.getLevelStates(missions.objectives).forEach(state => {
        ui.print(`  [${state.state}] LEVEL ${state.level}/10: ${state.title} (${state.completedObjectives}/${state.totalObjectives} objectives)`);
      });
    }
  };
}
