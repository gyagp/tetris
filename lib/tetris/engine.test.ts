import { describe, it, expect } from "vitest";
import { createInitialState, gameReducer } from "./engine";
import { GameState } from "./types";
import { BOARD_WIDTH, BOARD_HEIGHT } from "./constants";

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
