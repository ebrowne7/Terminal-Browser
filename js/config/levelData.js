const STAGE_PLANS = [
  [
    ['inspect'], ['bounce', 'connect'], ['probe'], ['inspect', 'read'], ['crack'],
    ['read'], ['download'], ['disconnect'], ['inspect', 'read'], ['download', 'disconnect']
  ],
  [
    ['bounce'], ['connect', 'probe'], ['inspect'], ['read'], ['crack', 'read'],
    ['bounce', 'connect'], ['probe', 'inspect'], ['download'], ['disconnect'], ['download', 'disconnect']
  ],
  [
    ['inspect', 'probe'], ['connect'], ['probe', 'inspect', 'read'], ['crack'], ['read', 'download'],
    ['disconnect'], ['bounce', 'connect'], ['probe', 'crack'], ['read'], ['download', 'disconnect']
  ],
  [
    ['bounce', 'connect'], ['probe'], ['inspect', 'read'], ['crack', 'read'], ['download'],
    ['disconnect'], ['inspect'], ['bounce', 'connect', 'probe'], ['crack', 'read', 'download'], ['disconnect']
  ],
  [
    ['inspect'], ['probe', 'inspect'], ['bounce', 'connect'], ['read'], ['crack'], ['read', 'download'],
    ['disconnect'], ['bounce', 'connect'], ['probe', 'inspect', 'crack'], ['read', 'download', 'disconnect']
  ],
  [
    ['bounce'], ['connect'], ['probe', 'inspect'], ['crack', 'read'], ['download', 'disconnect'],
    ['bounce', 'connect', 'probe'], ['inspect'], ['crack'], ['read', 'download'], ['disconnect']
  ],
  [
    ['inspect', 'probe'], ['bounce', 'connect'], ['inspect'], ['crack'], ['read'], ['download'],
    ['disconnect'], ['bounce', 'connect', 'probe'], ['inspect', 'crack', 'read'], ['download', 'disconnect']
  ],
  [
    ['bounce', 'connect'], ['probe', 'inspect', 'read'], ['crack'], ['read', 'download'], ['disconnect'],
    ['inspect'], ['bounce', 'connect'], ['probe', 'inspect', 'crack'], ['read', 'download'], ['disconnect']
  ],
  [
    ['inspect'], ['bounce', 'connect', 'probe'], ['inspect', 'read'], ['crack', 'read'], ['download'],
    ['disconnect'], ['bounce', 'connect'], ['probe'], ['inspect', 'crack', 'read', 'download'], ['disconnect']
  ]
];

const ACTION_LABELS = {
  inspect: 'Inspect the target filesystem',
  connect: 'Establish a controlled connection',
  probe: 'Probe the target for open services',
  bounce: 'Add another relay to the route',
  read: 'Read the intelligence you recovered',
  crack: 'Break through the target encryption',
  download: 'Download the mission payload',
  disconnect: 'Disconnect without leaving an active session'
};

const ACTION_DISPLAY_LABELS = {
  inspect: 'Inspect target',
  connect: 'Connect',
  probe: 'Probe target',
  bounce: 'Add relay',
  read: 'Read file',
  crack: 'Crack file',
  download: 'Download payload',
  disconnect: 'Disconnect'
};

const STAGE_GOALS = [
  'Locate the signal source',
  'Assemble a quiet route',
  'Map the exposed services',
  'Verify the useful evidence',
  'Unlock the protected layer',
  'Interpret the recovered intelligence',
  'Move the evidence to safety',
  'Erase the active connection',
  'Cross-check the collected evidence',
  'Leave the network cold'
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
  stages: STAGE_PLANS[levelIndex].map((actions, stageIndex) => {
    const stageGoal = STAGE_GOALS[stageIndex];

    return {
    number: stageIndex + 1,
    title: `${String(stageIndex + 1).padStart(2, '0')}: ${stageGoal.toUpperCase()}`,
    intro: `Stage focus: ${stageGoal.toLowerCase()}. Complete these actions: ${actions.map(action => ACTION_LABELS[action].toLowerCase()).join(', then ')}.`,
    objectiveIds: actions.map((action, actionIndex) => (
      `level_${levelIndex + 2}_stage_${stageIndex + 1}_task_${actionIndex + 1}`
    )),
    objectives: actions.map((action, actionIndex) => ({
      description: ACTION_DISPLAY_LABELS[action],
      action
    })),
    traceBonus: 5 + (levelIndex * 1.5) + (stageIndex * 0.5)
  };
  })
}));

export const LEVEL_OBJECTIVES = ADDITIONAL_LEVELS.flatMap(level => level.stages.flatMap(stage => (
  stage.objectives.map((objective, objectiveIndex) => ({
    id: stage.objectiveIds[objectiveIndex],
    description: objective.description,
    action: objective.action
  }))
)));
