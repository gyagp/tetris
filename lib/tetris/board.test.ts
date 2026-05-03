import { describe, it, expect } from "vitest";
import { createBoard, checkCollision, placePiece } from "./board";
import { Piece } from "./types";
import { BOARD_WIDTH, BOARD_HEIGHT } from "./constants";

describe("createBoard", () => {
  it("returns a 10x20 grid", () => {
    const board = createBoard();
    expect(board.length).toBe(BOARD_HEIGHT);
    expect(board[0].length).toBe(BOARD_WIDTH);
  });

  it("all cells are null", () => {
    const board = createBoard();
    for (const row of board) {
      for (const cell of row) {
        expect(cell).toBeNull();
      }
    }
  });
});

describe("checkCollision", () => {
  const piece: Piece = {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
    position: { x: 0, y: 0 },
  };

  it("no collision in empty board", () => {
    const board = createBoard();
    expect(checkCollision(board, { ...piece, position: { x: 4, y: 0 } })).toBe(false);
  });

  it("detects left wall collision", () => {
    const board = createBoard();
    expect(checkCollision(board, { ...piece, position: { x: -1, y: 0 } })).toBe(true);
  });

  it("detects right wall collision", () => {
    const board = createBoard();
    expect(checkCollision(board, { ...piece, position: { x: BOARD_WIDTH - 1, y: 0 } })).toBe(true);
  });

  it("detects floor collision", () => {
    const board = createBoard();
    expect(checkCollision(board, { ...piece, position: { x: 0, y: BOARD_HEIGHT - 1 } })).toBe(true);
  });

  it("detects collision with placed pieces", () => {
    const board = createBoard();
    board[5][4] = "#ff0000";
    const testPiece: Piece = { ...piece, position: { x: 4, y: 5 } };
    expect(checkCollision(board, testPiece)).toBe(true);
  });

  it("detects collision with offset", () => {
    const board = createBoard();
    expect(checkCollision(board, { ...piece, position: { x: 0, y: BOARD_HEIGHT - 2 } }, 0, 1)).toBe(true);
  });

  it("no collision when piece is above board (negative y)", () => {
    const board = createBoard();
    expect(checkCollision(board, { ...piece, position: { x: 4, y: -1 } })).toBe(false);
  });
});

describe("placePiece", () => {
  it("merges piece into board", () => {
    const board = createBoard();
    const piece: Piece = {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "#f0f000",
      position: { x: 3, y: 0 },
    };
    const newBoard = placePiece(board, piece);
    expect(newBoard[0][3]).toBe("#f0f000");
    expect(newBoard[0][4]).toBe("#f0f000");
    expect(newBoard[1][3]).toBe("#f0f000");
    expect(newBoard[1][4]).toBe("#f0f000");
  });

  it("does not mutate original board", () => {
    const board = createBoard();
    const piece: Piece = {
      shape: [[1]],
      color: "#ff0000",
      position: { x: 0, y: 0 },
    };
    placePiece(board, piece);
    expect(board[0][0]).toBeNull();
  });

  it("skips zero cells in shape", () => {
    const board = createBoard();
    const piece: Piece = {
      shape: [
        [0, 1],
        [1, 0],
      ],
      color: "#00ff00",
      position: { x: 0, y: 0 },
    };
    const newBoard = placePiece(board, piece);
    expect(newBoard[0][0]).toBeNull();
    expect(newBoard[0][1]).toBe("#00ff00");
    expect(newBoard[1][0]).toBe("#00ff00");
    expect(newBoard[1][1]).toBeNull();
  });
});
