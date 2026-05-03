import { Board, Piece } from "./types";
import { BOARD_WIDTH, BOARD_HEIGHT } from "./constants";

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
}

export function checkCollision(
  board: Board,
  piece: Piece,
  offsetX = 0,
  offsetY = 0
): boolean {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] === 0) continue;

      const newX = piece.position.x + col + offsetX;
      const newY = piece.position.y + row + offsetY;

      if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
      if (newY < 0) continue;
      if (board[newY][newX] !== null) return true;
    }
  }
  return false;
}

export function placePiece(board: Board, piece: Piece): Board {
  const newBoard = board.map((row) => [...row]);
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] === 0) continue;
      const x = piece.position.x + col;
      const y = piece.position.y + row;
      if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
        newBoard[y][x] = piece.color;
      }
    }
  }
  return newBoard;
}
