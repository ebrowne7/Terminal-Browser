const STAGE_ACTIONS = [
  { action: 'inspect', label: 'Inspect the target filesystem' },
  { action: 'connect', label: 'Establish a controlled connection' },
  { action: 'probe', label: 'Probe the target for open services' },
  { action: 'bounce', label: 'Add another relay to the route' },
  { action: 'read', label: 'Read the intelligence you recovered' },
  { action: 'crack', label: 'Break through the target encryption' },
  { action: 'download', label: 'Download the mission payload' },
  { action: 'disconnect', label: 'Disconnect without leaving an active session' },
  { action: 'inspect', label: 'Review the evidence in your workspace' },
  { action: 'exfiltrate', label: 'Complete the final exfiltration step' }
];

const LEVEL_THEMES = [
  ['GHOST SIGNALS', 'A quiet signal is moving through public infrastructure. Follow it without becoming part of the pattern.'],
  ['COLD CIRCUIT', 'A frozen data center is waking up. Your route must stay colder than its alarms.'],
  ['THE MIRROR NET', 'Someone has built a copy of your methods. Find the mirror and leave it false information.'],
  ['BLACK ARCHIVE', 'An abandoned archive contains names that powerful people want forgotten. Extract the truth.'],
  ['SILENT CURRENT', 'A hidden exchange is moving data beneath an ordinary service network. Intercept it cleanly.'],
  ['REDLINE PROTOCOL', 'The defenders have upgraded their response system. Speed and discipline now matter equally.'],
  ['NIGHT MARKET', 'A broker is selling access to a dangerous network. Learn what is being traded before the sale closes.'],
  ['DEEP COVER', 'Your clean identity is no longer enough. Build a route that can survive a determined investigation.'],
  ['LAST HORIZON', 'Every skill you have learned is needed for the final sequence. Make the network remember a different intruder.']
];

export const ADDITIONAL_LEVELS = LEVEL_THEMES.map(([title, intro], levelIndex) => ({
  number: levelIndex + 2,
  title,
  intro,
  stages: STAGE_ACTIONS.map((stage, stageIndex) => ({
    number: stageIndex + 1,
    title: `${title} // ${String(stageIndex + 1).padStart(2, '0')}`,
    intro: `${intro} ${stage.label}.`,
    objectiveId: `level_${levelIndex + 2}_stage_${stageIndex + 1}`,
    description: `Level ${levelIndex + 2}, Stage ${stageIndex + 1}: ${stage.label}`,
    action: stage.action,
    traceBonus: 5 + (levelIndex * 1.5) + (stageIndex * 0.5)
  }))
}));

export const LEVEL_OBJECTIVES = ADDITIONAL_LEVELS.flatMap(level => level.stages.map(stage => ({
  id: stage.objectiveId,
  description: stage.description,
  action: stage.action
})));
