"use client";

import React, { useReducer, useEffect, useCallback, useRef } from "react";
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

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        backgroundColor: "#000",
        paddingTop: 40,
      }}
    >
      <div style={{ position: "relative" }}>
        <Board board={state.board} currentPiece={state.currentPiece} clearingRows={state.clearingRows} />
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
            }}
          >
            <div style={{ fontSize: 40, fontWeight: "bold" }}>TETRIS</div>
            <div style={{ fontSize: 14 }}>Press Enter to Start</div>
          </div>
        )}
        {state.isStarted && state.isPaused && (
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
            }}
          >
            PAUSED
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
            }}
          >
            <div>GAME OVER</div>
            <div style={{ fontSize: 18, fontWeight: "normal" }}>Score: {state.score}</div>
            <div style={{ fontSize: 14, fontWeight: "normal" }}>Press Enter or R to restart</div>
          </div>
        )}
      </div>
      <Sidebar
        nextPiece={state.nextPiece}
        holdPiece={state.holdPiece}
        score={state.score}
        level={state.level}
        lines={state.lines}
      />
    </div>
  );
}
