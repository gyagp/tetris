"use client";

import React, { useRef, useCallback, useState } from "react";
import GameInstance from "@/components/tetris/GameInstance";
import type { GameInstanceHandle, PlayerTheme } from "@/components/tetris/GameInstance";

const P1_THEME: PlayerTheme = {
  accent: "#00d4ff",
  border: "rgba(0, 180, 255, 0.5)",
  borderHover: "rgba(0, 200, 255, 0.7)",
  glow: "rgba(0, 180, 255, 0.2)",
  glowHover: "rgba(0, 200, 255, 0.35)",
};

const P2_THEME: PlayerTheme = {
  accent: "#ff6b35",
  border: "rgba(255, 100, 50, 0.5)",
  borderHover: "rgba(255, 120, 60, 0.7)",
  glow: "rgba(255, 100, 50, 0.2)",
  glowHover: "rgba(255, 120, 60, 0.35)",
};

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
  left: "a",
  right: "d",
  down: "s",
  rotateCW: "e",
  rotateCCW: "q",
  hardDrop: "Shift",
  hold: "f",
  pause: "o",
  restart: "m",
  start: "w",
};

interface TwoPlayerGameProps {
  onBackToMenu?: () => void;
}

export default function TwoPlayerGame({ onBackToMenu }: TwoPlayerGameProps) {
  const p1Ref = useRef<GameInstanceHandle>(null);
  const p2Ref = useRef<GameInstanceHandle>(null);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const matchOverRef = useRef(false);

  const handleP1Clear = useCallback((lines: number, tSpin: boolean) => {
    const garbage = tSpin ? lines * 2 : (lines >= 2 ? lines - 1 : 0);
    if (garbage > 0) p2Ref.current?.sendGarbage(garbage);
  }, []);

  const handleP2Clear = useCallback((lines: number, tSpin: boolean) => {
    const garbage = tSpin ? lines * 2 : (lines >= 2 ? lines - 1 : 0);
    if (garbage > 0) p1Ref.current?.sendGarbage(garbage);
  }, []);

  const handleP1GameOver = useCallback(() => {
    if (matchOverRef.current) return;
    matchOverRef.current = true;
    p2Ref.current?.forceGameOver();
    setWinner(2);
  }, []);

  const handleP2GameOver = useCallback(() => {
    if (matchOverRef.current) return;
    matchOverRef.current = true;
    p1Ref.current?.forceGameOver();
    setWinner(1);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setWinner(null);
    matchOverRef.current = false;
    setGameKey(k => k + 1);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div key={gameKey} className="two-player-board" style={{ display: "flex", gap: 32, justifyContent: "center" }}>
        <GameInstance ref={p1Ref} keyBindings={P1_KEYS} label="PLAYER 1" theme={P1_THEME} onLinesCleared={handleP1Clear} onGameOver={handleP1GameOver} />
        <GameInstance ref={p2Ref} keyBindings={P2_KEYS} label="PLAYER 2" theme={P2_THEME} onLinesCleared={handleP2Clear} onGameOver={handleP2GameOver} />
      </div>

      {winner && (
        <div style={{
          position: "fixed", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          backgroundColor: "rgba(5, 0, 20, 0.88)", zIndex: 100,
          animation: "overlay-fade-scale 0.5s ease-out",
        }}>
          <div style={{
            fontSize: 48, fontWeight: "bold", color: "#fbbf24", letterSpacing: 6,
            animation: "title-shimmer 2s ease-in-out infinite",
            textShadow: "0 0 15px rgba(251,191,36,0.6), 0 0 40px rgba(251,191,36,0.3)",
            marginBottom: 16,
          }}>
            PLAYER {winner} WINS!
          </div>
          <div style={{ fontSize: 18, color: "#0ff", marginBottom: 40, textShadow: "0 0 6px rgba(0,255,255,0.4)" }}>
            Player {winner === 1 ? 2 : 1} topped out
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button
              onClick={handlePlayAgain}
              style={{
                padding: "14px 36px", fontSize: 18, fontWeight: "bold", letterSpacing: 2,
                background: "rgba(0, 30, 40, 0.8)", color: "#0ff",
                border: "1px solid rgba(0, 200, 255, 0.4)", borderRadius: 8,
                cursor: "pointer", animation: "mode-btn-glow 2s ease-in-out infinite",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0, 60, 80, 0.9)"; e.currentTarget.style.borderColor = "rgba(0, 255, 255, 0.8)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0, 30, 40, 0.8)"; e.currentTarget.style.borderColor = "rgba(0, 200, 255, 0.4)"; }}
            >
              PLAY AGAIN
            </button>
            {onBackToMenu && (
              <button
                onClick={onBackToMenu}
                style={{
                  padding: "14px 36px", fontSize: 18, fontWeight: "bold", letterSpacing: 2,
                  background: "rgba(0, 30, 40, 0.8)", color: "#0ff",
                  border: "1px solid rgba(0, 200, 255, 0.4)", borderRadius: 8,
                  cursor: "pointer", animation: "mode-btn-glow 2s ease-in-out infinite",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0, 60, 80, 0.9)"; e.currentTarget.style.borderColor = "rgba(0, 255, 255, 0.8)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0, 30, 40, 0.8)"; e.currentTarget.style.borderColor = "rgba(0, 200, 255, 0.4)"; }}
              >
                BACK TO MENU
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
