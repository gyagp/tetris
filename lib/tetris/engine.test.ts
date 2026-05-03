import { describe, it, expect } from "vitest";
import { gameReducer, createInitialState } from "./engine";
import { GameState } from "./types";

function init(): GameState {
  return createInitialState();
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
