import { GameState, Piece } from "./types";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES } from "./constants";
import { createBoard, placePiece } from "./board";
import { movePiece, hardDrop, rotatePiece } from "./movement";
import { clearLines, findFullRows, calculateScore, calculateLevel, checkGameOver } from "./scoring";

const PIECE_KEYS = Object.keys(TETROMINOES);

export type GameAction =
  | { type: "TICK" }
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "ROTATE_CW" }
  | { type: "ROTATE_CCW" }
  | { type: "SOFT_DROP" }
  | { type: "HARD_DROP" }
  | { type: "HOLD" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESTART" }
  | { type: "START" }
  | { type: "FINISH_CLEAR" }
  | { type: "RECEIVE_GARBAGE"; lines: number; gapColumn?: number }
  | { type: "FORCE_GAME_OVER" };

function shuffleBag(): string[] {
  const bag = [...PIECE_KEYS];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function drawFromBag(bag: string[]): { key: string; bag: string[] } {
  let nextBag = [...bag];
  if (nextBag.length === 0) {
    nextBag = shuffleBag();
  }
  const key = nextBag.pop()!;
  return { key, bag: nextBag };
}

function spawnPiece(key: string): Piece {
  const def = TETROMINOES[key];
  return {
    shape: def.shape.map((row) => [...row]),
    color: def.color,
    position: { x: Math.floor((BOARD_WIDTH - def.shape[0].length) / 2), y: 0 },
    rotationState: 0,
  };
}

function findPieceKey(piece: Piece): string {
  return PIECE_KEYS.find((k) => TETROMINOES[k].color === piece.color)!;
}

export function createInitialState(): GameState {
  const bag = shuffleBag();
  const draw1 = drawFromBag(bag);
  const draw2 = drawFromBag(draw1.bag);
  return {
    board: createBoard(),
    currentPiece: spawnPiece(draw1.key),
    nextPiece: spawnPiece(draw2.key),
    holdPiece: null,
    canHold: true,
    bag: draw2.bag,
    score: 0,
    level: 1,
    lines: 0,
    isGameOver: false,
    isPaused: false,
    isStarted: false,
    clearingRows: [],
    lockingCells: [],
    hardDropTrail: [],
    combo: 0,
    lastAction: null,
    tSpin: false,
  };
}

function getPieceCells(piece: Piece): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let sy = 0; sy < piece.shape.length; sy++) {
    for (let sx = 0; sx < piece.shape[sy].length; sx++) {
      if (piece.shape[sy][sx]) {
        cells.push({ x: piece.position.x + sx, y: piece.position.y + sy });
      }
    }
  }
  return cells;
}

function isTSpin(board: GameState["board"], piece: Piece, lastAction: string | null): boolean {
  if (lastAction !== "ROTATE_CW" && lastAction !== "ROTATE_CCW") return false;
  if (findPieceKey(piece) !== "T") return false;

  const cx = piece.position.x + 1;
  const cy = piece.position.y + 1;

  const corners = [
    [cx - 1, cy - 1],
    [cx + 1, cy - 1],
    [cx - 1, cy + 1],
    [cx + 1, cy + 1],
  ];

  let filled = 0;
  for (const [x, y] of corners) {
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT || board[y][x] !== null) {
      filled++;
    }
  }
  return filled >= 3;
}

function lockAndAdvance(state: GameState): GameState {
  if (!state.currentPiece) return state;

  const tSpin = isTSpin(state.board, state.currentPiece, state.lastAction);
  const lockingCells = getPieceCells(state.currentPiece);
  const boardAfterPlace = placePiece(state.board, state.currentPiece);
  const fullRows = findFullRows(boardAfterPlace);

  if (fullRows.length > 0) {
    return {
      ...state,
      board: boardAfterPlace,
      currentPiece: null,
      clearingRows: fullRows,
      lockingCells,
      tSpin,
    };
  }

  const result = advanceWithoutClear(state, boardAfterPlace);
  return { ...result, lockingCells, combo: 0, tSpin };
}

function advanceWithoutClear(state: GameState, board: GameState["board"]): GameState {
  const { key, bag } = drawFromBag(state.bag);
  const newCurrent = state.nextPiece!;
  const newNext = spawnPiece(key);

  if (checkGameOver(board, newCurrent)) {
    return { ...state, board, isGameOver: true, clearingRows: [] };
  }

  return {
    ...state,
    board,
    currentPiece: newCurrent,
    nextPiece: newNext,
    bag,
    canHold: true,
    clearingRows: [],
    lockingCells: [],
    hardDropTrail: [],
  };
}

function finishClear(state: GameState): GameState {
  if (state.clearingRows.length === 0) return state;

  const { board: boardAfterClear, linesCleared } = clearLines(state.board);
  const newLines = state.lines + linesCleared;
  const newLevel = calculateLevel(newLines);
  const newScore = state.score + calculateScore(linesCleared, state.level);

  const result = advanceWithoutClear(
    { ...state, lines: newLines, level: newLevel, score: newScore, combo: state.combo + 1 },
    boardAfterClear
  );
  return result;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "START" && !state.isStarted) {
    return { ...state, isStarted: true };
  }
  if (!state.isStarted) return state;
  if (state.isGameOver && action.type !== "RESTART") return state;
  if (action.type === "FINISH_CLEAR") return finishClear(state);
  if (state.clearingRows.length > 0) return state;
  if (action.type === "RECEIVE_GARBAGE") {
    if (state.isGameOver) return state;
    const { lines, gapColumn } = action;
    if (lines <= 0) return state;
    const gap = gapColumn ?? Math.floor(Math.random() * BOARD_WIDTH);
    const garbageRows: GameState["board"] = Array.from({ length: lines }, () => {
      const row = Array(BOARD_WIDTH).fill("gray");
      row[gap] = null;
      return row;
    });
    const newBoard = [...state.board.slice(lines), ...garbageRows];
    const topRows = state.board.slice(0, lines);
    const overflow = topRows.some((row) => row.some((cell) => cell !== null));
    if (overflow) {
      return { ...state, board: newBoard, isGameOver: true };
    }
    const newState = { ...state, board: newBoard };
    if (state.currentPiece) {
      const pushed = {
        ...state.currentPiece,
        position: { ...state.currentPiece.position, y: state.currentPiece.position.y - lines },
      };
      newState.currentPiece = pushed;
    }
    return newState;
  }
  if (state.isPaused && action.type !== "RESUME" && action.type !== "RESTART") return state;

  switch (action.type) {
    case "TICK":
    case "SOFT_DROP": {
      if (!state.currentPiece) return state;
      const moved = movePiece(state.board, state.currentPiece, "down");
      if (!moved) {
        return lockAndAdvance(state);
      }
      return { ...state, currentPiece: moved, lockingCells: [], hardDropTrail: [], lastAction: "TICK" };
    }

    case "MOVE_LEFT": {
      if (!state.currentPiece) return state;
      const moved = movePiece(state.board, state.currentPiece, "left");
      return moved ? { ...state, currentPiece: moved, lockingCells: [], hardDropTrail: [], lastAction: "MOVE_LEFT" } : state;
    }

    case "MOVE_RIGHT": {
      if (!state.currentPiece) return state;
      const moved = movePiece(state.board, state.currentPiece, "right");
      return moved ? { ...state, currentPiece: moved, lockingCells: [], hardDropTrail: [], lastAction: "MOVE_RIGHT" } : state;
    }

    case "ROTATE_CW": {
      if (!state.currentPiece) return state;
      const rotated = rotatePiece(state.board, state.currentPiece, true);
      return rotated ? { ...state, currentPiece: rotated, lockingCells: [], hardDropTrail: [], lastAction: "ROTATE_CW" } : state;
    }

    case "ROTATE_CCW": {
      if (!state.currentPiece) return state;
      const rotated = rotatePiece(state.board, state.currentPiece, false);
      return rotated ? { ...state, currentPiece: rotated, lockingCells: [], hardDropTrail: [], lastAction: "ROTATE_CCW" } : state;
    }

    case "HARD_DROP": {
      if (!state.currentPiece) return state;
      const dropped = hardDrop(state.board, state.currentPiece);
      const startY = state.currentPiece.position.y;
      const endY = dropped.position.y;
      const trail: { x: number; y: number; color: string }[] = [];
      for (let sy = 0; sy < dropped.shape.length; sy++) {
        for (let sx = 0; sx < dropped.shape[sy].length; sx++) {
          if (!dropped.shape[sy][sx]) continue;
          const col = dropped.position.x + sx;
          for (let ty = startY + sy; ty < endY + sy; ty++) {
            if (ty >= 0 && ty < BOARD_HEIGHT) {
              trail.push({ x: col, y: ty, color: dropped.color });
            }
          }
        }
      }
      const result = lockAndAdvance({ ...state, currentPiece: dropped });
      return { ...result, hardDropTrail: trail };
    }

    case "HOLD": {
      if (!state.currentPiece || !state.canHold) return state;
      const currentKey = findPieceKey(state.currentPiece);
      const holdPiece = spawnPiece(currentKey);

      let currentPiece: Piece;
      let bag = state.bag;
      let nextPiece = state.nextPiece;
      if (state.holdPiece) {
        currentPiece = spawnPiece(findPieceKey(state.holdPiece));
      } else {
        currentPiece = state.nextPiece!;
        const draw = drawFromBag(state.bag);
        nextPiece = spawnPiece(draw.key);
        bag = draw.bag;
      }

      return { ...state, currentPiece, holdPiece, nextPiece, bag, canHold: false };
    }

    case "PAUSE":
      return { ...state, isPaused: true };

    case "RESUME":
      return { ...state, isPaused: false };

    case "RESTART":
      return { ...createInitialState(), isStarted: true };

    case "FORCE_GAME_OVER":
      return { ...state, isGameOver: true };

    default:
      return state;
  }
}
