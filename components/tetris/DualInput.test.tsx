import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";

interface CapturedCall {
  instance: number;
  type: string;
}

const calls: CapturedCall[] = [];
const keyBindingsCaptures: Array<Record<string, string>> = [];

vi.mock("@/components/tetris/GameInstance", () => ({
  default: function MockGameInstance({ keyBindings, label }: { keyBindings: Record<string, string>; label?: string }) {
    const instanceIdx = React.useRef(-1);

    React.useEffect(() => {
      const idx = keyBindingsCaptures.length;
      instanceIdx.current = idx;
      keyBindingsCaptures.push(keyBindings);

      const handleKey = (e: KeyboardEvent) => {
        const key = e.key;
        if (key === keyBindings.left) { e.preventDefault(); calls.push({ instance: idx, type: "MOVE_LEFT" }); }
        else if (key === keyBindings.right) { e.preventDefault(); calls.push({ instance: idx, type: "MOVE_RIGHT" }); }
        else if (key === keyBindings.down) { e.preventDefault(); calls.push({ instance: idx, type: "SOFT_DROP" }); }
        else if (key === keyBindings.rotateCW) { e.preventDefault(); calls.push({ instance: idx, type: "ROTATE_CW" }); }
        else if (key === keyBindings.rotateCCW) { calls.push({ instance: idx, type: "ROTATE_CCW" }); }
        else if (key === keyBindings.hardDrop) { e.preventDefault(); calls.push({ instance: idx, type: "HARD_DROP" }); }
        else if (key === keyBindings.hold) { calls.push({ instance: idx, type: "HOLD" }); }
      };

      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return <div data-testid="game-instance">{label}</div>;
  },
}));

import TwoPlayerGame from "./TwoPlayerGame";

describe("Dual Input Handling", () => {
  beforeEach(() => {
    calls.length = 0;
    keyBindingsCaptures.length = 0;
  });

  describe("Key bindings are correctly assigned", () => {
    it("Player 1 uses Arrow keys, Up for CW, Z for CCW, Space for hard drop, C for hold", () => {
      render(<TwoPlayerGame />);
      const p1 = keyBindingsCaptures[0];
      expect(p1.left).toBe("ArrowLeft");
      expect(p1.right).toBe("ArrowRight");
      expect(p1.down).toBe("ArrowDown");
      expect(p1.rotateCW).toBe("ArrowUp");
      expect(p1.rotateCCW).toBe("z");
      expect(p1.hardDrop).toBe(" ");
      expect(p1.hold).toBe("c");
    });

    it("Player 2 uses WASD, E for CW, Q for CCW, Shift for hard drop, F for hold", () => {
      render(<TwoPlayerGame />);
      const p2 = keyBindingsCaptures[1];
      expect(p2.left).toBe("a");
      expect(p2.right).toBe("d");
      expect(p2.down).toBe("s");
      expect(p2.rotateCW).toBe("e");
      expect(p2.rotateCCW).toBe("q");
      expect(p2.hardDrop).toBe("Shift");
      expect(p2.hold).toBe("f");
    });
  });

  describe("Inputs dispatch to correct player's reducer", () => {
    it("P1 arrow keys dispatch only to Player 1", () => {
      render(<TwoPlayerGame />);

      const p1Keys = [
        { key: "ArrowLeft", type: "MOVE_LEFT" },
        { key: "ArrowRight", type: "MOVE_RIGHT" },
        { key: "ArrowDown", type: "SOFT_DROP" },
        { key: "ArrowUp", type: "ROTATE_CW" },
        { key: "z", type: "ROTATE_CCW" },
        { key: " ", type: "HARD_DROP" },
        { key: "c", type: "HOLD" },
      ];

      for (const { key, type } of p1Keys) {
        calls.length = 0;
        fireEvent.keyDown(window, { key });
        const p1 = calls.filter((c) => c.instance === 0 && c.type === type);
        const p2 = calls.filter((c) => c.instance === 1);
        expect(p1.length, `${key} should dispatch ${type} to P1`).toBe(1);
        expect(p2.length, `${key} should not dispatch to P2`).toBe(0);
      }
    });

    it("P2 WASD keys dispatch only to Player 2", () => {
      render(<TwoPlayerGame />);

      const p2Keys = [
        { key: "a", type: "MOVE_LEFT" },
        { key: "d", type: "MOVE_RIGHT" },
        { key: "s", type: "SOFT_DROP" },
        { key: "e", type: "ROTATE_CW" },
        { key: "q", type: "ROTATE_CCW" },
        { key: "Shift", type: "HARD_DROP" },
        { key: "f", type: "HOLD" },
      ];

      for (const { key, type } of p2Keys) {
        calls.length = 0;
        fireEvent.keyDown(window, { key });
        const p2 = calls.filter((c) => c.instance === 1 && c.type === type);
        const p1 = calls.filter((c) => c.instance === 0);
        expect(p2.length, `${key} should dispatch ${type} to P2`).toBe(1);
        expect(p1.length, `${key} should not dispatch to P1`).toBe(0);
      }
    });
  });

  describe("No key conflicts between players", () => {
    it("P1 and P2 key sets have no overlapping keys", () => {
      render(<TwoPlayerGame />);
      const p1Values = new Set(Object.values(keyBindingsCaptures[0]));
      const p2Values = Object.values(keyBindingsCaptures[1]);
      const conflicts = p2Values.filter((k) => p1Values.has(k));
      expect(conflicts).toEqual([]);
    });
  });

  describe("Negative cases", () => {
    it("unrelated key does not dispatch to either player", () => {
      render(<TwoPlayerGame />);
      fireEvent.keyDown(window, { key: "x" });
      fireEvent.keyDown(window, { key: "g" });
      fireEvent.keyDown(window, { key: "1" });
      expect(calls.length).toBe(0);
    });
  });
});
