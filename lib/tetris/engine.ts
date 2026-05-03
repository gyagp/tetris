import { GameState, Piece } from "./types";
import { BOARD_WIDTH, TETROMINOES } from "./constants";
import { createBoard, placePiece } from "./board";
import { movePiece, hardDrop, rotatePiece } from "./movement";
import { clearLines, calculateScore, calculateLevel, checkGameOver } from "./scoring";

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
  | { type: "RESTART" };

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
  };
}

function lockAndAdvance(state: GameState): GameState {
  if (!state.currentPiece) return state;

  const boardAfterPlace = placePiece(state.board, state.currentPiece);
  const { board: boardAfterClear, linesCleared } = clearLines(boardAfterPlace);
  const newLines = state.lines + linesCleared;
  const newLevel = calculateLevel(newLines);
  const newScore = state.score + calculateScore(linesCleared, state.level);

  const { key, bag } = drawFromBag(state.bag);
  const newCurrent = state.nextPiece!;
  const newNext = spawnPiece(key);

  if (checkGameOver(boardAfterClear, newCurrent)) {
    return { ...state, board: boardAfterClear, isGameOver: true, score: newScore, level: newLevel, lines: newLines };
  }

  return {
    ...state,
    board: boardAfterClear,
    currentPiece: newCurrent,
    nextPiece: newNext,
    bag,
    canHold: true,
    score: newScore,
    level: newLevel,
    lines: newLines,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.isGameOver && action.type !== "RESTART") return state;
  if (state.isPaused && action.type !== "RESUME" && action.type !== "RESTART") return state;

  switch (action.type) {
    case "TICK":
    case "SOFT_DROP": {
      if (!state.currentPiece) return state;
      const moved = movePiece(state.board, state.currentPiece, "down");
      if (!moved) {
        return lockAndAdvance(state);
      }
      return { ...state, currentPiece: moved };
    }

    case "MOVE_LEFT": {
      if (!state.currentPiece) return state;
      const moved = movePiece(state.board, state.currentPiece, "left");
      return moved ? { ...state, currentPiece: moved } : state;
    }

    case "MOVE_RIGHT": {
      if (!state.currentPiece) return state;
      const moved = movePiece(state.board, state.currentPiece, "right");
      return moved ? { ...state, currentPiece: moved } : state;
    }

    case "ROTATE_CW": {
      if (!state.currentPiece) return state;
      const rotated = rotatePiece(state.board, state.currentPiece, true);
      return rotated ? { ...state, currentPiece: rotated } : state;
    }

    case "ROTATE_CCW": {
      if (!state.currentPiece) return state;
      const rotated = rotatePiece(state.board, state.currentPiece, false);
      return rotated ? { ...state, currentPiece: rotated } : state;
    }

    case "HARD_DROP": {
      if (!state.currentPiece) return state;
      const dropped = hardDrop(state.board, state.currentPiece);
      return lockAndAdvance({ ...state, currentPiece: dropped });
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
      return createInitialState();

    default:
      return state;
  }
}
