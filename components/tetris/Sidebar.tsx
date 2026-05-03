"use client";

import React from "react";
import { PIECE_STYLES } from "@/lib/tetris/constants";
import type { Piece } from "@/lib/tetris/types";

const MINI_CELL = 20;

function PiecePreview({ piece, label }: { piece: Piece | null; label: string }) {
  const rows = piece ? piece.shape.length : 2;
  const cols = piece ? piece.shape[0].length : 4;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#0ff", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: 2, textShadow: "0 0 6px rgba(0, 255, 255, 0.4)" }}>
        {label}
      </div>
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${cols}, ${MINI_CELL}px)`,
          gridTemplateRows: `repeat(${rows}, ${MINI_CELL}px)`,
          backgroundColor: "rgba(10, 0, 20, 0.7)",
          border: "1px solid rgba(0, 200, 255, 0.3)",
          borderRadius: 6,
          padding: 4,
          boxShadow: "0 0 8px rgba(0, 200, 255, 0.1), inset 0 0 12px rgba(0, 0, 0, 0.4)",
        }}
      >
        {Array.from({ length: rows }, (_, y) =>
          Array.from({ length: cols }, (_, x) => {
            const filled = piece?.shape[y][x];
            const style = filled ? PIECE_STYLES[piece!.color] : null;
            return (
              <div
                key={`${y}-${x}`}
                style={{
                  width: MINI_CELL,
                  height: MINI_CELL,
                  background: filled && style ? style.gradient : "rgba(10, 0, 20, 0.5)",
                  border: filled ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0, 200, 255, 0.06)",
                  boxSizing: "border-box",
                  boxShadow: filled && style ? style.glow : "none",
                  borderRadius: filled ? 2 : 0,
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
  className?: string;
  nextPiece: Piece | null;
  holdPiece: Piece | null;
  score: number;
  level: number;
  lines: number;
}

export default function Sidebar({ className, nextPiece, holdPiece, score, level, lines }: SidebarProps) {
  const panelStyle: React.CSSProperties = {
    background: "rgba(10, 0, 20, 0.7)",
    border: "1px solid rgba(0, 200, 255, 0.3)",
    borderRadius: 6,
    padding: "10px 12px",
    marginBottom: 12,
    boxShadow: "0 0 8px rgba(0, 200, 255, 0.1), inset 0 0 12px rgba(0, 0, 0, 0.4)",
  };

  const labelStyle: React.CSSProperties = {
    color: "#0ff",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
    textShadow: "0 0 6px rgba(0, 255, 255, 0.4)",
  };

  const valueStyle: React.CSSProperties = {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textShadow: "0 0 8px rgba(200, 100, 255, 0.5)",
    fontFamily: "monospace",
  };

  return (
    <div className={className} style={{ marginLeft: 20, minWidth: 120 }}>
      <PiecePreview piece={holdPiece} label="Hold" />
      <PiecePreview piece={nextPiece} label="Next" />
      <div style={panelStyle}>
        <div style={labelStyle}>Score</div>
        <div style={valueStyle}>{score}</div>
      </div>
      <div style={panelStyle}>
        <div style={labelStyle}>Level</div>
        <div style={valueStyle}>{level}</div>
      </div>
      <div style={{ ...panelStyle, marginBottom: 0 }}>
        <div style={labelStyle}>Lines</div>
        <div style={valueStyle}>{lines}</div>
      </div>
    </div>
  );
}
