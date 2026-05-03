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

  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [showTSpin, setShowTSpin] = useState(false);
  const [tSpinExiting, setTSpinExiting] = useState(false);
  const [showTetris, setShowTetris] = useState(false);
  const [tetrisExiting, setTetrisExiting] = useState(false);

  useEffect(() => {
    if (state.clearingRows.length > 0) {
      setShakeIntensity(state.clearingRows.length);
      const shakeTimer = setTimeout(() => setShakeIntensity(0), 300);
      const timer = setTimeout(() => dispatch({ type: "FINISH_CLEAR" }), 400);
      if (state.clearingRows.length === 4) {
        setShowTetris(true);
        setTetrisExiting(false);
        const exitTimer = setTimeout(() => setTetrisExiting(true), 1000);
        const hideTimer = setTimeout(() => { setShowTetris(false); setTetrisExiting(false); }, 1500);
        return () => { clearTimeout(shakeTimer); clearTimeout(timer); clearTimeout(exitTimer); clearTimeout(hideTimer); };
      }
      if (state.tSpin) {
        setShowTSpin(true);
        setTSpinExiting(false);
        const exitTimer = setTimeout(() => setTSpinExiting(true), 800);
        const hideTimer = setTimeout(() => { setShowTSpin(false); setTSpinExiting(false); }, 1200);
        return () => { clearTimeout(shakeTimer); clearTimeout(timer); clearTimeout(exitTimer); clearTimeout(hideTimer); };
      }
      return () => { clearTimeout(timer); clearTimeout(shakeTimer); };
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

  const [comboDisplay, setComboDisplay] = useState<number>(0);
  const [comboExiting, setComboExiting] = useState(false);

  useEffect(() => {
    if (state.combo >= 2) {
      setComboDisplay(state.combo);
      setComboExiting(false);
    } else if (comboDisplay > 0) {
      setComboExiting(true);
      const t = setTimeout(() => { setComboDisplay(0); setComboExiting(false); }, 600);
      return () => clearTimeout(t);
    }
  }, [state.combo]);

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
      `}</style>
      <div className="game-container" style={shakeIntensity > 0 ? { animation: `screen-shake-${Math.min(shakeIntensity, 4)} 300ms ease-out` } : undefined}>
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
        {comboDisplay > 0 && (() => {
          const tier = Math.min(comboDisplay, 10);
          const colors = ["#00ccff", "#00ff88", "#ffcc00", "#ff6600", "#ff0044"];
          const color = colors[Math.min(Math.floor((tier - 2) / 2), colors.length - 1)];
          const fontSize = 20 + tier * 2;
          const glowSize = tier * 4;
          return (
            <div
              key={comboDisplay}
              style={{
                position: "absolute",
                top: 60,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
                animation: comboExiting
                  ? "combo-exit 0.6s ease-in forwards"
                  : "combo-enter 0.4s ease-out, combo-pulse 0.8s ease-in-out 0.4s infinite",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  fontSize,
                  fontWeight: "bold",
                  color,
                  textShadow: `0 0 ${glowSize}px ${color}, 0 0 ${glowSize * 2}px ${color}80`,
                  letterSpacing: 2,
                }}
              >
                {comboDisplay}x COMBO
              </div>
            </div>
          );
        })()}
        {showTSpin && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 15,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)",
                animation: "tspin-flash 1s ease-out forwards",
              }}
            />
            <div
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: "#c084fc",
                letterSpacing: 4,
                animation: tSpinExiting
                  ? "tspin-exit 0.4s ease-in forwards"
                  : "tspin-enter 0.5s ease-out, tspin-glow 0.6s ease-in-out 0.5s infinite",
              }}
            >
              T-SPIN
            </div>
          </div>
        )}
        {showTetris && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.2) 40%, transparent 70%)",
                animation: "tetris-flash 1.2s ease-out forwards",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "-50%",
                background: "conic-gradient(from 0deg, transparent 0%, rgba(251,191,36,0.3) 5%, transparent 10%, transparent 15%, rgba(251,191,36,0.2) 20%, transparent 25%)",
                animation: "tetris-rays 1.5s linear forwards",
              }}
            />
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * 360;
              const dist = 80 + Math.random() * 60;
              const tx = Math.cos((angle * Math.PI) / 180) * dist;
              const ty = Math.sin((angle * Math.PI) / 180) * dist;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: ["#fbbf24", "#f59e0b", "#fde68a", "#fff"][i % 4],
                    boxShadow: `0 0 6px ${["#fbbf24", "#f59e0b", "#fde68a", "#fff"][i % 4]}`,
                    ["--tx" as string]: `${tx}px`,
                    ["--ty" as string]: `${ty}px`,
                    animation: `tetris-particle ${0.6 + Math.random() * 0.4}s ease-out ${i * 0.03}s forwards`,
                  }}
                />
              );
            })}
            <div
              style={{
                fontSize: 42,
                fontWeight: "bold",
                color: "#fbbf24",
                letterSpacing: 6,
                animation: tetrisExiting
                  ? "tetris-exit 0.5s ease-in forwards"
                  : "tetris-enter 0.6s ease-out, tetris-glow 0.5s ease-in-out 0.6s infinite",
              }}
            >
              TETRIS!
            </div>
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
