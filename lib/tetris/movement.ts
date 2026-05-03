import { Board, Piece } from "./types";
import { checkCollision } from "./board";

export type Direction = "left" | "right" | "down";

const DIRECTION_OFFSETS: Record<Direction, [number, number]> = {
  left: [-1, 0],
  right: [1, 0],
  down: [0, 1],
};

export function movePiece(
  board: Board,
  piece: Piece,
  direction: Direction
): Piece | null {
  const [dx, dy] = DIRECTION_OFFSETS[direction];
  if (checkCollision(board, piece, dx, dy)) return null;
  return {
    ...piece,
    position: { x: piece.position.x + dx, y: piece.position.y + dy },
  };
}

export function rotateCW(shape: number[][]): number[][] {
  const n = shape.length;
  return shape[0].map((_, col) =>
    shape.map((row) => row[col]).reverse()
  );
}

export function rotateCCW(shape: number[][]): number[][] {
  const n = shape.length;
  return shape[0].map((_, col) =>
    shape.map((row) => row[n - 1 - col])
  );
}

// SRS wall kick offsets: [rotation_state][test_index] = [dx, dy]
// For J, L, S, T, Z pieces (3x3)
const WALL_KICKS_JLSTZ: Record<string, [number, number][]> = {
  "0>1": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "1>0": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "1>2": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "2>1": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "2>3": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "3>2": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "3>0": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "0>3": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
};

// For I piece (4x4)
const WALL_KICKS_I: Record<string, [number, number][]> = {
  "0>1": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  "1>0": [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  "1>2": [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  "2>1": [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  "2>3": [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
  "3>2": [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
  "3>0": [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
  "0>3": [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
};

export function rotatePiece(
  board: Board,
  piece: Piece,
  clockwise: boolean = true
): Piece | null {
  if (piece.shape.length === 2) return null; // O piece doesn't rotate

  const rotatedShape = clockwise ? rotateCW(piece.shape) : rotateCCW(piece.shape);
  const fromState = piece.rotationState ?? 0;
  const toState = clockwise
    ? (fromState + 1) % 4
    : (fromState + 3) % 4;

  const key = `${fromState}>${toState}`;
  const kicks = piece.shape.length === 4 ? WALL_KICKS_I[key] : WALL_KICKS_JLSTZ[key];

  const testPiece: Piece = { ...piece, shape: rotatedShape };

  for (const [dx, dy] of kicks) {
    if (!checkCollision(board, testPiece, dx, -dy)) {
      return {
        ...piece,
        shape: rotatedShape,
        position: { x: piece.position.x + dx, y: piece.position.y - dy },
        rotationState: toState,
      };
    }
  }

  return null;
}

export function hardDrop(board: Board, piece: Piece): Piece {
  let dy = 0;
  while (!checkCollision(board, piece, 0, dy + 1)) {
    dy++;
  }
  return {
    ...piece,
    position: { x: piece.position.x, y: piece.position.y + dy },
  };
}
