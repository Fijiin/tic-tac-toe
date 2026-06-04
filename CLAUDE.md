# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Philosophy

Standalone, dependency-free web app — plain HTML, CSS, and JS files. No build tools, no package managers, no frameworks. Everything runs by opening `index.html` directly in a browser.

---

## File Structure

```
tic-tac-toe/
├── index.html   — HTML structure only (board, scoreboard, sidebar, buttons)
├── style.css    — all styling + 3 themes as CSS custom property sets
├── game.js      — central state object, render loop, event handlers, undo, board-size logic
├── ai.js        — AI engine: minimax + alpha-beta pruning, all 3 difficulty levels
└── CLAUDE.md
```

`tic_tac_toe.html` is the retired single-file version — kept as a redirect only.

---

## Running the Game

Open `index.html` directly in a browser. No server needed. Changes take effect on reload (`F5`).

To test game state from the console:
```js
state.board       // current board array
state.scores      // { X, O, D }
state.settings    // size, theme, names, AI config
init()            // reset the round
```

---

## Development Setup

- Any editor works. VS Code + Live Server gives instant reload on save.
- Chrome or Firefox with DevTools (`F12`).
- No `package.json`, no `node_modules`, no build pipeline.

---

## Code Architecture

### index.html
Semantic structure only. No inline styles, no onclick attributes. IDs and classes are hooks for JS and CSS only.

### style.css
All layout and theming. CSS custom properties (`--bg`, `--card`, `--accent`, etc.) are defined per theme on `[data-theme]` selectors. Switching themes: `document.documentElement.setAttribute('data-theme', name)`. JS never sets inline styles.

### game.js
Owns the central `state` object and a `render()` function that syncs the DOM from state.

**State shape:**
```js
const state = {
  board:      [],          // flat array, length = size*size
  current:    'X',
  over:       false,
  winLine:    [],          // indices of winning cells
  statusText: '',
  history:    [],          // board snapshots before each move (for undo)
  scores:     { X, O, D },
  settings: {
    size:         3,       // 3 | 4 | 5
    theme:        'navy',  // 'navy' | 'forest' | 'purple'
    p1Name:       'Player 1',
    p2Name:       'Player 2',
    aiEnabled:    false,
    aiDifficulty: 'hard',  // 'easy' | 'medium' | 'hard'
    aiPlaysAs:    'O',
  },
};
```

**Key functions:**
- `init()` — resets round state, rebuilds board DOM. Does not reset `scores` or `settings`.
- `makeMove(i, mark)` — saves history, sets `board[i]`, checks result, calls `render()`, triggers AI if needed.
- `render()` — sole DOM writer for the board. Only adds/removes cell classes when the value changed (preserves pop-in animation).
- `handleUndo()` — pops 1 history entry (human-only) or 2 (AI mode, undoes AI response + human move).
- `buildWins(size)` — generates all winning lines dynamically for any board size.

### ai.js
Pure logic, no DOM access. Single public function:
```js
getAiMove(board, aiMark, humanMark, difficulty, size) // returns cell index
```
- **Easy**: random empty cell.
- **Medium**: minimax 60% / random 40%.
- **Hard**: full minimax with alpha-beta pruning. Unbeatable on 3x3. Depth-limited to 5 on 4x4.
- AI not available on 5x5.

---

## Design Patterns

### Class-driven visual state
JS never sets inline styles for visual state. Classes like `.x`, `.o`, `.taken`, `.winning`, `.active`, `.off` are toggled via `classList`; CSS handles the result.

### Logic/DOM separation
`checkResult()` and `buildWins()` are pure — they read `state.board` and return plain objects. `makeMove()` calls them and updates state. `render()` syncs the DOM.

### render() is the single DOM writer
Nothing writes to the board DOM except `render()`. The pop-in animation fires exactly once per new piece because `render()` only adds `taken` when it wasn't already there.

### State reset vs. persistent state
`init()` resets `board`, `current`, `over`, `winLine`, `history`, `statusText`. It does NOT reset `scores` or `settings`.

---

## Theming

Three themes: **navy** (default), **forest**, **purple** — each a set of CSS custom properties in `style.css`. Switch with `document.documentElement.setAttribute('data-theme', name)`. The difficulty slider glow and all accents inherit from `--accent` and `--accent-glow` automatically.

---

## Color Scheme

| Role | Navy | Forest | Purple |
|---|---|---|---|
| Page bg | `#1a1a2e` | `#0d1f12` | `#1a0d2e` |
| Cell bg | `#16213e` | `#122a18` | `#261040` |
| Hover | `#0f3460` | `#1a4424` | `#3a1a5e` |
| Accent | `#a0a0ff` | `#6bffb8` | `#d06bff` |
| X color | `#ff6b6b` | `#ff6b6b` | `#ff6b6b` |
| O color | `#6bcbff` | `#6bcbff` | `#6bcbff` |

---

## Git Workflow

Commit and push to `origin/master` frequently. No feature branches.

```
git add <file>
git commit -m "short description"
git push
```

### Commit message rules
- Lowercase imperative verb: `add`, `fix`, `update`, `remove`, `refactor`
- Specific and self-contained — one line, no period

---

## Adding New Features

1. **Add state** — new fields in `state` in `game.js`. Reset in `init()` if round-scoped.
2. **Add markup** — add to `index.html`. `id` for unique elements, class for repeated.
3. **Add styles** — add to `style.css`. Use existing custom properties.
4. **Add logic** — pure function if computation involved. AI logic in `ai.js`, everything else in `game.js`.
5. **Wire it up** — update event handler, mutate state, call `render()`.
6. **Test reset** — confirm `init()` handles the new state correctly.

---

## Debugging

| Symptom | Likely cause | Where to check |
|---|---|---|
| Click does nothing | `over` true or `board[i]` set | `boardEl` click handler guard |
| Wrong player shown | `state.current` not toggled | `makeMove()` after result check |
| Win not detected | `buildWins()` output wrong | Log `buildWins(state.settings.size)` |
| AI not triggering | `aiEnabled` false or size is 5 | `state.settings` in console |
| Theme not applying | `data-theme` not set on `<html>` | `document.documentElement.dataset` |

1. Open DevTools (`F12`) → Console. Inspect `state` directly — it's global.
2. Call `init()` from console to reset without reloading.
3. Use Elements panel to verify classes on cells and `<html>`.
4. Breakpoint in `makeMove()` or `render()` to step through logic.
