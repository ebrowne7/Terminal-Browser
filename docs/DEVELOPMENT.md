# Development Guide

## Entry Point

`index3.html` loads `styles.css` and the ES module entry point `js/main.js`. No package manager or build step is required.

## Module Responsibilities

- `js/config/` contains static network, mission, stage, and level definitions.
- `js/core/` contains the virtual filesystem and serialized game-state model.
- `js/systems/LevelManager.js` tracks the active level, stage, trace pressure, and win transitions.
- `js/systems/MissionManager.js` owns objective completion and level objective filtering.
- `js/systems/SaveManager.js` serializes objectives, filesystems, routes, working directories, and level progress to local storage.
- `js/systems/TraceEngine.js` controls the trace timer and HUD.
- `js/commands/` contains terminal command handlers. Commands receive shared dependencies through a context object created in `main.js`.
- `js/ui/` contains DOM rendering and keyboard input handling.

## Adding Objectives

1. Add the objective definition to `js/config/missionData.js`.
2. Add its ID to the appropriate stage in `js/config/stageData.js`, or define an action-based objective in `js/config/levelData.js`.
3. Connect the objective to an existing command in `js/commands/`.
4. Keep objective IDs unique.
5. Test both `objectives` and `levels` after the change.

## Save Compatibility

The save schema version is defined in `js/core/GameState.js`. When changing the saved shape, update the version and add migration logic in `SaveManager.load()` so existing player progress is not discarded.

## Scope

The game is a fictional terminal simulation. It does not connect to real hosts or perform real network operations.
