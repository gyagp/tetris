"use client";

import React, { useReducer, useEffect, useCallback, useRef, useState } from "react";
import Board from "@/components/tetris/Board";
import Sidebar from "@/components/tetris/Sidebar";
import { gameReducer, createInitialState } from "@/lib/tetris/engine";
import { getDropInterval } from "@/lib/tetris/scoring";

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (state.clearingRows.length > 0) {
      const timer = setTimeout(() => dispatch({ type: "FINISH_CLEAR" }), 400);
      return () => clearTimeout(timer);
    }
  }, [state.clearingRows]);

  useEffect(() => {
    if (!state.isStarted || state.isGameOver || state.isPaused) return;
    const interval = getDropInterval(state.level);
    const timer = setInterval(() => dispatch({ type: "TICK" }), interval);
    return () => clearInterval(timer);
  }, [state.level, state.isGameOver, state.isPaused, state.isStarted]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const s = stateRef.current;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        dispatch({ type: "MOVE_LEFT" });
        break;
      case "ArrowRight":
        e.preventDefault();
        dispatch({ type: "MOVE_RIGHT" });
        break;
      case "ArrowDown":
        e.preventDefault();
        dispatch({ type: "SOFT_DROP" });
        break;
      case "ArrowUp":
        e.preventDefault();
        dispatch({ type: "ROTATE_CW" });
        break;
      case "z":
      case "Z":
        dispatch({ type: "ROTATE_CCW" });
        break;
      case " ":
        e.preventDefault();
        dispatch({ type: "HARD_DROP" });
        break;
      case "c":
      case "C":
        dispatch({ type: "HOLD" });
        break;
      case "p":
      case "P":
        dispatch(s.isPaused ? { type: "RESUME" } : { type: "PAUSE" });
        break;
      case "r":
      case "R":
        if (s.isGameOver) dispatch({ type: "RESTART" });
        break;
      case "Enter":
        if (!s.isStarted) dispatch({ type: "START" });
        else if (s.isGameOver) dispatch({ type: "RESTART" });
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const [showPause, setShowPause] = useState(false);
  const [pauseExiting, setPauseExiting] = useState(false);
  const isPaused = state.isStarted && state.isPaused;

  useEffect(() => {
    if (isPaused) {
      setShowPause(true);
      setPauseExiting(false);
    } else if (showPause) {
      setPauseExiting(true);
      const t = setTimeout(() => { setShowPause(false); setPauseExiting(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [isPaused]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0014, #001a1a, #0a0020, #001414)",
        backgroundSize: "400% 400%",
        animation: "bg-gradient-shift 15s ease infinite",
        paddingTop: 40,
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
      `}</style>
      <div className="game-container">
      <div style={{ position: "relative" }}>
        <Board board={state.board} currentPiece={state.currentPiece} clearingRows={state.clearingRows} lockingCells={state.lockingCells} hardDropTrail={state.hardDropTrail} />
        {!state.isStarted && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.85)",
              color: "#fff",
              gap: 16,
              animation: "overlay-fade-scale 0.5s ease-out",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: "bold", animation: "title-shimmer 2s ease-in-out infinite" }}>TETRIS</div>
            <div style={{ fontSize: 14, animation: "prompt-pulse 2s ease-in-out infinite" }}>Press Enter to Start</div>
          </div>
        )}
        {showPause && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "#fff",
              fontSize: 32,
              fontWeight: "bold",
              animation: pauseExiting ? "overlay-fade-out 0.3s ease-in forwards" : "overlay-fade-scale 0.3s ease-out",
            }}
          >
            <div style={{ animation: "title-shimmer 2.5s ease-in-out infinite" }}>PAUSED</div>
          </div>
        )}
        {state.isGameOver && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "#fff",
              fontSize: 28,
              fontWeight: "bold",
              gap: 12,
              animation: "overlay-fade-scale 0.4s ease-out",
            }}
          >
            <div style={{ animation: "game-over-entrance 0.6s ease-out" }}>GAME OVER</div>
            <div style={{ fontSize: 18, fontWeight: "normal" }}>Score: {state.score}</div>
            <div style={{ fontSize: 14, fontWeight: "normal", animation: "prompt-pulse 2s ease-in-out infinite" }}>Press Enter or R to restart</div>
          </div>
        )}
      </div>
      <Sidebar
        className="game-sidebar"
        nextPiece={state.nextPiece}
        holdPiece={state.holdPiece}
        score={state.score}
        level={state.level}
        lines={state.lines}
      />
      </div>
    </div>
  );
}
