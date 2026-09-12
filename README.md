# TERM-OS Browser Game

A browser-based terminal game where you investigate fictional systems, build proxy routes, manage trace levels, and complete multi-stage contracts.

## Run

No build tools or dependencies are required. Open `index3.html` in a modern browser, or serve the folder with any local static web server.

## Gameplay

Use the terminal commands to:

- Explore virtual filesystems with `ls`, `cd`, and `cat`
- Discover and add relay nodes with `bounce`
- Connect to fictional targets with `connect`
- Probe, crack, download, and remove files
- Track objectives with `objectives`
- View campaign progress with `levels` and `level`
- Save, load, or reset progress

The game includes 10 levels, 10 stages per level, increasing trace pressure, level states, save/load support, and tutorial guidance.

## Structure

- `index3.html` - Game page
- `styles.css` - Terminal styling
- `js/config/` - Mission, network, stage, and level data
- `js/core/` - Virtual filesystem and save-state models
- `js/systems/` - Levels, missions, networking, trace, and saving
- `js/commands/` - Terminal command handlers
- `js/ui/` - Terminal display and input handling

## Documentation

- [Player Guide](docs/PLAYER_GUIDE.md) - Commands, trace strategy, and campaign flow
- [Development Guide](docs/DEVELOPMENT.md) - Module responsibilities and how to add objectives

This is a fictional simulation for game and programming purposes. It does not perform real network operations.
