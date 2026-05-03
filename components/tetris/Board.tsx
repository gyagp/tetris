"use client";

import React from "react";
import { BOARD_WIDTH, BOARD_HEIGHT, PIECE_STYLES } from "@/lib/tetris/constants";
import { hardDrop } from "@/lib/tetris/movement";
import type { Board as BoardType, Piece } from "@/lib/tetris/types";

const CELL_SIZE = 30;

interface BoardProps {
  board: BoardType;
  currentPiece: Piece | null;
  clearingRows: number[];
  lockingCells: { x: number; y: number }[];
  hardDropTrail: { x: number; y: number; color: string }[];
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

export default function Board({ board, currentPiece, clearingRows, lockingCells, hardDropTrail }: BoardProps) {
  const grid = buildDisplayGrid(board, currentPiece);
  const clearingSet = new Set(clearingRows);
  const lockingSet = new Set(lockingCells.map(c => `${c.y}-${c.x}`));
  const trailMap = new Map<string, string>();
  for (const t of hardDropTrail) {
    trailMap.set(`${t.y}-${t.x}`, t.color);
  }

  return (
    <div
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
        border: "3px solid #444",
        borderRadius: 4,
        backgroundColor: "#0a0a0a",
        boxShadow: "0 0 20px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5)",
      }}
    >
      <style>{`
        @keyframes line-clear-flash {
          0% { background: #fff; opacity: 1; }
          30% { background: #fff; opacity: 1; }
          60% { background: #fff; opacity: 0.5; }
          100% { background: transparent; opacity: 0; }
        }
        @keyframes lock-pulse {
          0% { box-shadow: inset 0 0 8px rgba(255,255,255,0.9), 0 0 12px rgba(255,255,255,0.6); }
          100% { box-shadow: none; }
        }
        @keyframes drop-trail {
          0% { opacity: 0.5; }
          100% { opacity: 0; }
        }
      `}</style>
      {grid.flatMap((row, y) =>
        row.map((cell, x) => {
          const key = `${y}-${x}`;
          const isClearing = clearingSet.has(y);
          const isLocking = lockingSet.has(key);
          const trailColor = trailMap.get(key);
          const style = cell.color ? PIECE_STYLES[cell.color] : null;

          let background: string;
          if (isClearing) background = "#fff";
          else if (trailColor && !cell.color) {
            const ts = PIECE_STYLES[trailColor];
            background = ts ? ts.gradient : trailColor;
          } else if (cell.ghost) background = cell.color ?? "#1a1a1a";
          else if (style) background = style.gradient;
          else background = "#1a1a1a";

          let animation = "none";
          if (isClearing) animation = "line-clear-flash 400ms ease-out forwards";
          else if (isLocking) animation = "lock-pulse 300ms ease-out forwards";
          else if (trailColor && !cell.color) animation = "drop-trail 200ms ease-out forwards";

          return (
            <div
              key={key}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                background,
                opacity: cell.ghost ? 0.3 : 1,
                border: cell.color && !cell.ghost
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid #222",
                boxSizing: "border-box",
                boxShadow: isClearing
                  ? "0 0 15px rgba(255,255,255,0.8)"
                  : cell.color && !cell.ghost ? style?.glow : "none",
                borderRadius: cell.color && !cell.ghost ? 2 : 0,
                animation,
              }}
            />
          );
        })
      )}
    </div>
  );
}
