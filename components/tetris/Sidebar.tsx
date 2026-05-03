"use client";

import React from "react";
import type { Piece } from "@/lib/tetris/types";

const MINI_CELL = 20;

function PiecePreview({ piece, label }: { piece: Piece | null; label: string }) {
  const rows = piece ? piece.shape.length : 2;
  const cols = piece ? piece.shape[0].length : 4;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#aaa", fontSize: 12, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
        {label}
      </div>
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${cols}, ${MINI_CELL}px)`,
          gridTemplateRows: `repeat(${rows}, ${MINI_CELL}px)`,
          backgroundColor: "#111",
          border: "1px solid #555",
          padding: 4,
        }}
      >
        {Array.from({ length: rows }, (_, y) =>
          Array.from({ length: cols }, (_, x) => {
            const filled = piece?.shape[y][x];
            return (
              <div
                key={`${y}-${x}`}
                style={{
                  width: MINI_CELL,
                  height: MINI_CELL,
                  backgroundColor: filled ? piece!.color : "#1a1a1a",
                  border: "1px solid #333",
                  boxSizing: "border-box",
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  nextPiece: Piece | null;
  holdPiece: Piece | null;
  score: number;
  level: number;
  lines: number;
}

export default function Sidebar({ nextPiece, holdPiece, score, level, lines }: SidebarProps) {
  return (
    <div style={{ marginLeft: 20, minWidth: 120 }}>
      <PiecePreview piece={holdPiece} label="Hold" />
      <PiecePreview piece={nextPiece} label="Next" />
      <div style={{ color: "#aaa", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        Score
      </div>
      <div style={{ color: "#fff", fontSize: 18, marginBottom: 12 }}>{score}</div>
      <div style={{ color: "#aaa", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        Level
      </div>
      <div style={{ color: "#fff", fontSize: 18, marginBottom: 12 }}>{level}</div>
      <div style={{ color: "#aaa", fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        Lines
      </div>
      <div style={{ color: "#fff", fontSize: 18 }}>{lines}</div>
    </div>
  );
}
