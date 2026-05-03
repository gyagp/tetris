import { describe, it, expect } from "vitest";
import { createBoard } from "./board";
import { movePiece, rotatePiece, hardDrop, rotateCW, rotateCCW } from "./movement";
import { Board, Piece } from "./types";
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOES } from "./constants";

function makePiece(type: string, x: number, y: number, rotationState = 0): Piece {
  return {
    shape: TETROMINOES[type].shape.map((r) => [...r]),
    color: TETROMINOES[type].color,
    position: { x, y },
    rotationState,
  };
}

describe("movePiece", () => {
  it("moves left on empty board", () => {
    const board = createBoard();
    const piece = makePiece("T", 5, 0);
    const result = movePiece(board, piece, "left");
    expect(result).not.toBeNull();
    expect(result!.position.x).toBe(4);
    expect(result!.position.y).toBe(0);
  });

  it("moves right on empty board", () => {
    const board = createBoard();
    const piece = makePiece("T", 5, 0);
    const result = movePiece(board, piece, "right");
    expect(result).not.toBeNull();
    expect(result!.position.x).toBe(6);
  });

  it("moves down (soft drop)", () => {
    const board = createBoard();
    const piece = makePiece("T", 5, 0);
    const result = movePiece(board, piece, "down");
    expect(result).not.toBeNull();
    expect(result!.position.y).toBe(1);
  });

  it("returns null when moving left into wall", () => {
    const board = createBoard();
    const piece = makePiece("T", 0, 5);
    // T shape has col 0 filled in row 1, so x=0 means col0 is at x=0
    // Moving left would put col0 at x=-1 => collision
    const result = movePiece(board, piece, "left");
    expect(result).toBeNull();
  });

  it("returns null when moving right into wall", () => {
    const board = createBoard();
    // T shape is 3 wide, rightmost filled col is 2, so x + 2 = 9 => x = 7
    const piece = makePiece("T", BOARD_WIDTH - 3, 5);
    const result = movePiece(board, piece, "right");
    expect(result).toBeNull();
  });

  it("returns null when moving down at floor", () => {
    const board = createBoard();
    // T has filled cells in rows 0 and 1, so y + 1 = 19 => y = 18
    const piece = makePiece("T", 3, BOARD_HEIGHT - 2);
    const result = movePiece(board, piece, "down");
    expect(result).toBeNull();
  });

  it("returns null when moving into placed piece", () => {
    const board = createBoard();
    board[5][4] = "#fff";
    // T at x=3: filled cells at cols 0,1,2 in row 1 => board positions x=3,4,5
    // Moving down to y=4 puts row1 at board row 5, col 1 at x=4 => collision
    const piece = makePiece("T", 3, 4);
    const result = movePiece(board, piece, "down");
    expect(result).toBeNull();
  });
});

describe("rotateCW / rotateCCW", () => {
  it("rotates T piece CW correctly", () => {
    const t = TETROMINOES["T"].shape;
    const rotated = rotateCW(t);
    expect(rotated).toEqual([
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ]);
  });

  it("rotateCCW is inverse of rotateCW", () => {
    const t = TETROMINOES["T"].shape;
    const result = rotateCCW(rotateCW(t));
    expect(result).toEqual(t);
  });

  it("four CW rotations return to original", () => {
    const t = TETROMINOES["T"].shape;
    let s = t;
    for (let i = 0; i < 4; i++) s = rotateCW(s);
    expect(s).toEqual(t);
  });
});

describe("rotatePiece", () => {
  it("rotates T piece on empty board", () => {
    const board = createBoard();
    const piece = makePiece("T", 4, 5);
    const result = rotatePiece(board, piece, true);
    expect(result).not.toBeNull();
    expect(result!.rotationState).toBe(1);
    expect(result!.shape).toEqual(rotateCW(piece.shape));
  });

  it("rotates CCW", () => {
    const board = createBoard();
    const piece = makePiece("T", 4, 5);
    const result = rotatePiece(board, piece, false);
    expect(result).not.toBeNull();
    expect(result!.rotationState).toBe(3);
  });

  it("O piece cannot rotate", () => {
    const board = createBoard();
    const piece = makePiece("O", 4, 5);
    expect(rotatePiece(board, piece, true)).toBeNull();
    expect(rotatePiece(board, piece, false)).toBeNull();
  });

  it("wall kicks when against left wall", () => {
    const board = createBoard();
    // T at x=-1 would have col0 at -1, but rotationState 0>1 first kick is (0,0),
    // second is (-1,0). Let's put T at x=0 and block the basic rotation.
    // Actually, just test that rotation near wall succeeds via wall kick.
    const piece = makePiece("T", 0, 5);
    // Rotating CW from state 0: rotated T needs cols 0,1 filled.
    // At x=0 the basic rotation should work since the rotated shape fits.
    // Let's test wall kick with I piece at wall instead.
    const iPiece = makePiece("I", -1, 5);
    const result = rotatePiece(board, iPiece, true);
    // Should succeed via wall kick
    expect(result).not.toBeNull();
  });

  it("returns null when no kick succeeds", () => {
    const board = createBoard();
    // Fill a narrow corridor so no rotation can fit
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      board[y][0] = "#fff";
      board[y][2] = "#fff";
    }
    // T piece in column 1, squeezed between walls
    const piece: Piece = {
      shape: [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
      color: "#a000f0",
      position: { x: 0, y: 5 },
      rotationState: 1,
    };
    // Rotating this vertical bar-like shape CW should produce a horizontal shape
    // that won't fit in the 1-wide corridor
    // Fill everything except one column so no 3-wide rotation can fit anywhere
    const board2 = createBoard();
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (x !== 4) board2[y][x] = "#fff";
      }
    }
    // T piece in the single free column; rotated shape needs 2+ cols, no kick can help
    const tPiece: Piece = {
      shape: [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      color: "#a000f0",
      position: { x: 3, y: 5 },
      rotationState: 1,
    };
    const result = rotatePiece(board2, tPiece, true);
    expect(result).toBeNull();
  });

  it("I piece rotates with wall kicks", () => {
    const board = createBoard();
    const piece = makePiece("I", 4, 5);
    const result = rotatePiece(board, piece, true);
    expect(result).not.toBeNull();
    expect(result!.rotationState).toBe(1);
  });
});

describe("hardDrop", () => {
  it("drops piece to floor on empty board", () => {
    const board = createBoard();
    const piece = makePiece("T", 4, 0);
    const result = hardDrop(board, piece);
    // T shape row 1 has the bottom filled cells, so y + 1 = 19 => y = 18
    expect(result.position.y).toBe(BOARD_HEIGHT - 2);
    expect(result.position.x).toBe(4);
  });

  it("drops piece onto placed blocks", () => {
    const board = createBoard();
    // Place a block at row 10
    for (let x = 0; x < BOARD_WIDTH; x++) {
      board[10][x] = "#fff";
    }
    const piece = makePiece("T", 4, 0);
    const result = hardDrop(board, piece);
    // T row 1 (bottom filled row) should land at row 9 => y + 1 = 9 => y = 8
    expect(result.position.y).toBe(8);
  });

  it("piece already at lowest position stays", () => {
    const board = createBoard();
    const piece = makePiece("T", 4, BOARD_HEIGHT - 2);
    const result = hardDrop(board, piece);
    expect(result.position.y).toBe(BOARD_HEIGHT - 2);
  });
});
