"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { PIECE_STYLES } from "@/lib/tetris/constants";
import type { Piece } from "@/lib/tetris/types";
import { AudioManager } from "@/lib/tetris/audio";

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
      <div style={{ color: "var(--theme-accent, #0ff)", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: 2, textShadow: `0 0 6px var(--theme-glow, rgba(0, 255, 255, 0.4))` }}>
        {label}
      </div>
      <div
        className="piece-preview"
        style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${cols}, ${MINI_CELL}px)`,
          gridTemplateRows: `repeat(${rows}, ${MINI_CELL}px)`,
          backgroundColor: "rgba(10, 0, 20, 0.7)",
          border: "1px solid var(--theme-border, rgba(0, 200, 255, 0.3))",
          borderRadius: 6,
          padding: 4,
          boxShadow: "0 0 8px var(--theme-glow, rgba(0, 200, 255, 0.1)), inset 0 0 12px rgba(0, 0, 0, 0.4)",
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
  highScore: number;
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

function VolumeControl() {
  const audio = AudioManager.getInstance();
  const [muted, setMuted] = useState(audio.isMuted());
  const [volume, setVolume] = useState(audio.getVolume());

  const handleToggleMute = useCallback(() => {
    audio.toggleMute();
    setMuted(audio.isMuted());
  }, [audio]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    audio.setVolume(v);
    setVolume(v);
    if (v > 0 && audio.isMuted()) {
      audio.toggleMute();
      setMuted(false);
    }
  }, [audio]);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <button
          onClick={handleToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          style={{
            background: "rgba(10, 0, 20, 0.7)",
            border: "1px solid var(--theme-border, rgba(0, 200, 255, 0.3))",
            borderRadius: 6,
            color: muted ? "rgba(255,255,255,0.4)" : "var(--theme-accent, #0ff)",
            fontSize: 18,
            width: 36,
            height: 36,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textShadow: muted ? "none" : "0 0 6px var(--theme-glow, rgba(0, 255, 255, 0.4))",
            boxShadow: "0 0 8px var(--theme-glow, rgba(0, 200, 255, 0.1))",
            transition: "all 0.2s ease",
          }}
        >
          {muted ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          aria-label="Volume"
          style={{
            flex: 1,
            accentColor: "var(--theme-accent, #0ff)",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}

export default function Sidebar({ className, nextPiece, holdPiece, score, level, lines, highScore }: SidebarProps) {
  const panelStyle: React.CSSProperties = {
    background: "rgba(10, 0, 20, 0.7)",
    border: "1px solid var(--theme-border, rgba(0, 200, 255, 0.3))",
    borderRadius: 6,
    padding: "10px 12px",
    marginBottom: 12,
    boxShadow: "0 0 8px var(--theme-glow, rgba(0, 200, 255, 0.1)), inset 0 0 12px rgba(0, 0, 0, 0.4)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--theme-accent, #0ff)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
    textShadow: "0 0 6px var(--theme-glow, rgba(0, 255, 255, 0.4))",
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
          border-color: var(--theme-border-hover, rgba(0, 200, 255, 0.6)) !important;
          box-shadow: 0 0 16px var(--theme-glow-hover, rgba(0, 200, 255, 0.25)), inset 0 0 12px rgba(0, 0, 0, 0.4) !important;
        }
        .piece-preview:hover {
          box-shadow: 0 0 16px var(--theme-glow-hover, rgba(0, 200, 255, 0.25)), inset 0 0 12px rgba(0, 0, 0, 0.4) !important;
        }
      `}</style>
      <PiecePreview piece={holdPiece} label="Hold" />
      <PiecePreview piece={nextPiece} label="Next" />
      <div className="stat-panel" style={panelStyle}>
        <div style={labelStyle}>Score</div>
        <div style={valueStyle}><AnimatedValue value={score} /></div>
      </div>
      <div className="stat-panel" style={panelStyle}>
        <div style={labelStyle}>High Score</div>
        <div style={valueStyle}><AnimatedValue value={highScore} /></div>
      </div>
      <div className="stat-panel" style={panelStyle}>
        <div style={labelStyle}>Level</div>
        <div style={valueStyle}><AnimatedValue value={level} /></div>
      </div>
      <div className="stat-panel" style={{ ...panelStyle, marginBottom: 0 }}>
        <div style={labelStyle}>Lines</div>
        <div style={valueStyle}><AnimatedValue value={lines} /></div>
      </div>
      <VolumeControl />
    </div>
  );
}
