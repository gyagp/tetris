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
  holdPiece: Piece | null;
  canHold: boolean;
  bag: string[];
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
  isStarted: boolean;
}
