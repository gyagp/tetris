import { describe, it, expect } from "vitest";
import { findFullRows, clearLines, calculateScore } from "./scoring";
import { BOARD_WIDTH } from "./constants";

const emptyRow = () => Array(BOARD_WIDTH).fill(null);
const fullRow = () => Array(BOARD_WIDTH).fill("cyan");

describe("scoring", () => {
  describe("findFullRows", () => {
    it("returns no rows for an empty board", () => {
      const board = Array.from({ length: 20 }, emptyRow);
      expect(findFullRows(board)).toEqual([]);
    });

    it("detects a single full row", () => {
      const board = Array.from({ length: 20 }, emptyRow);
      board[19] = fullRow();
      expect(findFullRows(board)).toEqual([19]);
    });

    it("detects 4 full rows (Tetris)", () => {
      const board = Array.from({ length: 20 }, emptyRow);
      board[16] = fullRow();
      board[17] = fullRow();
      board[18] = fullRow();
      board[19] = fullRow();
      expect(findFullRows(board)).toEqual([16, 17, 18, 19]);
      expect(findFullRows(board).length).toBe(4);
    });
  });

  describe("clearLines", () => {
    it("clears 4 lines and adds empty rows at top", () => {
      const board = Array.from({ length: 20 }, emptyRow);
      board[16] = fullRow();
      board[17] = fullRow();
      board[18] = fullRow();
      board[19] = fullRow();
      const result = clearLines(board);
      expect(result.linesCleared).toBe(4);
      expect(result.board.length).toBe(20);
      expect(result.board[0].every((c: string | null) => c === null)).toBe(true);
      expect(result.board[3].every((c: string | null) => c === null)).toBe(true);
    });
  });

  describe("calculateScore", () => {
    it("awards 800 points for a Tetris (4-line clear)", () => {
      expect(calculateScore(4, 1)).toBe(800);
    });

    it("awards less for fewer lines", () => {
      expect(calculateScore(1, 1)).toBe(100);
      expect(calculateScore(2, 1)).toBe(300);
      expect(calculateScore(3, 1)).toBe(500);
    });

    it("Tetris score (800) is more than triple (500)", () => {
      expect(calculateScore(4, 1)).toBeGreaterThan(calculateScore(3, 1));
    });
  });
});
