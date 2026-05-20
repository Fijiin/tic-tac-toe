# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the game

Open directly in a browser:
```
start tic_tac_toe.html
```

Or serve over the local network (required for mobile access):
```
python -m http.server 8080
# then visit http://<your-local-ip>:8080/tic_tac_toe.html
```

## Git workflow

All changes should be committed and pushed to GitHub:
```
git add tic_tac_toe.html
git commit -m "description of change"
git push
```

Remote: https://github.com/Fijiin/tic-tac-toe

## Architecture

Everything lives in a single file — `tic_tac_toe.html` — with no build step, no dependencies, and no external assets.

**State** (script-global variables):
- `board` — 9-element array, each cell `null | 'X' | 'O'`
- `current` — whose turn it is (`'X'` or `'O'`)
- `over` — boolean, blocks further clicks after a game ends
- `scores` — `{ X, O, D }` object, persists across rounds (not reset on restart)

**Key functions:**
- `init()` — resets board/current/over and clears DOM; called on page load and Restart click
- `checkWinner()` — checks all 8 win combos in `WINS`; returns `{ winner, line }` on win, `{ winner: null }` on draw, `null` if game continues
- `handleClick(e)` — main game logic: places mark, checks result, updates scores and status text

**DOM bindings** are set once at script load (`cells.forEach`, `#restart`); `init()` only resets state and cell classes, it does not re-bind events.
