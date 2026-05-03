"use client";

import React from "react";
import { BOARD_WIDTH, BOARD_HEIGHT } from "@/lib/tetris/constants";
import { hardDrop } from "@/lib/tetris/movement";
import type { Board as BoardType, Piece } from "@/lib/tetris/types";

const CELL_SIZE = 30;

interface BoardProps {
  board: BoardType;
  currentPiece: Piece | null;
}

function buildDisplayGrid(
  board: BoardType,
  currentPiece: Piece | null
): { color: string | null; ghost: boolean }[][] {
  const grid: { color: string | null; ghost: boolean }[][] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    const row: { color: string | null; ghost: boolean }[] = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
      row.push({ color: board[y][x], ghost: false });
    }
    grid.push(row);
  }

  if (!currentPiece) return grid;

  const ghostPiece = hardDrop(board, currentPiece);
  for (let sy = 0; sy < ghostPiece.shape.length; sy++) {
    for (let sx = 0; sx < ghostPiece.shape[sy].length; sx++) {
      if (!ghostPiece.shape[sy][sx]) continue;
      const gy = ghostPiece.position.y + sy;
      const gx = ghostPiece.position.x + sx;
      if (gy >= 0 && gy < BOARD_HEIGHT && gx >= 0 && gx < BOARD_WIDTH && !grid[gy][gx].color) {
        grid[gy][gx] = { color: ghostPiece.color, ghost: true };
      }
    }
  }

  for (let sy = 0; sy < currentPiece.shape.length; sy++) {
    for (let sx = 0; sx < currentPiece.shape[sy].length; sx++) {
      if (!currentPiece.shape[sy][sx]) continue;
      const cy = currentPiece.position.y + sy;
      const cx = currentPiece.position.x + sx;
      if (cy >= 0 && cy < BOARD_HEIGHT && cx >= 0 && cx < BOARD_WIDTH) {
        grid[cy][cx] = { color: currentPiece.color, ghost: false };
      }
    }
  }

  return grid;
}

export default function Board({ board, currentPiece }: BoardProps) {
  const grid = buildDisplayGrid(board, currentPiece);

  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
        border: "2px solid #555",
        backgroundColor: "#111",
      }}
    >
      {grid.flatMap((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${y}-${x}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: cell.color ?? "#1a1a1a",
              opacity: cell.ghost ? 0.3 : 1,
              border: "1px solid #333",
              boxSizing: "border-box",
            }}
          />
        ))
      )}
    </div>
  );
}
