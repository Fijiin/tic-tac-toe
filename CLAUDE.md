# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Philosophy

Projects here are standalone, dependency-free web apps — single HTML files with embedded CSS and JS, or small collections of plain files. No build tools, no package managers, no frameworks. Everything runs by opening a file directly in a browser.

---

## Running the Games

Open the relevant `.html` file directly in a browser (double-click or drag into the address bar). No dev server, bundler, or install step. Changes take effect on page reload (`F5` or `Ctrl+R`).

To test a specific game state quickly, call `init()` from the browser console to reset without reloading, or mutate state globals (e.g. `board`, `scores`) directly in the console.

---

## Development Setup

- **Editor**: Any editor works. VS Code with the Live Server extension gives instant reload on save.
- **Browser**: Chrome or Firefox with DevTools open (`F12`). Use the Console tab for logging and the Elements tab to inspect DOM and CSS live.
- **No installs required**: There is no `package.json`, no `node_modules`, no build pipeline.
- **Workflow**: Edit the file → save → reload browser. That's the full loop.

---

## Code Architecture

Each project is a single `.html` file divided into three sections:

1. **HTML** — semantic structure only; no inline styles or onclick attributes. Elements are identified by `id` or a shared class (e.g. `.cell`). Data attributes (e.g. `data-i`) carry index or metadata.

2. **CSS** (`<style>` block) — all layout and theming. State-driven visual changes (e.g. `.winning`, `.taken`, `.x`, `.o`) are applied by adding/removing classes in JS, not by setting `element.style` directly.

3. **JavaScript** (`<script>` block) — structured as:
   - **Constants** at the top (e.g. `WINS` array of winning index triplets).
   - **State variables** (`board`, `current`, `over`, `scores`) — plain `let`/`const` at script scope.
   - **DOM references** cached once at startup (`document.querySelectorAll`, `getElementById`).
   - **Logic functions** (`checkWinner`, etc.) — pure, operate on state, return results, never touch the DOM.
   - **Event handlers** (`handleClick`, etc.) — call logic functions, then update DOM based on results.
   - **`init()`** — resets board state and DOM without resetting persistent state like `scores`.
   - **Event listener wiring** and initial `init()` call at the bottom.

---

## Design Patterns

### State reset vs. full reset
`init()` resets only round state (`board`, `current`, `over`) and clears cell classes/text. Persistent counters (`scores`) survive across rounds and only reset on page reload.

### Class-driven visual state
JS never sets inline styles. Instead, classes like `.x`, `.o`, `.taken`, `.winning` are added to elements, and CSS handles the visual result. This keeps styling in one place.

### Logic/DOM separation
`checkWinner()` knows nothing about the DOM — it reads `board[]` and returns a plain object. The handler (`handleClick`) receives that result and decides what to update in the DOM. New games should follow this same split.

### Data attributes as index
Cells use `data-i="0"` through `data-i="8"`. The handler reads `+cell.dataset.i` to get the numeric index into `board[]`. This avoids maintaining a separate mapping between elements and game state.

---

## Color Scheme

All projects share this dark palette for visual consistency:

| Role | Value |
|---|---|
| Page background | `#1a1a2e` |
| Card / cell background | `#16213e` |
| Hover / active element | `#0f3460` |
| Heading text | `#e0e0ff` |
| Accent / secondary text | `#a0a0ff` |
| Player X (red) | `#ff6b6b` |
| Player O (blue) | `#6bcbff` |
| Neutral / draws | `#aaa` |

Glow effects use `box-shadow` with low-opacity `rgba(160, 160, 255, 0.4)`.

---

## Git Workflow

Every change is committed and pushed to `origin/master`. No feature branches — commits go directly to `master`.

```
git add <file>
git commit -m "short description"
git push
```

Commit messages are lowercase, imperative, and specific (e.g. `add draw detection`, `fix winning line highlight`, `update color scheme`).

---

## Adding New Features

Follow this checklist when extending any project:

1. **Add state** — declare any new variables alongside existing ones (`let`, `const` at script scope). If the state needs to reset per round, add the reset to `init()`.
2. **Add markup** — add the new HTML element. Give it an `id` if it's unique, a class if it's repeated.
3. **Add styles** — add CSS for the new element in the `<style>` block. Use existing palette colors.
4. **Add logic** — write a pure function if the feature involves computation (e.g. `checkWinner`-style). Keep it DOM-free.
5. **Wire it up** — update the relevant event handler to call the new logic and update the DOM.
6. **Test reset** — verify `init()` (Restart button) handles the new state correctly.

Example: adding an AI opponent would mean adding an `aiMove()` logic function, calling it inside `handleClick` after the human's turn, and making sure `init()` still works without changes to `aiMove`.

---

## Debugging

### Common issues and where to look

| Symptom | Likely cause | Where to check |
|---|---|---|
| Click does nothing | `over` is `true` or `board[i]` is already set | `handleClick` guard at the top |
| Wrong player shown | `current` not toggled | Bottom of `handleClick` after the early-return block |
| Win not detected | `WINS` array wrong, or `board` indices off | Log `board` after each click; inspect `WINS` |
| Scores not updating | Score DOM ids don't match JS selectors | Compare `getElementById('score-x')` etc. to HTML `id` attrs |
| Restart broken | `init()` not resetting all state or not clearing all classes | Step through `init()` in DevTools debugger |
| Style not applying | Class name mismatch between JS and CSS | Use Elements panel to inspect which classes are actually on the element |

### Debugging workflow

1. Open DevTools (`F12`) → Console tab.
2. Add `console.log(board, current, over)` inside `handleClick` to trace state after every move.
3. Use the Elements panel to verify classes are added/removed as expected.
4. Use the Sources tab → set a breakpoint inside `handleClick` or `checkWinner` to step through logic.
5. To simulate a game state, paste into the console:
   ```js
   board = ['X','O','X','O','X','O',null,null,null]; current = 'X'; over = false;
   ```
   Then click a cell to trigger the next step.
