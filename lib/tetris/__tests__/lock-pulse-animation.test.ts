import { describe, it, expect } from "vitest";
import { gameReducer, createInitialState } from "../engine";
import { GameState } from "../types";

describe("lock-pulse animation on piece placement", () => {
  function dropToLock(state: GameState): GameState {
    let s = state;
    for (let i = 0; i < 25; i++) {
      const next = gameReducer(s, { type: "TICK" });
      if (next.lockingCells.length > 0) return next;
      s = next;
    }
    return s;
  }

  it("lockingCells is populated when a piece locks", () => {
    const state = createInitialState();
    const started = gameReducer(state, { type: "START" });
    const result = dropToLock(started);
    expect(result.lockingCells.length).toBeGreaterThan(0);
  });

  it("lockingCells contains valid board coordinates", () => {
    const state = createInitialState();
    const started = gameReducer(state, { type: "START" });
    const result = dropToLock(started);
    for (const cell of result.lockingCells) {
      expect(cell.x).toBeGreaterThanOrEqual(0);
      expect(cell.x).toBeLessThan(10);
      expect(cell.y).toBeGreaterThanOrEqual(0);
      expect(cell.y).toBeLessThan(20);
    }
  });

  it("lockingCells is cleared on subsequent move", () => {
    const state = createInitialState();
    const started = gameReducer(state, { type: "START" });
    const locked = dropToLock(started);
    expect(locked.lockingCells.length).toBeGreaterThan(0);
    if (locked.currentPiece) {
      const moved = gameReducer(locked, { type: "MOVE_LEFT" });
      expect(moved.lockingCells.length).toBe(0);
    }
  });
});
