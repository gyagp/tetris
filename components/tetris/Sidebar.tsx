"use client";

import React, { useEffect, useRef, useState } from "react";
import { PIECE_STYLES } from "@/lib/tetris/constants";
import type { Piece } from "@/lib/tetris/types";

const MINI_CELL = 20;

function PiecePreview({ piece, label }: { piece: Piece | null; label: string }) {
  const rows = piece ? piece.shape.length : 2;
  const cols = piece ? piece.shape[0].length : 4;
  const prevPieceRef = useRef<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const pieceKey = piece ? piece.color : null;
  useEffect(() => {
    if (prevPieceRef.current !== null && prevPieceRef.current !== pieceKey) {
      setTransitioning(true);
      const t = setTimeout(() => setTransitioning(false), 200);
      return () => clearTimeout(t);
    }
    prevPieceRef.current = pieceKey;
  }, [pieceKey]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: "#0ff", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: 2, textShadow: "0 0 6px rgba(0, 255, 255, 0.4)" }}>
        {label}
      </div>
      <div
        className="piece-preview"
        style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${cols}, ${MINI_CELL}px)`,
          gridTemplateRows: `repeat(${rows}, ${MINI_CELL}px)`,
          backgroundColor: "rgba(10, 0, 20, 0.7)",
          border: "1px solid rgba(0, 200, 255, 0.3)",
          borderRadius: 6,
          padding: 4,
          boxShadow: "0 0 8px rgba(0, 200, 255, 0.1), inset 0 0 12px rgba(0, 0, 0, 0.4)",
          transition: "transform 0.2s ease-out, box-shadow 0.2s ease",
          transform: transitioning ? "scale(0.85)" : "scale(1)",
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
                  transition: "background 0.15s ease, box-shadow 0.15s ease",
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

function AnimatedValue({ value }: { value: number }) {
  const prevRef = useRef(value);
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      prevRef.current = value;
      setBumped(true);
      const t = setTimeout(() => setBumped(false), 150);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span style={{
      display: "inline-block",
      transition: "transform 0.15s ease-out",
      transform: bumped ? "scale(1.2)" : "scale(1)",
    }}>
      {value}
    </span>
  );
}

export default function Sidebar({ className, nextPiece, holdPiece, score, level, lines }: SidebarProps) {
  const panelStyle: React.CSSProperties = {
    background: "rgba(10, 0, 20, 0.7)",
    border: "1px solid rgba(0, 200, 255, 0.3)",
    borderRadius: 6,
    padding: "10px 12px",
    marginBottom: 12,
    boxShadow: "0 0 8px rgba(0, 200, 255, 0.1), inset 0 0 12px rgba(0, 0, 0, 0.4)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
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
      <style>{`
        .stat-panel:hover {
          border-color: rgba(0, 200, 255, 0.6) !important;
          box-shadow: 0 0 16px rgba(0, 200, 255, 0.25), inset 0 0 12px rgba(0, 0, 0, 0.4) !important;
        }
        .piece-preview:hover {
          box-shadow: 0 0 16px rgba(0, 200, 255, 0.25), inset 0 0 12px rgba(0, 0, 0, 0.4) !important;
        }
      `}</style>
      <PiecePreview piece={holdPiece} label="Hold" />
      <PiecePreview piece={nextPiece} label="Next" />
      <div className="stat-panel" style={panelStyle}>
        <div style={labelStyle}>Score</div>
        <div style={valueStyle}><AnimatedValue value={score} /></div>
      </div>
      <div className="stat-panel" style={panelStyle}>
        <div style={labelStyle}>Level</div>
        <div style={valueStyle}><AnimatedValue value={level} /></div>
      </div>
      <div className="stat-panel" style={{ ...panelStyle, marginBottom: 0 }}>
        <div style={labelStyle}>Lines</div>
        <div style={valueStyle}><AnimatedValue value={lines} /></div>
      </div>
    </div>
  );
}
