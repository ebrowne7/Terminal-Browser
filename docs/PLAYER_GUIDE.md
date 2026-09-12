# Player Guide

## Start Here

Type `tutorial` for the basic workflow. The first useful command is:

```text
cat home/user/bounces.txt
```

This reveals relay nodes that can be added to your route.

## Core Commands

| Command | Purpose |
| --- | --- |
| `ls [path]` | List a directory |
| `cd <path>` | Change directory |
| `cat <file>` | Read a file |
| `bounce <ip>` | Add a relay to the route |
| `connect <ip>` | Connect to a fictional target |
| `probe <ip>` | Display open ports |
| `crack <file>` | Decrypt an encrypted file |
| `download <file>` | Copy a file to localhost |
| `rm <file>` | Delete a file |
| `disconnect` | End the current remote session |
| `objectives [level]` | Show objectives for a level |
| `levels` | Show level states and progress |
| `level` | Show the current level briefing |
| `save` / `load` | Save or restore progress |
| `reset` | Start a new campaign |

## Trace Tips

- Remote targets increase the trace meter over time.
- Add relay nodes with `bounce` before connecting.
- More relay hops reduce the effective trace rate.
- Disconnect after completing a remote task.
- If trace reaches 100%, use the recovery controls to load or reset.

## Campaign Progress

The campaign has 10 levels with 10 stages per level. Objectives within the active level can be completed in any order. A level is won when all of its objectives are complete; later levels remain locked until then.
