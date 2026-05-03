import { describe, it, expect } from "vitest";
import type { Board, Piece, GameState } from "../types";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES } from "../constants";

describe("constants", () => {
  it("BOARD_WIDTH is 10", () => {
    expect(BOARD_WIDTH).toBe(10);
  });

  it("BOARD_HEIGHT is 20", () => {
    expect(BOARD_HEIGHT).toBe(20);
  });

  it("defines all 7 tetrominoes", () => {
    const expected = ["I", "O", "T", "S", "Z", "J", "L"];
    expect(Object.keys(TETROMINOES).sort()).toEqual(expected.sort());
  });

  it("each tetromino has a shape (2D array) and color (string)", () => {
    for (const [name, def] of Object.entries(TETROMINOES)) {
      expect(Array.isArray(def.shape), `${name} shape is array`).toBe(true);
      expect(def.shape.length, `${name} shape has rows`).toBeGreaterThan(0);
      for (const row of def.shape) {
        expect(Array.isArray(row), `${name} row is array`).toBe(true);
      }
      expect(typeof def.color).toBe("string");
      expect(def.color.length).toBeGreaterThan(0);
    }
  });

  it("each tetromino shape contains at least one filled cell", () => {
    for (const [name, def] of Object.entries(TETROMINOES)) {
      const hasCell = def.shape.some((row) => row.some((c) => c === 1));
      expect(hasCell, `${name} has at least one filled cell`).toBe(true);
    }
  });
});

describe("types", () => {
  it("Board type works as 2D array of string|null", () => {
    const board: Board = Array.from({ length: BOARD_HEIGHT }, () =>
      Array(BOARD_WIDTH).fill(null)
    );
    expect(board.length).toBe(BOARD_HEIGHT);
    expect(board[0].length).toBe(BOARD_WIDTH);
    board[0][0] = "#ff0000";
    expect(board[0][0]).toBe("#ff0000");
  });

  it("Piece type has required fields", () => {
    const piece: Piece = {
      shape: [[1]],
      color: "#000",
      position: { x: 0, y: 0 },
    };
    expect(piece.shape).toBeDefined();
    expect(piece.color).toBeDefined();
    expect(piece.position).toBeDefined();
  });

  it("GameState type has all required fields", () => {
    const state: GameState = {
      board: [],
      currentPiece: null,
      nextPiece: null,
      score: 0,
      level: 1,
      lines: 0,
      isGameOver: false,
      isPaused: false,
    };
    expect(state.board).toBeDefined();
    expect(state.score).toBe(0);
    expect(state.isGameOver).toBe(false);
  });
});
