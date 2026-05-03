"use client";

import React, { useReducer, useEffect, useCallback, useRef, useState, useImperativeHandle, forwardRef } from "react";
import Board from "@/components/tetris/Board";
import Sidebar from "@/components/tetris/Sidebar";
import { gameReducer, createInitialState } from "@/lib/tetris/engine";
import { getDropInterval } from "@/lib/tetris/scoring";
import { AudioManager } from "@/lib/tetris/audio";
import { useTouchControls } from "@/lib/tetris/useTouchControls";

interface KeyBindings {
  left: string;
  right: string;
  down: string;
  rotateCW: string;
  rotateCCW: string;
  hardDrop: string;
  hold: string;
  pause: string;
  restart: string;
  start: string;
}

export interface GameInstanceHandle {
  sendGarbage: (lines: number) => void;
  forceGameOver: () => void;
}

export interface PlayerTheme {
  accent: string;
  border: string;
  borderHover: string;
  glow: string;
  glowHover: string;
}

interface GameInstanceProps {
  keyBindings: KeyBindings;
  label?: string;
  theme?: PlayerTheme;
  onLinesCleared?: (linesCleared: number, tSpin: boolean) => void;
  onGameOver?: () => void;
}

const HIGH_SCORE_KEY = "tetris-high-score";

const GameInstance = forwardRef<GameInstanceHandle, GameInstanceProps>(function GameInstance({ keyBindings, label, theme, onLinesCleared, onGameOver }, ref) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) setHighScore(parsed);
      }
    } catch {}
  }, []);

  useImperativeHandle(ref, () => ({
    sendGarbage: (lines: number) => dispatch({ type: "RECEIVE_GARBAGE", lines }),
    forceGameOver: () => dispatch({ type: "FORCE_GAME_OVER" }),
  }), []);

  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [showTSpin, setShowTSpin] = useState(false);
  const [tSpinExiting, setTSpinExiting] = useState(false);
  const [showTetris, setShowTetris] = useState(false);
  const [tetrisExiting, setTetrisExiting] = useState(false);

  useEffect(() => {
    if (state.clearingRows.length > 0) {
      onLinesCleared?.(state.clearingRows.length, state.tSpin);
      setShakeIntensity(state.clearingRows.length);
      AudioManager.getInstance().play(state.clearingRows.length === 4 ? "tetris" : "lineClear");
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

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  useEffect(() => {
    if (state.isGameOver && state.isStarted) {
      AudioManager.getInstance().play("gameOver");
      if (state.score > highScore) {
        setHighScore(state.score);
        try {
          localStorage.setItem(HIGH_SCORE_KEY, String(state.score));
        } catch {}
      }
      onGameOverRef.current?.();
    }
  }, [state.isGameOver, state.isStarted]);

  useEffect(() => {
    if (!state.isStarted || state.isGameOver || state.isPaused) return;
    const interval = getDropInterval(state.level);
    const timer = setInterval(() => dispatch({ type: "TICK" }), interval);
    return () => clearInterval(timer);
  }, [state.level, state.isGameOver, state.isPaused, state.isStarted]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const s = stateRef.current;
    const key = e.key;
    const audio = AudioManager.getInstance();
    if (key === keyBindings.left) { e.preventDefault(); dispatch({ type: "MOVE_LEFT" }); audio.play("move"); }
    else if (key === keyBindings.right) { e.preventDefault(); dispatch({ type: "MOVE_RIGHT" }); audio.play("move"); }
    else if (key === keyBindings.down) { e.preventDefault(); dispatch({ type: "SOFT_DROP" }); audio.play("move"); }
    else if (key === keyBindings.rotateCW) { e.preventDefault(); dispatch({ type: "ROTATE_CW" }); audio.play("rotate"); }
    else if (key === keyBindings.rotateCCW) { dispatch({ type: "ROTATE_CCW" }); audio.play("rotate"); }
    else if (key === keyBindings.hardDrop) { e.preventDefault(); dispatch({ type: "HARD_DROP" }); audio.play("hardDrop"); }
    else if (key === keyBindings.hold) { dispatch({ type: "HOLD" }); }
    else if (key === keyBindings.pause) { dispatch(s.isPaused ? { type: "RESUME" } : { type: "PAUSE" }); }
    else if (key === keyBindings.restart) { if (s.isGameOver) dispatch({ type: "RESTART" }); }
    else if (key === keyBindings.start) {
      if (!s.isStarted) dispatch({ type: "START" });
      else if (s.isGameOver) dispatch({ type: "RESTART" });
    }
  }, [keyBindings]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const gameContainerRef = useRef<HTMLDivElement>(null);
  const touchActions = useCallback(() => {
    const audio = AudioManager.getInstance();
    return {
      onLeft: () => { dispatch({ type: "MOVE_LEFT" }); audio.play("move"); },
      onRight: () => { dispatch({ type: "MOVE_RIGHT" }); audio.play("move"); },
      onSoftDrop: () => { dispatch({ type: "SOFT_DROP" }); audio.play("move"); },
      onHardDrop: () => { dispatch({ type: "HARD_DROP" }); audio.play("hardDrop"); },
      onRotate: () => { dispatch({ type: "ROTATE_CW" }); audio.play("rotate"); },
    };
  }, []);
  useTouchControls(gameContainerRef, touchActions(), state.isStarted && !state.isGameOver && !state.isPaused);

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

  const themeVars: React.CSSProperties = theme ? {
    "--theme-accent": theme.accent,
    "--theme-border": theme.border,
    "--theme-border-hover": theme.borderHover,
    "--theme-glow": theme.glow,
    "--theme-glow-hover": theme.glowHover,
  } as React.CSSProperties : {};

  return (
    <div style={themeVars}>
      {label && (
        <div style={{
          textAlign: "center",
          color: theme?.accent ?? "#0ff",
          fontSize: 16,
          fontWeight: "bold",
          letterSpacing: 3,
          marginBottom: 8,
          textShadow: `0 0 8px ${theme?.glow ?? "rgba(0,255,255,0.4)"}`,
        }}>
          {label}
        </div>
      )}
      <div ref={gameContainerRef} className="game-container" style={shakeIntensity > 0 ? { animation: `screen-shake-${Math.min(shakeIntensity, 4)} 300ms ease-out` } : undefined}>
        <div style={{ position: "relative" }}>
          <Board board={state.board} currentPiece={state.currentPiece} clearingRows={state.clearingRows} lockingCells={state.lockingCells} hardDropTrail={state.hardDropTrail} />
          {!state.isStarted && (
            <div onClick={() => dispatch({ type: "START" })} style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
              backgroundColor: "rgba(5, 0, 20, 0.9)", border: "1px solid rgba(0, 200, 255, 0.2)",
              color: "#fff", gap: 16, animation: "overlay-fade-scale 0.5s ease-out",
            }}>
              <div style={{ fontSize: 40, fontWeight: "bold", animation: "title-shimmer 2s ease-in-out infinite", letterSpacing: 6 }}>TETRIS</div>
              <div style={{ fontSize: 14, animation: "prompt-pulse 2s ease-in-out infinite", color: "#0ff", textShadow: "0 0 6px rgba(0, 255, 255, 0.4)" }}>
                Tap or press {keyBindings.start === "Enter" ? "Enter" : `"${keyBindings.start}"`} to Start
              </div>
            </div>
          )}
          {showPause && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: "rgba(5, 0, 20, 0.85)", color: "#fff", fontSize: 32, fontWeight: "bold",
              animation: pauseExiting ? "overlay-fade-out 0.3s ease-in forwards" : "overlay-fade-scale 0.3s ease-out",
            }}>
              <div style={{ fontSize: 32, animation: "title-shimmer 2.5s ease-in-out infinite", letterSpacing: 4 }}>PAUSED</div>
            </div>
          )}
          {state.isGameOver && (
            <div onClick={() => dispatch({ type: "RESTART" })} style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
              backgroundColor: "rgba(5, 0, 20, 0.85)", color: "#fff", fontSize: 28, fontWeight: "bold",
              gap: 12, animation: "overlay-fade-scale 0.4s ease-out",
            }}>
              <div style={{ animation: "game-over-entrance 0.6s ease-out", color: "#ff3366", textShadow: "0 0 10px rgba(255, 51, 102, 0.6), 0 0 30px rgba(255, 51, 102, 0.3)" }}>GAME OVER</div>
              <div style={{ fontSize: 18, fontWeight: "normal", color: "#0ff", textShadow: "0 0 6px rgba(0, 255, 255, 0.4)" }}>Score: {state.score}</div>
              <div style={{ fontSize: 14, fontWeight: "normal", animation: "prompt-pulse 2s ease-in-out infinite", color: "rgba(200, 130, 255, 0.8)" }}>
                Press {keyBindings.start === "Enter" ? "Enter" : `"${keyBindings.start}"`} or {`"${keyBindings.restart}"`} to restart
              </div>
            </div>
          )}
          {comboDisplay > 0 && (() => {
            const tier = Math.min(comboDisplay, 10);
            const colors = ["#00ccff", "#00ff88", "#ffcc00", "#ff6600", "#ff0044"];
            const color = colors[Math.min(Math.floor((tier - 2) / 2), colors.length - 1)];
            const fontSize = 20 + tier * 2;
            const glowSize = tier * 4;
            return (
              <div key={comboDisplay} style={{
                position: "absolute", top: 60, left: 0, right: 0, display: "flex", justifyContent: "center",
                pointerEvents: "none", zIndex: 10,
                animation: comboExiting ? "combo-exit 0.6s ease-in forwards" : "combo-enter 0.4s ease-out, combo-pulse 0.8s ease-in-out 0.4s infinite",
              }}>
                <div style={{ fontSize, fontWeight: "bold", color, textShadow: `0 0 ${glowSize}px ${color}, 0 0 ${glowSize * 2}px ${color}80`, letterSpacing: 2 }}>
                  {comboDisplay}x COMBO
                </div>
              </div>
            );
          })()}
          {showTSpin && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 15 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)", animation: "tspin-flash 1s ease-out forwards" }} />
              <div style={{
                fontSize: 36, fontWeight: "bold", color: "#c084fc", letterSpacing: 4,
                animation: tSpinExiting ? "tspin-exit 0.4s ease-in forwards" : "tspin-enter 0.5s ease-out, tspin-glow 0.6s ease-in-out 0.5s infinite",
              }}>T-SPIN</div>
            </div>
          )}
          {showTetris && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 20 }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.2) 40%, transparent 70%)", animation: "tetris-flash 1.2s ease-out forwards" }} />
              <div style={{ position: "absolute", inset: "-50%", background: "conic-gradient(from 0deg, transparent 0%, rgba(251,191,36,0.3) 5%, transparent 10%, transparent 15%, rgba(251,191,36,0.2) 20%, transparent 25%)", animation: "tetris-rays 1.5s linear forwards" }} />
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * 360;
                const dist = 80 + Math.random() * 60;
                const tx = Math.cos((angle * Math.PI) / 180) * dist;
                const ty = Math.sin((angle * Math.PI) / 180) * dist;
                return (
                  <div key={i} style={{
                    position: "absolute", width: 6, height: 6, borderRadius: "50%",
                    background: ["#fbbf24", "#f59e0b", "#fde68a", "#fff"][i % 4],
                    boxShadow: `0 0 6px ${["#fbbf24", "#f59e0b", "#fde68a", "#fff"][i % 4]}`,
                    ["--tx" as string]: `${tx}px`, ["--ty" as string]: `${ty}px`,
                    animation: `tetris-particle ${0.6 + Math.random() * 0.4}s ease-out ${i * 0.03}s forwards`,
                  }} />
                );
              })}
              <div style={{
                fontSize: 42, fontWeight: "bold", color: "#fbbf24", letterSpacing: 6,
                animation: tetrisExiting ? "tetris-exit 0.5s ease-in forwards" : "tetris-enter 0.6s ease-out, tetris-glow 0.5s ease-in-out 0.6s infinite",
              }}>TETRIS!</div>
            </div>
          )}
        </div>
        <Sidebar className="game-sidebar" nextPiece={state.nextPiece} holdPiece={state.holdPiece} score={state.score} level={state.level} lines={state.lines} highScore={highScore} />
      </div>
    </div>
  );
});

export default GameInstance;