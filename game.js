'use strict';

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  board:      [],
  current:    'X',
  over:       false,
  winLine:    [],
  statusText: '',
  history:    [],
  scores:     { X: 0, O: 0, D: 0 },
  settings: {
    size:         3,
    theme:        'navy',
    p1Name:       'Player 1',
    p2Name:       'Player 2',
    aiEnabled:    false,
    aiDifficulty: 'hard',
    aiPlaysAs:    'O',
  },
};

// ── DOM refs ───────────────────────────────────────────────────────────────
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const boardEl     = $('board');
const statusEl    = $('status');
const scoreXEl    = $('score-x');
const scoreOEl    = $('score-o');
const scoreDEl    = $('score-d');
const labelXEl    = $('label-x');
const labelOEl    = $('label-o');
const undoBtn     = $('undo-btn');
const restartBtn  = $('restart-btn');
const gearBtn     = $('gear-btn');
const sidebar     = $('sidebar');
const overlay     = $('sidebar-overlay');
const closeBtn    = $('sidebar-close');
const applyBtn    = $('sidebar-apply');
const p1Input     = $('p1-name');
const p2Input     = $('p2-name');
const aiToggleEl  = $('ai-toggle');
const diffGroupEl = $('difficulty-group');
const diffLabelEl = $('diff-label');
const sliderTrack = $('slider-track');
const sliderFill  = $('slider-fill');
const sliderThumb = $('slider-thumb');

// ── Helpers ────────────────────────────────────────────────────────────────
const name = mark => mark === 'X' ? state.settings.p1Name : state.settings.p2Name;

function buildWins(size) {
  const lines = [];
  for (let i = 0; i < size; i++) {
    lines.push(Array.from({ length: size }, (_, j) => i * size + j));
    lines.push(Array.from({ length: size }, (_, j) => j * size + i));
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
  return lines;
}

function checkResult() {
  const { board, settings: { size } } = state;
  for (const line of buildWins(size)) {
    const v = board[line[0]];
    if (v && line.every(i => board[i] === v)) return { winner: v, line };
  }
  return board.every(Boolean) ? { winner: null, line: [] } : null;
}

// ── Board DOM ──────────────────────────────────────────────────────────────
function buildBoard() {
  const { size } = state.settings;
  boardEl.innerHTML = '';
  boardEl.dataset.size = size;
  boardEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  boardEl.style.gridTemplateRows    = `repeat(${size}, 1fr)`;
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.i  = i;
    boardEl.appendChild(cell);
  }
}

// ── Render ─────────────────────────────────────────────────────────────────
function render() {
  const { board, scores, history, settings, statusText, winLine, over } = state;
  const cells = boardEl.querySelectorAll('.cell');

  cells.forEach((cell, i) => {
    const v          = board[i];
    const alreadySet = cell.classList.contains('taken');
    if (v && !alreadySet) {
      cell.className  = `cell ${v.toLowerCase()} taken`;
      cell.textContent = v;
    } else if (!v && alreadySet) {
      cell.className  = 'cell';
      cell.textContent = '';
    }
    if (v) cell.classList.toggle('winning', winLine.includes(i));
  });

  labelXEl.textContent = settings.p1Name;
  labelOEl.textContent = settings.p2Name;
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
  statusEl.textContent = statusText;
  undoBtn.disabled     = history.length === 0 || over;
}

// ── Game logic ─────────────────────────────────────────────────────────────
function init() {
  const { size } = state.settings;
  state.board      = Array(size * size).fill(null);
  state.current    = 'X';
  state.over       = false;
  state.winLine    = [];
  state.history    = [];
  state.statusText = `${name('X')}'s turn`;
  buildBoard();
  render();
}

function makeMove(i, mark) {
  state.history.push(state.board.slice());
  state.board[i] = mark;

  const result = checkResult();
  if (result) {
    state.over    = true;
    state.winLine = result.line;
    if (result.winner) {
      state.scores[result.winner]++;
      state.statusText = `${name(result.winner)} wins!`;
    } else {
      state.scores.D++;
      state.statusText = "It's a draw!";
    }
    render();
    return;
  }

  state.current    = mark === 'X' ? 'O' : 'X';
  state.statusText = `${name(state.current)}'s turn`;
  render();

  if (state.settings.aiEnabled && state.current === state.settings.aiPlaysAs) {
    statusEl.textContent = `${name(state.current)} is thinking…`;
    setTimeout(doAiMove, 350);
  }
}

function doAiMove() {
  if (state.over || sidebar.classList.contains('open')) return;
  const { board, settings: { aiPlaysAs, aiDifficulty, size } } = state;
  const humanMark = aiPlaysAs === 'O' ? 'X' : 'O';
  const idx = getAiMove(board.slice(), aiPlaysAs, humanMark, aiDifficulty, size);
  if (idx >= 0) makeMove(idx, aiPlaysAs);
}

// ── Undo ───────────────────────────────────────────────────────────────────
function handleUndo() {
  if (state.history.length === 0 || state.over) return;

  if (state.settings.aiEnabled && state.history.length >= 2) {
    state.history.pop();
    state.board = state.history.pop().slice();
  } else {
    state.board = state.history.pop().slice();
  }

  state.current    = state.history.length % 2 === 0 ? 'X' : 'O';
  state.over       = false;
  state.winLine    = [];
  state.statusText = `${name(state.current)}'s turn`;
  render();
}

// ── Board click ────────────────────────────────────────────────────────────
boardEl.addEventListener('click', e => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  const i = +cell.dataset.i;
  if (state.over || state.board[i]) return;
  if (state.settings.aiEnabled && state.current === state.settings.aiPlaysAs) return;
  makeMove(i, state.current);
});

// ── Sidebar ────────────────────────────────────────────────────────────────
function openSidebar() {
  p1Input.value = state.settings.p1Name;
  p2Input.value = state.settings.p2Name;
  syncSidebar();
  sidebar.classList.add('open');
  overlay.classList.add('visible');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('visible');
  state.settings.p1Name = p1Input.value.trim() || 'Player 1';
  state.settings.p2Name = p2Input.value.trim() || (state.settings.aiEnabled ? 'Computer' : 'Player 2');
  if (!state.over) state.statusText = `${name(state.current)}'s turn`;
  render();
  if (state.settings.aiEnabled && state.current === state.settings.aiPlaysAs && !state.over) {
    setTimeout(doAiMove, 350);
  }
}

function syncSidebar() {
  const { settings } = state;
  $$('#size-pills .pill').forEach(p => p.classList.toggle('active', +p.dataset.size === settings.size));
  aiToggleEl.classList.toggle('off', !settings.aiEnabled);
  aiToggleEl.setAttribute('aria-checked', String(settings.aiEnabled));
  diffGroupEl.style.display = settings.aiEnabled ? '' : 'none';
  $$('#theme-btns .theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
}

$$('#size-pills .pill').forEach(pill => {
  pill.addEventListener('click', () => {
    const newSize = +pill.dataset.size;
    if (newSize === state.settings.size) return;
    state.settings.size = newSize;
    syncSidebar();
    init();
  });
});

aiToggleEl.addEventListener('click', () => {
  state.settings.aiEnabled = !state.settings.aiEnabled;
  if (state.settings.aiEnabled  && p2Input.value.trim() === 'Player 2') p2Input.value = 'Computer';
  if (!state.settings.aiEnabled && p2Input.value.trim() === 'Computer')  p2Input.value = 'Player 2';
  syncSidebar();
});

$$('#theme-btns .theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.settings.theme = btn.dataset.theme;
    document.documentElement.setAttribute('data-theme', btn.dataset.theme);
    $$('#theme-btns .theme-btn').forEach(b => b.classList.toggle('active', b === btn));
  });
});

p1Input.addEventListener('input', () => {
  state.settings.p1Name = p1Input.value.trim() || 'Player 1';
  if (!state.over) state.statusText = `${name(state.current)}'s turn`;
  render();
});

p2Input.addEventListener('input', () => {
  state.settings.p2Name = p2Input.value.trim() || 'Player 2';
  if (!state.over) state.statusText = `${name(state.current)}'s turn`;
  render();
});

gearBtn.addEventListener('click', openSidebar);
closeBtn.addEventListener('click', closeSidebar);
applyBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
restartBtn.addEventListener('click', init);
undoBtn.addEventListener('click', handleUndo);

// ── Difficulty slider ──────────────────────────────────────────────────────
const DIFF_STEPS = [
  { pct: 0,   label: 'Easy',   value: 'easy'   },
  { pct: 50,  label: 'Medium', value: 'medium' },
  { pct: 100, label: 'Hard',   value: 'hard'   },
];
let sliderDragging = false;

function applyStep(idx, animate) {
  const { pct, label, value } = DIFF_STEPS[idx];
  const t = animate ? 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' : 'none';
  sliderFill.style.transition  = t;
  sliderThumb.style.transition = t;
  sliderFill.style.width  = pct + '%';
  sliderThumb.style.left  = pct + '%';
  diffLabelEl.textContent = label;
  state.settings.aiDifficulty = value;
  $$('.tick').forEach((tick, i) => tick.classList.toggle('active', i <= idx));
}

function snapIdx(pct) {
  return DIFF_STEPS.reduce(
    (best, s, i) => Math.abs(s.pct - pct) < Math.abs(DIFF_STEPS[best].pct - pct) ? i : best, 0
  );
}

function trackPct(clientX) {
  const r = sliderTrack.getBoundingClientRect();
  return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
}

function liveSlider(clientX) {
  const pct = trackPct(clientX);
  sliderFill.style.transition = sliderThumb.style.transition = 'none';
  sliderFill.style.width = pct + '%';
  sliderThumb.style.left = pct + '%';
  diffLabelEl.textContent = DIFF_STEPS[snapIdx(pct)].label;
}

sliderThumb.addEventListener('mousedown', e => { sliderDragging = true; e.preventDefault(); });
sliderTrack.addEventListener('click', e => applyStep(snapIdx(trackPct(e.clientX)), true));
document.addEventListener('mousemove', e => { if (sliderDragging) liveSlider(e.clientX); });
document.addEventListener('mouseup', e => {
  if (!sliderDragging) return;
  sliderDragging = false;
  applyStep(snapIdx(trackPct(e.clientX)), true);
});
sliderThumb.addEventListener('touchstart', () => { sliderDragging = true; }, { passive: true });
document.addEventListener('touchmove', e => {
  if (sliderDragging) liveSlider(e.touches[0].clientX);
}, { passive: true });
document.addEventListener('touchend', e => {
  if (!sliderDragging) return;
  sliderDragging = false;
  applyStep(snapIdx(trackPct(e.changedTouches[0].clientX)), true);
});

// ── Bootstrap ──────────────────────────────────────────────────────────────
applyStep(2, false);
init();
