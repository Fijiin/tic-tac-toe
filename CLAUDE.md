# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Philosophy

Projects here are standalone, dependency-free web apps — single HTML files with embedded CSS and JS, or small collections of plain files. No build tools, no package managers, no frameworks. Everything runs by opening a file directly in a browser.

## Running Any Project

Open the relevant `.html` file directly in a browser. There is no dev server, bundler, or install step. Changes take effect on page reload.

## Architecture Conventions

### File structure
Each project is typically one self-contained `.html` file with three sections in order: HTML markup, a `<style>` block, and a `<script>` block. Larger projects may split into separate `.css` and `.js` files alongside the HTML.

### State management
State is held in plain JS variables at module (script) scope — no frameworks, no reactive stores. An `init()` function (or equivalent) resets game/app state without reloading the page. Persistent state across rounds or sessions uses `localStorage` if needed.

### UI patterns
- Layout: CSS Grid or Flexbox, centered in the viewport with `min-height: 100vh`.
- Theme: dark backgrounds (`#1a1a2e` family), muted accent colors, subtle hover transitions.
- Interactivity: event listeners attached directly to DOM elements; no delegation framework.
- No external fonts, icons, or CDN links — fully offline-capable.

### Logic patterns
- Game/app logic is kept in pure functions that operate on state variables and return results.
- DOM updates happen in event handlers after logic functions run, not inside logic functions.
- Magic values (win conditions, grid sizes, key mappings) are declared as named constants at the top of the script.

## Git & GitHub Workflow

Every change is committed and pushed to the GitHub remote (`origin/master`). There are no feature branches — commits go directly to `master`. Commit messages are short and descriptive. After any file change, the sequence is:

```
git add <file>
git commit -m "description"
git push
```
