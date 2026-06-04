# Tic Tac Toe

A dark-themed, dependency-free Tic Tac Toe game built in plain HTML, CSS, and JavaScript. No install, no build step — just open `index.html` in a browser.

![CodeQL](https://github.com/Fijiin/tic-tac-toe/actions/workflows/codeql.yml/badge.svg)

---

## Features

- **AI Opponent** — Easy, Medium, and Hard difficulty (unbeatable Hard on 3×3, depth-limited on 4×4). Uses minimax with alpha-beta pruning.
- **Custom Player Names** — Rename both players from the settings sidebar.
- **Undo** — Take back the last move. In AI mode, undoes both the AI's response and your move.
- **Board Sizes** — Switch between 3×3, 4×4, and 5×5 grids. AI available on 3×3 and 4×4.
- **Three Themes** — Navy (default), Forest, and Purple. Switches instantly.
- **Score Tracking** — Wins and draws persist across rounds until page reload.
- **Settings Sidebar** — Slide-in panel with an animated, theme-coloured difficulty slider.

---

## Getting Started

```
git clone https://github.com/Fijiin/tic-tac-toe.git
cd tic-tac-toe
```

Then open `index.html` in any modern browser. That's it.

> **Tip:** Use VS Code with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for instant reload on save.

---

## File Structure

```
tic-tac-toe/
├── index.html      — HTML structure
├── style.css       — Styling + themes (CSS custom properties)
├── game.js         — Game state, render loop, sidebar, undo
├── ai.js           — Minimax AI engine
└── CLAUDE.md       — Developer guidance for AI-assisted work
```

---

## How to Play

1. Open `index.html` in your browser.
2. Click any cell to place your mark — **X always goes first**.
3. Hit **⚙** (top-right) to open Settings:
   - Set player names
   - Choose board size
   - Toggle AI opponent and set difficulty with the slider
   - Switch colour theme
4. Use **← Undo** to take back a move, or **New Round** to reset the board.

---

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability reporting policy.

---

## License

MIT
