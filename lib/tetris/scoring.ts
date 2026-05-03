import { Board, GameState, Piece } from "./types";
import { BOARD_WIDTH } from "./constants";
import { checkCollision } from "./board";

const LINE_SCORES = [0, 100, 300, 500, 800];

export function clearLines(board: Board): { board: Board; linesCleared: number } {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const linesCleared = board.length - remaining.length;
  const emptyRows = Array.from({ length: linesCleared }, () =>
    Array(BOARD_WIDTH).fill(null)
  );
  return { board: [...emptyRows, ...remaining], linesCleared };
}

export function calculateScore(linesCleared: number, level: number): number {
  return LINE_SCORES[linesCleared] ?? 0;
}

export function calculateLevel(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;
}

export function getDropInterval(level: number): number {
  return Math.max(100, 1000 - (level - 1) * 80);
}

export function checkGameOver(board: Board, piece: Piece): boolean {
  return checkCollision(board, piece);
}
