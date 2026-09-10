export function createMissionCommands(context) {
  const { ui, missions } = context;

  return {
    objectives: async () => {
      ui.print('ACTIVE CONTRACT OBJECTIVES:');
      missions.objectives.forEach(objective => {
        const status = objective.completed ? '[COMPLETE]' : '[PENDING]';
        ui.print(`  ${status} ${objective.description}`);
      });
    }
  };
}
