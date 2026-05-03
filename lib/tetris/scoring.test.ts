import { describe, it, expect } from "vitest";
import {
  clearLines,
  calculateScore,
  calculateLevel,
  getDropInterval,
  checkGameOver,
} from "./scoring";
import { createBoard } from "./board";
import { BOARD_WIDTH, BOARD_HEIGHT } from "./constants";
import { Board, Piece } from "./types";

function fillRow(board: Board, rowIndex: number): void {
  for (let col = 0; col < BOARD_WIDTH; col++) {
    board[rowIndex][col] = "#ff0000";
  }
}

describe("clearLines", () => {
  it("removes a single full row and shifts board down", () => {
    const board = createBoard();
    fillRow(board, BOARD_HEIGHT - 1);
    const result = clearLines(board);
    expect(result.linesCleared).toBe(1);
    expect(result.board[BOARD_HEIGHT - 1].every((c) => c === null)).toBe(true);
    expect(result.board.length).toBe(BOARD_HEIGHT);
  });

  it("removes multiple full rows", () => {
    const board = createBoard();
    fillRow(board, BOARD_HEIGHT - 1);
    fillRow(board, BOARD_HEIGHT - 2);
    fillRow(board, BOARD_HEIGHT - 3);
    const result = clearLines(board);
    expect(result.linesCleared).toBe(3);
    expect(result.board.length).toBe(BOARD_HEIGHT);
  });

  it("removes 4 full rows (Tetris)", () => {
    const board = createBoard();
    for (let i = 0; i < 4; i++) {
      fillRow(board, BOARD_HEIGHT - 1 - i);
    }
    const result = clearLines(board);
    expect(result.linesCleared).toBe(4);
  });

  it("preserves non-full rows and shifts them down", () => {
    const board = createBoard();
    board[BOARD_HEIGHT - 2][0] = "#00ff00";
    fillRow(board, BOARD_HEIGHT - 1);
    const result = clearLines(board);
    expect(result.linesCleared).toBe(1);
    expect(result.board[BOARD_HEIGHT - 1][0]).toBe("#00ff00");
  });

  it("does nothing when no rows are full", () => {
    const board = createBoard();
    board[BOARD_HEIGHT - 1][0] = "#ff0000";
    const result = clearLines(board);
    expect(result.linesCleared).toBe(0);
    expect(result.board[BOARD_HEIGHT - 1][0]).toBe("#ff0000");
  });

  it("new empty rows are added at the top", () => {
    const board = createBoard();
    fillRow(board, BOARD_HEIGHT - 1);
    const result = clearLines(board);
    expect(result.board[0].every((c) => c === null)).toBe(true);
  });
});

describe("calculateScore", () => {
  it("awards 100 for 1 line", () => {
    expect(calculateScore(1, 1)).toBe(100);
  });

  it("awards 300 for 2 lines", () => {
    expect(calculateScore(2, 1)).toBe(300);
  });

  it("awards 500 for 3 lines", () => {
    expect(calculateScore(3, 1)).toBe(500);
  });

  it("awards 800 for 4 lines (Tetris)", () => {
    expect(calculateScore(4, 1)).toBe(800);
  });

  it("awards 0 for 0 lines", () => {
    expect(calculateScore(0, 1)).toBe(0);
  });
});

describe("calculateLevel", () => {
  it("starts at level 1 with 0 lines", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("stays level 1 at 9 lines", () => {
    expect(calculateLevel(9)).toBe(1);
  });

  it("reaches level 2 at 10 lines", () => {
    expect(calculateLevel(10)).toBe(2);
  });

  it("reaches level 3 at 20 lines", () => {
    expect(calculateLevel(20)).toBe(3);
  });
});

describe("getDropInterval", () => {
  it("starts at 1000ms at level 1", () => {
    expect(getDropInterval(1)).toBe(1000);
  });

  it("decreases with higher levels", () => {
    expect(getDropInterval(2)).toBeLessThan(getDropInterval(1));
    expect(getDropInterval(5)).toBeLessThan(getDropInterval(2));
  });

  it("has a minimum floor (never goes to 0 or negative)", () => {
    expect(getDropInterval(100)).toBeGreaterThan(0);
  });
});

describe("checkGameOver", () => {
  it("returns false when piece fits on empty board", () => {
    const board = createBoard();
    const piece: Piece = {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "#f0f000",
      position: { x: 4, y: 0 },
    };
    expect(checkGameOver(board, piece)).toBe(false);
  });

  it("returns true when new piece collides immediately", () => {
    const board = createBoard();
    for (let col = 0; col < BOARD_WIDTH; col++) {
      board[0][col] = "#ff0000";
      board[1][col] = "#ff0000";
    }
    const piece: Piece = {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "#f0f000",
      position: { x: 4, y: 0 },
    };
    expect(checkGameOver(board, piece)).toBe(true);
  });
});
