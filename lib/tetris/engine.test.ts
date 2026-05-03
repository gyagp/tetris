import { describe, it, expect } from "vitest";
import { gameReducer, createInitialState } from "./engine";
import { GameState } from "./types";
import { BOARD_HEIGHT, BOARD_WIDTH } from "./constants";

function init(): GameState {
  return createInitialState();
}

function fullRow(): (string | null)[] {
  return Array(BOARD_WIDTH).fill("#fff");
}

function emptyRow(): (string | null)[] {
  return Array(BOARD_WIDTH).fill(null);
}

describe("game start/pause/restart flow", () => {
  describe("start screen", () => {
    it("initial state has isStarted=false", () => {
      const s = init();
      expect(s.isStarted).toBe(false);
    });

    it("ignores game actions before START", () => {
      const s = init();
      const after = gameReducer(s, { type: "MOVE_LEFT" });
      expect(after).toBe(s);
    });

    it("START sets isStarted=true", () => {
      const s = init();
      const after = gameReducer(s, { type: "START" });
      expect(after.isStarted).toBe(true);
    });

    it("START is idempotent once started", () => {
      let s = init();
      s = gameReducer(s, { type: "START" });
      const after = gameReducer(s, { type: "START" });
      expect(after).toBe(s);
    });
  });

  describe("pause/resume", () => {
    it("PAUSE sets isPaused=true", () => {
      let s = init();
      s = gameReducer(s, { type: "START" });
      s = gameReducer(s, { type: "PAUSE" });
      expect(s.isPaused).toBe(true);
    });

    it("RESUME sets isPaused=false", () => {
      let s = init();
      s = gameReducer(s, { type: "START" });
      s = gameReducer(s, { type: "PAUSE" });
      s = gameReducer(s, { type: "RESUME" });
      expect(s.isPaused).toBe(false);
    });

    it("ignores game actions while paused", () => {
      let s = init();
      s = gameReducer(s, { type: "START" });
      s = gameReducer(s, { type: "PAUSE" });
      const after = gameReducer(s, { type: "MOVE_LEFT" });
      expect(after).toBe(s);
    });
  });

  describe("game over and restart", () => {
    it("ignores non-RESTART actions when game over", () => {
      let s = init();
      s = gameReducer(s, { type: "START" });
      const gameOverState: GameState = { ...s, isGameOver: true };
      const after = gameReducer(gameOverState, { type: "MOVE_LEFT" });
      expect(after).toBe(gameOverState);
    });

    it("RESTART resets state and sets isStarted=true", () => {
      let s = init();
      s = gameReducer(s, { type: "START" });
      const gameOverState: GameState = { ...s, isGameOver: true, score: 500 };
      const after = gameReducer(gameOverState, { type: "RESTART" });
      expect(after.isStarted).toBe(true);
      expect(after.isGameOver).toBe(false);
      expect(after.score).toBe(0);
      expect(after.lines).toBe(0);
      expect(after.level).toBe(1);
    });

    it("RESTART works while paused", () => {
      let s = init();
      s = gameReducer(s, { type: "START" });
      s = gameReducer(s, { type: "PAUSE" });
      const after = gameReducer(s, { type: "RESTART" });
      expect(after.isStarted).toBe(true);
      expect(after.isPaused).toBe(false);
    });
  });
});

describe("Line clear animation", () => {
  it("clearingRows is initialized to empty array", () => {
    expect(init().clearingRows).toEqual([]);
  });

  it("blocks all input except FINISH_CLEAR while clearingRows is active", () => {
    let s = init();
    s = gameReducer(s, { type: "START" });
    const clearing: GameState = {
      ...s,
      clearingRows: [18, 19],
      currentPiece: null,
    };

    for (const type of ["TICK", "MOVE_LEFT", "MOVE_RIGHT", "ROTATE_CW", "SOFT_DROP", "HARD_DROP", "HOLD"] as const) {
      expect(gameReducer(clearing, { type })).toBe(clearing);
    }
  });

  it("FINISH_CLEAR removes full rows, updates score, and spawns next piece", () => {
    let s = init();
    s = gameReducer(s, { type: "START" });
    const board = Array.from({ length: BOARD_HEIGHT }, (_, i) =>
      i >= BOARD_HEIGHT - 1 ? fullRow() : emptyRow()
    );
    const clearing: GameState = {
      ...s,
      board,
      clearingRows: [BOARD_HEIGHT - 1],
      currentPiece: null,
      score: 0,
      lines: 0,
      level: 1,
    };

    const result = gameReducer(clearing, { type: "FINISH_CLEAR" });

    expect(result.clearingRows).toEqual([]);
    expect(result.lines).toBe(1);
    expect(result.score).toBeGreaterThan(0);
    expect(result.currentPiece).not.toBeNull();
    expect(result.board.filter((r) => r.every((c) => c !== null))).toHaveLength(0);
  });

  it("FINISH_CLEAR is a no-op when clearingRows is empty", () => {
    let s = init();
    s = gameReducer(s, { type: "START" });
    const result = gameReducer(s, { type: "FINISH_CLEAR" });
    expect(result).toBe(s);
  });

  it("rows shift down after clear (board height preserved)", () => {
    let s = init();
    s = gameReducer(s, { type: "START" });
    const board = Array.from({ length: BOARD_HEIGHT }, (_, i) =>
      i >= BOARD_HEIGHT - 2 ? fullRow() : emptyRow()
    );
    const clearing: GameState = {
      ...s,
      board,
      clearingRows: [BOARD_HEIGHT - 2, BOARD_HEIGHT - 1],
      currentPiece: null,
    };

    const result = gameReducer(clearing, { type: "FINISH_CLEAR" });
    expect(result.board.length).toBe(BOARD_HEIGHT);
    expect(result.lines).toBe(2);
  });
});
