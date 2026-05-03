"use client";

import React, { useState } from "react";
import GameInstance from "@/components/tetris/GameInstance";

const P1_KEYS = {
  left: "ArrowLeft",
  right: "ArrowRight",
  down: "ArrowDown",
  rotateCW: "ArrowUp",
  rotateCCW: "z",
  hardDrop: " ",
  hold: "c",
  pause: "p",
  restart: "r",
  start: "Enter",
};

const P2_KEYS = {
  left: "j",
  right: "l",
  down: "k",
  rotateCW: "i",
  rotateCCW: "u",
  hardDrop: "h",
  hold: "n",
  pause: "o",
  restart: "m",
  start: "b",
};

export default function Home() {
  const [mode, setMode] = useState<"select" | "1p" | "2p">("select");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: mode === "select" ? "center" : "flex-start",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0014, #001a1a, #0a0020, #001414)",
        backgroundSize: "400% 400%",
        animation: "bg-gradient-shift 15s ease infinite",
        paddingTop: mode === "select" ? 0 : 40,
        overflow: "hidden",
      }}
    >
      <style>{`
        .game-container {
          display: flex;
          transform-origin: top center;
        }
        @media (max-width: 500px) {
          .game-container {
            flex-direction: column;
            align-items: center;
          }
          .game-container .game-sidebar {
            margin-left: 0 !important;
            margin-top: 12px;
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .game-container .game-sidebar > div {
            margin-bottom: 0 !important;
          }
        }
        @media (max-width: 480px) {
          .game-container {
            transform: scale(calc(min(1, (100vw - 20px) / 310)));
          }
        }
        @media (max-width: 360px) {
          .game-container {
            transform: scale(calc((360px - 20px) / 310));
          }
        }
        @keyframes bg-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes overlay-fade-scale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes overlay-fade-out {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(1.05); }
        }
        @keyframes game-over-entrance {
          0% { opacity: 0; transform: scale(0.3) rotate(-5deg); }
          60% { opacity: 1; transform: scale(1.1) rotate(1deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes title-shimmer {
          0%, 100% { text-shadow: 0 0 8px rgba(0,200,255,0.6), 0 0 20px rgba(0,200,255,0.3); }
          50% { text-shadow: 0 0 16px rgba(0,200,255,1), 0 0 40px rgba(0,200,255,0.6), 0 0 60px rgba(100,200,255,0.3); }
        }
        @keyframes prompt-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes combo-enter {
          0% { opacity: 0; transform: scale(0.3) translateY(20px); }
          50% { opacity: 1; transform: scale(1.2) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes combo-exit {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.8) translateY(-30px); }
        }
        @keyframes combo-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes screen-shake-1 {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-2px, 1px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, 2px); }
          80% { transform: translate(1px, -1px); }
        }
        @keyframes screen-shake-2 {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-3px, 2px); }
          40% { transform: translate(3px, -2px); }
          60% { transform: translate(-2px, 3px); }
          80% { transform: translate(2px, -2px); }
        }
        @keyframes screen-shake-3 {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-4px, 3px); }
          40% { transform: translate(4px, -3px); }
          60% { transform: translate(-3px, 4px); }
          80% { transform: translate(3px, -3px); }
        }
        @keyframes screen-shake-4 {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-6px, 4px); }
          40% { transform: translate(6px, -4px); }
          60% { transform: translate(-4px, 6px); }
          80% { transform: translate(4px, -4px); }
        }
        @keyframes tspin-enter {
          0% { opacity: 0; transform: scale(0.2) rotate(-20deg); }
          40% { opacity: 1; transform: scale(1.3) rotate(5deg); }
          70% { transform: scale(0.95) rotate(-2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes tspin-exit {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        @keyframes tspin-glow {
          0%, 100% { text-shadow: 0 0 10px #a855f7, 0 0 30px #a855f7, 0 0 60px #7c3aed; }
          50% { text-shadow: 0 0 20px #c084fc, 0 0 50px #a855f7, 0 0 80px #7c3aed, 0 0 100px #6d28d9; }
        }
        @keyframes tspin-flash {
          0% { opacity: 0.6; }
          50% { opacity: 0.2; }
          100% { opacity: 0; }
        }
        @keyframes tetris-enter {
          0% { opacity: 0; transform: scale(0.1) rotate(-30deg); }
          30% { opacity: 1; transform: scale(1.4) rotate(5deg); }
          60% { transform: scale(0.9) rotate(-3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes tetris-exit {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2); }
        }
        @keyframes tetris-glow {
          0%, 100% { text-shadow: 0 0 15px #fbbf24, 0 0 40px #f59e0b, 0 0 70px #d97706; }
          50% { text-shadow: 0 0 25px #fde68a, 0 0 60px #fbbf24, 0 0 100px #f59e0b, 0 0 130px #d97706; }
        }
        @keyframes tetris-flash {
          0% { opacity: 0.8; }
          40% { opacity: 0.3; }
          100% { opacity: 0; }
        }
        @keyframes tetris-rays {
          0% { transform: rotate(0deg); opacity: 0.7; }
          100% { transform: rotate(180deg); opacity: 0; }
        }
        @keyframes tetris-particle {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); }
        }
        @keyframes mode-btn-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(0,255,255,0.2), inset 0 0 10px rgba(0,255,255,0.05); }
          50% { box-shadow: 0 0 20px rgba(0,255,255,0.4), inset 0 0 20px rgba(0,255,255,0.1); }
        }
      `}</style>

      {mode === "select" && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 32,
          animation: "overlay-fade-scale 0.5s ease-out",
        }}>
          <div style={{
            fontSize: 56, fontWeight: "bold", letterSpacing: 8, color: "#fff",
            animation: "title-shimmer 2s ease-in-out infinite",
          }}>
            TETRIS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <button
              onClick={() => setMode("1p")}
              style={{
                padding: "16px 48px", fontSize: 20, fontWeight: "bold", letterSpacing: 3,
                background: "rgba(0, 30, 40, 0.8)", color: "#0ff",
                border: "1px solid rgba(0, 200, 255, 0.4)", borderRadius: 8,
                cursor: "pointer", animation: "mode-btn-glow 2s ease-in-out infinite",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0, 60, 80, 0.9)"; e.currentTarget.style.borderColor = "rgba(0, 255, 255, 0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0, 30, 40, 0.8)"; e.currentTarget.style.borderColor = "rgba(0, 200, 255, 0.4)"; }}
            >
              1 PLAYER
            </button>
            <button
              onClick={() => setMode("2p")}
              style={{
                padding: "16px 48px", fontSize: 20, fontWeight: "bold", letterSpacing: 3,
                background: "rgba(0, 30, 40, 0.8)", color: "#0ff",
                border: "1px solid rgba(0, 200, 255, 0.4)", borderRadius: 8,
                cursor: "pointer", animation: "mode-btn-glow 2s ease-in-out infinite",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0, 60, 80, 0.9)"; e.currentTarget.style.borderColor = "rgba(0, 255, 255, 0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0, 30, 40, 0.8)"; e.currentTarget.style.borderColor = "rgba(0, 200, 255, 0.4)"; }}
            >
              2 PLAYERS
            </button>
          </div>
          <div style={{ fontSize: 12, color: "rgba(0,255,255,0.4)", marginTop: 8 }}>
            Select a mode to begin
          </div>
        </div>
      )}

      {mode === "1p" && (
        <GameInstance keyBindings={P1_KEYS} />
      )}

      {mode === "2p" && (
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
          <GameInstance keyBindings={P1_KEYS} label="PLAYER 1 — Arrows / Space / C" />
          <GameInstance keyBindings={P2_KEYS} label="PLAYER 2 — IJKL / H / N" />
        </div>
      )}
    </div>
  );
}
