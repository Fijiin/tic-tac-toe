'use strict';

// Returns the index of the cell the AI should play, or -1 if board is full.
function getAiMove(board, aiMark, humanMark, difficulty, size) {
  const empty = board.reduce((acc, v, i) => { if (!v) acc.push(i); return acc; }, []);
  if (!empty.length) return -1;

  if (difficulty === 'easy') return _random(empty);
  if (difficulty === 'medium' && Math.random() < 0.4) return _random(empty);

  const maxDepth = size === 4 ? 5 : 18;
  return _minimax(board.slice(), aiMark, aiMark, humanMark, size, 0, maxDepth, -Infinity, Infinity).index;
}

function _random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const _winsCache = {};
function _getWins(size) {
  if (_winsCache[size]) return _winsCache[size];
  const lines = [];
  for (let i = 0; i < size; i++) {
    lines.push(Array.from({ length: size }, (_, j) => i * size + j));
    lines.push(Array.from({ length: size }, (_, j) => j * size + i));
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
  return (_winsCache[size] = lines);
}

function _eval(board, aiMark, humanMark, size, depth) {
  for (const line of _getWins(size)) {
    const v = board[line[0]];
    if (v && line.every(i => board[i] === v)) {
      return v === aiMark ? 10 - depth : depth - 10;
    }
  }
  return null;
}

function _minimax(board, mark, aiMark, humanMark, size, depth, maxDepth, alpha, beta) {
  const score = _eval(board, aiMark, humanMark, size, depth);
  if (score !== null) return { score, index: -1 };

  const empty = board.reduce((a, v, i) => { if (!v) a.push(i); return a; }, []);
  if (!empty.length || depth >= maxDepth) return { score: 0, index: -1 };

  const isMax = mark === aiMark;
  let best = { score: isMax ? -Infinity : Infinity, index: -1 };

  for (const i of empty) {
    board[i] = mark;
    const result = _minimax(
      board, isMax ? humanMark : aiMark,
      aiMark, humanMark, size, depth + 1, maxDepth, alpha, beta
    );
    board[i] = null;

    if (isMax ? result.score > best.score : result.score < best.score) {
      best = { score: result.score, index: i };
    }
    if (isMax) { alpha = Math.max(alpha, best.score); }
    else       { beta  = Math.min(beta,  best.score); }
    if (beta <= alpha) break;
  }
  return best;
}
