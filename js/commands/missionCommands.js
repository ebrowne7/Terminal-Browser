export function createMissionCommands(context) {
  const { ui, missions, levelManager } = context;

  return {
    objectives: async args => {
      const requestedLevel = args[0] ? Number(args[0]) : levelManager.currentLevel;
      const level = levelManager.levels[requestedLevel - 1];
      if (!level) return ui.print('Usage: objectives [level 1-10]', 'warn');

      const objectives = missions.getObjectivesForLevel(requestedLevel);
      const state = levelManager.getLevelState(requestedLevel, missions.objectives);
      ui.print(`CONTRACT OBJECTIVES [LEVEL ${requestedLevel}/10: ${level.title} | ${state.state}]`);
      objectives.forEach(objective => {
        const status = objective.completed ? '[COMPLETE]' : '[PENDING]';
        ui.print(`  ${status} ${objective.description}`);
      });
    },

    level: async () => {
      const state = levelManager.getLevelState(levelManager.currentLevel, missions.objectives);
      ui.print(`LEVEL ${levelManager.currentLevel}/10: ${levelManager.level.title} [${state.state}]`);
      ui.print(`STAGE ${levelManager.currentStage}/10: ${levelManager.stage.title}`);
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
