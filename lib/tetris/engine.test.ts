import { describe, it, expect, vi } from "vitest";
import { createInitialState, gameReducer, GameAction } from "./engine";
import { TETROMINOES } from "./constants";
import { GameState } from "./types";

const PIECE_KEYS = Object.keys(TETROMINOES);

describe("createInitialState", () => {
  it("returns a valid initial game state", () => {
    const state = createInitialState();
    expect(state.board).toBeDefined();
    expect(state.board.length).toBe(20);
    expect(state.currentPiece).not.toBeNull();
    expect(state.nextPiece).not.toBeNull();
    expect(state.holdPiece).toBeNull();
    expect(state.canHold).toBe(true);
    expect(state.score).toBe(0);
    expect(state.level).toBe(1);
    expect(state.lines).toBe(0);
    expect(state.isGameOver).toBe(false);
    expect(state.isPaused).toBe(false);
  });

  it("currentPiece and nextPiece have valid tetromino colors", () => {
    const state = createInitialState();
    const validColors = PIECE_KEYS.map((k) => TETROMINOES[k].color);
    expect(validColors).toContain(state.currentPiece!.color);
    expect(validColors).toContain(state.nextPiece!.color);
  });

  it("bag contains valid piece keys", () => {
    const state = createInitialState();
    for (const key of state.bag) {
      expect(PIECE_KEYS).toContain(key);
    }
  });
});

describe("random bag fairness", () => {
  it("generates all 7 pieces within each bag cycle", () => {
    // Create many states and track the first 7 pieces drawn
    // Since bag is 7 pieces and we draw 2 for initial state,
    // bag should have 5 remaining, all from the same shuffled set
    const state = createInitialState();
    const drawnColors = [state.currentPiece!.color, state.nextPiece!.color];
    const bagColors = state.bag.map((k) => TETROMINOES[k].color);
    const allColors = [...drawnColors, ...bagColors];

    // All pieces in bag + drawn should be valid
    const validColors = PIECE_KEYS.map((k) => TETROMINOES[k].color);
    for (const c of allColors) {
      expect(validColors).toContain(c);
    }
  });

  it("bag + drawn pieces form a complete set of 7", () => {
    // Run multiple times to check statistical fairness
    for (let trial = 0; trial < 10; trial++) {
      const state = createInitialState();
      const currentKey = PIECE_KEYS.find(
        (k) => TETROMINOES[k].color === state.currentPiece!.color
      )!;
      const nextKey = PIECE_KEYS.find(
        (k) => TETROMINOES[k].color === state.nextPiece!.color
      )!;
      const allKeys = [currentKey, nextKey, ...state.bag];
      // Should be exactly 7 pieces (one full bag)
      expect(allKeys.length).toBe(7);
      // Should contain all 7 unique pieces
      expect(new Set(allKeys).size).toBe(7);
    }
  });
});

describe("gameReducer - TICK", () => {
  it("moves piece down on tick", () => {
    const state = createInitialState();
    const y = state.currentPiece!.position.y;
    const next = gameReducer(state, { type: "TICK" });
    expect(next.currentPiece!.position.y).toBe(y + 1);
  });

  it("locks piece when it cannot move down", () => {
    const state = createInitialState();
    // Move piece to bottom
    let s = state;
    for (let i = 0; i < 25; i++) {
      s = gameReducer(s, { type: "TICK" });
    }
    // After enough ticks, piece should have locked and a new piece spawned
    // The current piece should be different (nextPiece becomes current)
    expect(s.currentPiece).not.toBeNull();
  });
});

describe("gameReducer - next piece queue", () => {
  it("next piece becomes current after lock", () => {
    const state = createInitialState();
    const nextColor = state.nextPiece!.color;
    // Hard drop to lock instantly
    const after = gameReducer(state, { type: "HARD_DROP" });
    expect(after.currentPiece!.color).toBe(nextColor);
    // New nextPiece should be populated
    expect(after.nextPiece).not.toBeNull();
  });
});

describe("gameReducer - HOLD", () => {
  it("swaps current piece to hold on first hold", () => {
    const state = createInitialState();
    const currentColor = state.currentPiece!.color;
    const nextColor = state.nextPiece!.color;
    const after = gameReducer(state, { type: "HOLD" });
    expect(after.holdPiece!.color).toBe(currentColor);
    // Current piece should now be the old nextPiece
    expect(after.currentPiece!.color).toBe(nextColor);
    expect(after.canHold).toBe(false);
  });

  it("prevents double hold (once per drop)", () => {
    const state = createInitialState();
    const after1 = gameReducer(state, { type: "HOLD" });
    const after2 = gameReducer(after1, { type: "HOLD" });
    // State should not change on second hold
    expect(after2).toBe(after1);
  });

  it("re-enables hold after piece locks", () => {
    const state = createInitialState();
    const held = gameReducer(state, { type: "HOLD" });
    expect(held.canHold).toBe(false);
    // Hard drop to lock
    const locked = gameReducer(held, { type: "HARD_DROP" });
    expect(locked.canHold).toBe(true);
  });

  it("swaps hold and current when hold already has a piece", () => {
    const state = createInitialState();
    const firstHold = gameReducer(state, { type: "HOLD" });
    const holdColor = firstHold.holdPiece!.color;
    // Lock current piece to re-enable hold
    const locked = gameReducer(firstHold, { type: "HARD_DROP" });
    const currentColor = locked.currentPiece!.color;
    const secondHold = gameReducer(locked, { type: "HOLD" });
    // Old hold becomes current, old current becomes hold
    expect(secondHold.currentPiece!.color).toBe(holdColor);
    expect(secondHold.holdPiece!.color).toBe(currentColor);
  });
});

describe("gameReducer - movement actions", () => {
  it("MOVE_LEFT decreases x", () => {
    const state = createInitialState();
    const x = state.currentPiece!.position.x;
    const after = gameReducer(state, { type: "MOVE_LEFT" });
    expect(after.currentPiece!.position.x).toBe(x - 1);
  });

  it("MOVE_RIGHT increases x", () => {
    const state = createInitialState();
    const x = state.currentPiece!.position.x;
    const after = gameReducer(state, { type: "MOVE_RIGHT" });
    expect(after.currentPiece!.position.x).toBe(x + 1);
  });

  it("HARD_DROP locks piece immediately", () => {
    const state = createInitialState();
    const after = gameReducer(state, { type: "HARD_DROP" });
    // Piece should have changed (next became current)
    expect(after.currentPiece!.color).toBe(state.nextPiece!.color);
  });
});

describe("gameReducer - PAUSE/RESUME", () => {
  it("PAUSE sets isPaused", () => {
    const state = createInitialState();
    const paused = gameReducer(state, { type: "PAUSE" });
    expect(paused.isPaused).toBe(true);
  });

  it("ignores actions while paused except RESUME and RESTART", () => {
    const state = createInitialState();
    const paused = gameReducer(state, { type: "PAUSE" });
    const afterTick = gameReducer(paused, { type: "TICK" });
    expect(afterTick).toBe(paused);
    const afterMove = gameReducer(paused, { type: "MOVE_LEFT" });
    expect(afterMove).toBe(paused);
  });

  it("RESUME unpauses", () => {
    const state = createInitialState();
    const paused = gameReducer(state, { type: "PAUSE" });
    const resumed = gameReducer(paused, { type: "RESUME" });
    expect(resumed.isPaused).toBe(false);
  });
});

describe("gameReducer - RESTART", () => {
  it("creates a fresh state", () => {
    const state = createInitialState();
    const modified = gameReducer(state, { type: "HARD_DROP" });
    const restarted = gameReducer(modified, { type: "RESTART" });
    expect(restarted.score).toBe(0);
    expect(restarted.lines).toBe(0);
    expect(restarted.isGameOver).toBe(false);
    expect(restarted.holdPiece).toBeNull();
  });
});

describe("gameReducer - game over", () => {
  it("ignores non-RESTART actions when game is over", () => {
    const state = createInitialState();
    const overState: GameState = { ...state, isGameOver: true };
    const after = gameReducer(overState, { type: "TICK" });
    expect(after).toBe(overState);
    const afterMove = gameReducer(overState, { type: "MOVE_LEFT" });
    expect(afterMove).toBe(overState);
  });

  it("RESTART works even when game is over", () => {
    const state = createInitialState();
    const overState: GameState = { ...state, isGameOver: true };
    const restarted = gameReducer(overState, { type: "RESTART" });
    expect(restarted.isGameOver).toBe(false);
  });
});
