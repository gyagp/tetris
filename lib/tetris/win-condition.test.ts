import { describe, it, expect } from "vitest";
import { createInitialState, gameReducer } from "./engine";

describe("Win condition — FORCE_GAME_OVER action", () => {
  it("sets isGameOver to true on an active game", () => {
    const state = { ...createInitialState(), isStarted: true };
    const result = gameReducer(state, { type: "FORCE_GAME_OVER" });
    expect(result.isGameOver).toBe(true);
  });

  it("preserves the rest of the game state", () => {
    const state = { ...createInitialState(), isStarted: true, score: 500, lines: 10 };
    const result = gameReducer(state, { type: "FORCE_GAME_OVER" });
    expect(result.score).toBe(500);
    expect(result.lines).toBe(10);
    expect(result.isStarted).toBe(true);
  });

  it("is idempotent — forcing game over on an already-over game stays over", () => {
    const state = { ...createInitialState(), isStarted: true, isGameOver: true };
    const result = gameReducer(state, { type: "FORCE_GAME_OVER" });
    expect(result.isGameOver).toBe(true);
  });
});
