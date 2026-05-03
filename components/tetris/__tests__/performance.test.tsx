import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import Board from "../Board";
import { BOARD_WIDTH, BOARD_HEIGHT } from "@/lib/tetris/constants";
import type { Board as BoardType } from "@/lib/tetris/types";

function emptyBoard(): BoardType {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

describe("Board cell memoization", () => {
  it("Cell component is wrapped in React.memo", () => {
    const { container } = render(
      <Board board={emptyBoard()} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={[]} />
    );
    const cells = Array.from(
      (container.firstElementChild as HTMLElement).children
    ).filter(el => el.tagName !== "STYLE");
    expect(cells.length).toBe(BOARD_WIDTH * BOARD_HEIGHT);
  });

  it("does not re-render unchanged cells on board update", () => {
    const renderSpy = vi.fn();
    const OriginalCreateElement = React.createElement;
    let cellRenderCount = 0;

    const board1 = emptyBoard();
    const board2 = emptyBoard();
    board2[0][0] = "#f0f000";

    const { rerender } = render(
      <Board board={board1} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={[]} />
    );

    const cellsBefore = document.querySelectorAll('[style*="width"]');
    const unchangedCellStyle = (cellsBefore[10] as HTMLElement).style.background;

    rerender(
      <Board board={board2} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={[]} />
    );

    const cellsAfter = document.querySelectorAll('[style*="width"]');
    expect((cellsAfter[10] as HTMLElement).style.background).toBe(unchangedCellStyle);
    expect((cellsAfter[0] as HTMLElement).style.background).toContain("linear-gradient");
  });

  it("Cell receives stable props for unchanged cells", () => {
    const board = emptyBoard();

    const { rerender } = render(
      <Board board={board} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={[]} />
    );

    const newBoard = emptyBoard();
    rerender(
      <Board board={newBoard} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={[]} />
    );

    const cells = document.querySelectorAll('[style*="width: 30px"]');
    expect(cells.length).toBe(BOARD_WIDTH * BOARD_HEIGHT);
  });
});

describe("Game loop uses requestAnimationFrame", () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;
  let cafSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rafSpy = vi.spyOn(window, "requestAnimationFrame");
    cafSpy = vi.spyOn(window, "cancelAnimationFrame");
  });

  afterEach(() => {
    rafSpy.mockRestore();
    cafSpy.mockRestore();
  });

  it("GameInstance calls requestAnimationFrame when game is started", async () => {
    vi.mock("@/lib/tetris/audio", () => {
      const mockInstance = {
        play: vi.fn(),
        isMuted: vi.fn(() => false),
        getVolume: vi.fn(() => 0.5),
        setVolume: vi.fn(),
        toggleMute: vi.fn(() => false),
        startMusic: vi.fn(),
        stopMusic: vi.fn(),
        setMusicTempo: vi.fn(),
      };
      return { AudioManager: { getInstance: vi.fn(() => mockInstance) } };
    });

    const { default: GameInstance } = await import("../GameInstance");
    const { act } = await import("@testing-library/react");

    const defaultKeys = {
      left: "ArrowLeft", right: "ArrowRight", down: "ArrowDown",
      rotateCW: "ArrowUp", rotateCCW: "z", hardDrop: " ",
      hold: "c", pause: "p", restart: "r", start: "Enter",
    };

    rafSpy.mockClear();

    await act(async () => {
      render(<GameInstance keyBindings={defaultKeys} />);
    });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });

    expect(rafSpy).toHaveBeenCalled();
  });

  it("GameInstance source code uses requestAnimationFrame not setInterval", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const source = fs.readFileSync(
      path.resolve(__dirname, "../GameInstance.tsx"),
      "utf-8"
    );
    expect(source).toContain("requestAnimationFrame");
    expect(source).toContain("cancelAnimationFrame");
    expect(source).not.toMatch(/setInterval\s*\(/);
  });
});

describe("Board Cell component is React.memo", () => {
  it("Board source exports Cell wrapped in React.memo", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const source = fs.readFileSync(
      path.resolve(__dirname, "../Board.tsx"),
      "utf-8"
    );
    expect(source).toMatch(/React\.memo\s*\(\s*function\s+Cell/);
  });
});
