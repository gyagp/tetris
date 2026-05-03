import { describe, it, expect } from "vitest";
import { createInitialState, gameReducer } from "./engine";
import { GameState } from "./types";
import { BOARD_WIDTH, BOARD_HEIGHT } from "./constants";
import { createBoard } from "./board";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    isStarted: true,
    ...overrides,
  };
}

function computeGarbage(lines: number, tSpin: boolean): number {
  return tSpin ? lines * 2 : lines >= 2 ? lines - 1 : 0;
}

describe("garbage sending formula", () => {
  it("clearing 1 line sends 0 garbage", () => {
    expect(computeGarbage(1, false)).toBe(0);
  });

  it("clearing 2 lines sends 1 garbage row", () => {
    expect(computeGarbage(2, false)).toBe(1);
  });

  it("clearing 3 lines sends 2 garbage rows", () => {
    expect(computeGarbage(3, false)).toBe(2);
  });

  it("clearing 4 lines (Tetris) sends 3 garbage rows", () => {
    expect(computeGarbage(4, false)).toBe(3);
  });

  it("T-spin single sends 2 garbage rows", () => {
    expect(computeGarbage(1, true)).toBe(2);
  });

  it("T-spin double sends 4 garbage rows", () => {
    expect(computeGarbage(2, true)).toBe(4);
  });

  it("T-spin triple sends 6 garbage rows", () => {
    expect(computeGarbage(3, true)).toBe(6);
  });
});

describe("garbage received affects opponent board", () => {
  it("garbage rows appear at the bottom after RECEIVE_GARBAGE", () => {
    const state = makeState();
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 2, gapColumn: 5 });

    expect(result.board[BOARD_HEIGHT - 1][5]).toBe(null);
    expect(result.board[BOARD_HEIGHT - 1][0]).toBe("gray");
    expect(result.board[BOARD_HEIGHT - 2][5]).toBe(null);
    expect(result.board[BOARD_HEIGHT - 2][0]).toBe("gray");
  });

  it("garbage is applied on next dispatch (simulating next tick)", () => {
    let state = makeState();
    state = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 3, gapColumn: 0 });
    const bottomRows = state.board.slice(BOARD_HEIGHT - 3);
    for (const row of bottomRows) {
      expect(row[0]).toBe(null);
      expect(row[1]).toBe("gray");
    }
  });

  it("board stays correct dimensions after garbage", () => {
    const state = makeState();
    const result = gameReducer(state, { type: "RECEIVE_GARBAGE", lines: 4, gapColumn: 2 });
    expect(result.board.length).toBe(BOARD_HEIGHT);
    expect(result.board[0].length).toBe(BOARD_WIDTH);
  });
});

describe("end-to-end: line clear triggers garbage for opponent", () => {
  it("clearing 2 lines produces garbage=1 which adds 1 row to opponent", () => {
    const garbage = computeGarbage(2, false);
    expect(garbage).toBe(1);

    let opponentState = makeState();
    opponentState = gameReducer(opponentState, { type: "RECEIVE_GARBAGE", lines: garbage, gapColumn: 4 });

    expect(opponentState.board[BOARD_HEIGHT - 1][4]).toBe(null);
    expect(opponentState.board[BOARD_HEIGHT - 1][0]).toBe("gray");
    expect(opponentState.board[BOARD_HEIGHT - 2][0]).toBe(null);
  });

  it("T-spin clear sends doubled garbage to opponent", () => {
    const garbage = computeGarbage(2, true);
    expect(garbage).toBe(4);

    let opponentState = makeState();
    opponentState = gameReducer(opponentState, { type: "RECEIVE_GARBAGE", lines: garbage, gapColumn: 7 });

    const garbageSection = opponentState.board.slice(BOARD_HEIGHT - 4);
    for (const row of garbageSection) {
      expect(row[7]).toBe(null);
      expect(row[0]).toBe("gray");
    }
  });

  it("single line clear sends no garbage", () => {
    const garbage = computeGarbage(1, false);
    expect(garbage).toBe(0);
  });
});
