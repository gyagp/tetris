import { describe, it, expect } from "vitest";
import { createInitialState, gameReducer } from "./engine";
import { GameState, Piece } from "./types";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES } from "./constants";
import { createBoard } from "./board";

function startGame(): GameState {
  const state = createInitialState();
  return gameReducer(state, { type: "START" });
}

function fillRow(state: GameState, row: number): GameState {
  const board = state.board.map((r) => [...r]);
  for (let x = 0; x < BOARD_WIDTH; x++) {
    board[row][x] = "#ff0000";
  }
  return { ...state, board };
}

describe("combo counter", () => {
  it("initializes combo to 0", () => {
    const state = createInitialState();
    expect(state.combo).toBe(0);
  });

  it("combo is accessible on GameState", () => {
    const state = startGame();
    expect(typeof state.combo).toBe("number");
  });

  it("increments combo when lines are cleared via FINISH_CLEAR", () => {
    let state = startGame();
    const bottomRow = BOARD_HEIGHT - 1;
    state = fillRow(state, bottomRow);
    state = { ...state, clearingRows: [bottomRow] };
    const after = gameReducer(state, { type: "FINISH_CLEAR" });
    expect(after.combo).toBe(1);
  });

  it("accumulates combo across consecutive clears", () => {
    let state = startGame();
    state = { ...state, combo: 2 };
    const bottomRow = BOARD_HEIGHT - 1;
    state = fillRow(state, bottomRow);
    state = { ...state, clearingRows: [bottomRow] };
    const after = gameReducer(state, { type: "FINISH_CLEAR" });
    expect(after.combo).toBe(3);
  });

  it("resets combo to 0 when piece locks without clearing lines (HARD_DROP)", () => {
    let state = startGame();
    state = { ...state, combo: 3 };
    const after = gameReducer(state, { type: "HARD_DROP" });
    if (after.clearingRows.length === 0) {
      expect(after.combo).toBe(0);
    }
  });

  it("resets combo to 0 when piece locks without clearing lines (TICK to bottom)", () => {
    let state = startGame();
    state = { ...state, combo: 5 };
    // Use HARD_DROP which always locks immediately — cleaner than tick loop
    const after = gameReducer(state, { type: "HARD_DROP" });
    // On an empty board, no lines should be cleared
    expect(after.clearingRows.length).toBe(0);
    expect(after.combo).toBe(0);
  });

  it("combo resets on restart", () => {
    let state = startGame();
    state = { ...state, combo: 5 };
    const after = gameReducer(state, { type: "RESTART" });
    expect(after.combo).toBe(0);
  });
});

function makeTPiece(position: { x: number; y: number }): Piece {
  return {
    shape: TETROMINOES.T.shape.map((r) => [...r]),
    color: TETROMINOES.T.color,
    position,
    rotationState: 0,
  };
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    isStarted: true,
    ...overrides,
  };
}

describe("T-spin detection", () => {
  it("detects T-spin when 3 corners are filled after rotation", () => {
    const board = createBoard();
    const px = 3;
    const py = 17;

    // Fill 3 of 4 corners around T center (px+1, py+1)
    board[py][px] = "#fff";
    board[py][px + 2] = "#fff";
    board[py + 2][px] = "#fff";

    // Block downward movement
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (py + 3 < BOARD_HEIGHT) board[py + 3][x] = "#fff";
    }
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[py + 2][x] === null && x !== px + 1) {
        board[py + 2][x] = "#fff";
      }
    }

    const state = makeState({
      board,
      currentPiece: makeTPiece({ x: px, y: py }),
      lastAction: "ROTATE_CW",
    });

    const result = gameReducer(state, { type: "TICK" });
    expect(result.tSpin).toBe(true);
  });

  it("does not detect T-spin when last action was not rotation", () => {
    const board = createBoard();
    const px = 3;
    const py = 17;

    board[py][px] = "#fff";
    board[py][px + 2] = "#fff";
    board[py + 2][px] = "#fff";

    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[py + 2][x] === null && x !== px + 1) board[py + 2][x] = "#fff";
    }
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (py + 3 < BOARD_HEIGHT) board[py + 3][x] = "#fff";
    }

    const state = makeState({
      board,
      currentPiece: makeTPiece({ x: px, y: py }),
      lastAction: "MOVE_LEFT",
    });

    const result = gameReducer(state, { type: "TICK" });
    expect(result.tSpin).toBe(false);
  });

  it("does not detect T-spin for non-T pieces", () => {
    const board = createBoard();
    const px = 3;
    const py = 17;

    board[py][px] = "#fff";
    board[py][px + 2] = "#fff";
    board[py + 2][px] = "#fff";

    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[py + 2][x] === null) board[py + 2][x] = "#fff";
    }
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (py + 3 < BOARD_HEIGHT) board[py + 3][x] = "#fff";
    }

    const sPiece: Piece = {
      shape: TETROMINOES.S.shape.map((r) => [...r]),
      color: TETROMINOES.S.color,
      position: { x: px, y: py },
      rotationState: 0,
    };

    const state = makeState({
      board,
      currentPiece: sPiece,
      lastAction: "ROTATE_CW",
    });

    const result = gameReducer(state, { type: "TICK" });
    expect(result.tSpin).toBe(false);
  });

  it("does not detect T-spin when fewer than 3 corners are filled", () => {
    const board = createBoard();
    const px = 3;
    const py = 17;

    // Only 2 corners filled (top-left, top-right)
    board[py][px] = "#fff";
    board[py][px + 2] = "#fff";
    // Leave bottom corners empty

    // Block downward movement without filling bottom corners
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (py + 3 < BOARD_HEIGHT) board[py + 3][x] = "#fff";
    }
    // Fill row py+2 but skip BOTH bottom corners and the T center column
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (x === px || x === px + 1 || x === px + 2) continue;
      board[py + 2][x] = "#fff";
    }

    const state = makeState({
      board,
      currentPiece: makeTPiece({ x: px, y: py }),
      lastAction: "ROTATE_CW",
    });

    const result = gameReducer(state, { type: "TICK" });
    expect(result.tSpin).toBe(false);
  });

  it("counts wall as filled corners for T-spin", () => {
    const board = createBoard();
    const px = 0;
    const py = BOARD_HEIGHT - 3;

    // Left wall gives 2 filled corners, add 1 more
    board[py][px + 2] = "#fff";

    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (py + 3 < BOARD_HEIGHT) board[py + 3][x] = "#fff";
    }
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[py + 2][x] === null && x !== px + 1) board[py + 2][x] = "#fff";
    }

    const state = makeState({
      board,
      currentPiece: makeTPiece({ x: px, y: py }),
      lastAction: "ROTATE_CCW",
    });

    const result = gameReducer(state, { type: "TICK" });
    expect(result.tSpin).toBe(true);
  });

  it("stores tSpin in initial game state as false", () => {
    const state = createInitialState();
    expect(state).toHaveProperty("tSpin");
    expect(state.tSpin).toBe(false);
  });

  it("tracks lastAction as ROTATE_CW after clockwise rotation", () => {
    const state = makeState({ currentPiece: makeTPiece({ x: 4, y: 0 }) });
    const result = gameReducer(state, { type: "ROTATE_CW" });
    expect(result.lastAction).toBe("ROTATE_CW");
  });

  it("tracks lastAction as ROTATE_CCW after counter-clockwise rotation", () => {
    const state = makeState({ currentPiece: makeTPiece({ x: 4, y: 0 }) });
    const result = gameReducer(state, { type: "ROTATE_CCW" });
    expect(result.lastAction).toBe("ROTATE_CCW");
  });
});

describe("RECEIVE_GARBAGE", () => {
  it("inserts N garbage rows at the bottom of the board", () => {
    const state = makeState();
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 2, gapColumn: 3 });
    expect(result.board[BOARD_HEIGHT - 1][0]).toBe("gray");
    expect(result.board[BOARD_HEIGHT - 1][3]).toBe(null);
    expect(result.board[BOARD_HEIGHT - 2][0]).toBe("gray");
    expect(result.board[BOARD_HEIGHT - 2][3]).toBe(null);
  });

  it("shifts existing rows up", () => {
    let state = makeState();
    const board = createBoard();
    board[BOARD_HEIGHT - 1][5] = "#ff0000";
    state = { ...state, board };
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 1, gapColumn: 0 });
    expect(result.board[BOARD_HEIGHT - 2][5]).toBe("#ff0000");
    expect(result.board[BOARD_HEIGHT - 1][0]).toBe(null);
    expect(result.board[BOARD_HEIGHT - 1][1]).toBe("gray");
  });

  it("triggers game over when pushed rows overflow the board", () => {
    let state = makeState();
    const board = createBoard();
    board[0][5] = "#ff0000";
    state = { ...state, board };
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 1, gapColumn: 0 });
    expect(result.isGameOver).toBe(true);
  });

  it("does not trigger game over when top rows are empty", () => {
    const state = makeState();
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 5, gapColumn: 0 });
    expect(result.isGameOver).toBe(false);
  });

  it("does nothing when lines is 0", () => {
    const state = makeState();
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 0, gapColumn: 0 });
    expect(result).toEqual(state);
  });

  it("does nothing when game is already over", () => {
    const state = makeState({ isGameOver: true });
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 2, gapColumn: 0 });
    expect(result).toEqual(state);
  });

  it("adjusts current piece position upward", () => {
    const piece = makeTPiece({ x: 4, y: 10 });
    const state = makeState({ currentPiece: piece });
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 3, gapColumn: 0 });
    expect(result.currentPiece!.position.y).toBe(7);
  });

  it("maintains board dimensions after garbage insertion", () => {
    const state = makeState();
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 4, gapColumn: 2 });
    expect(result.board.length).toBe(BOARD_HEIGHT);
    expect(result.board[0].length).toBe(BOARD_WIDTH);
  });
});
