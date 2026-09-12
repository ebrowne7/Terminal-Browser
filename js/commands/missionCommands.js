export function createMissionCommands(context) {
  const { ui, missions, levelManager } = context;

  return {
    objectives: async args => {
      const requestedLevel = args[0] ? Number(args[0]) : levelManager.currentLevel;
      const level = levelManager.levels[requestedLevel - 1];
      if (!level) return ui.print('Usage: objectives [level 1-10]', 'warn');

      const objectives = missions.getObjectivesForLevel(requestedLevel);
      ui.print(`CONTRACT OBJECTIVES [LEVEL ${requestedLevel}/10: ${level.title}]:`);
      objectives.forEach(objective => {
        const status = objective.completed ? '[COMPLETE]' : '[PENDING]';
        ui.print(`  ${status} ${objective.description}`);
      });
    },

    level: async () => {
      ui.print(`LEVEL ${levelManager.currentLevel}/10: ${levelManager.level.title}`);
      ui.print(`STAGE ${levelManager.currentStage}/10: ${levelManager.stage.title}`);
      ui.print(levelManager.stage.intro);
    }
  };
}
