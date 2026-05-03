"use client";

import React from "react";
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

export default function TwoPlayerGame() {
  return (
    <div style={{ display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center" }}>
      <GameInstance keyBindings={P1_KEYS} label="PLAYER 1 — Arrows / Space / C" />
      <GameInstance keyBindings={P2_KEYS} label="PLAYER 2 — IJKL / H / N" />
    </div>
  );
}
