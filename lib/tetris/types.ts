export type Cell = string | null;
export type Board = Cell[][];

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  shape: number[][];
  color: string;
  position: Position;
  rotationState?: number;
}

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  nextPiece: Piece | null;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
}
