"use client";

import React, { useRef, useCallback } from "react";
import GameInstance from "@/components/tetris/GameInstance";
import type { GameInstanceHandle } from "@/components/tetris/GameInstance";

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

export default function TwoPlayerGame() {
  const p1Ref = useRef<GameInstanceHandle>(null);
  const p2Ref = useRef<GameInstanceHandle>(null);

  const handleP1Clear = useCallback((lines: number, tSpin: boolean) => {
    const garbage = tSpin ? lines * 2 : (lines >= 2 ? lines - 1 : 0);
    if (garbage > 0) p2Ref.current?.sendGarbage(garbage);
  }, []);

  const handleP2Clear = useCallback((lines: number, tSpin: boolean) => {
    const garbage = tSpin ? lines * 2 : (lines >= 2 ? lines - 1 : 0);
    if (garbage > 0) p1Ref.current?.sendGarbage(garbage);
  }, []);

  return (
    <div style={{ display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
      <GameInstance ref={p1Ref} keyBindings={P1_KEYS} label="PLAYER 1 — Arrows / Space / C" onLinesCleared={handleP1Clear} />
      <GameInstance ref={p2Ref} keyBindings={P2_KEYS} label="PLAYER 2 — WASD / Shift / F" onLinesCleared={handleP2Clear} />
    </div>
  );
}
