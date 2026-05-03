import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import Board from "../Board";
import { BOARD_WIDTH, BOARD_HEIGHT } from "@/lib/tetris/constants";
import type { Board as BoardType } from "@/lib/tetris/types";

function emptyBoard(): BoardType {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

describe("Board visual design", () => {
  it("renders BOARD_WIDTH * BOARD_HEIGHT cells", () => {
    const { container } = render(<Board board={emptyBoard()} currentPiece={null} />);
    const grid = container.firstElementChild as HTMLElement;
    expect(grid.children.length).toBe(BOARD_WIDTH * BOARD_HEIGHT);
  });

  it("board has dark background and box-shadow for polish", () => {
    const { container } = render(<Board board={emptyBoard()} currentPiece={null} />);
    const grid = container.firstElementChild as HTMLElement;
    expect(grid.style.backgroundColor).toBeTruthy();
    expect(grid.style.boxShadow).toBeTruthy();
  });

  it("empty cells have subtle gridline borders", () => {
    const { container } = render(<Board board={emptyBoard()} currentPiece={null} />);
    const cell = container.firstElementChild!.children[0] as HTMLElement;
    expect(cell.style.border).toBeTruthy();
  });

  it("filled cells use gradient background and glow shadow", () => {
    const board = emptyBoard();
    board[0][0] = "#00f0f0";
    const { container } = render(<Board board={board} currentPiece={null} />);
    const cell = container.firstElementChild!.children[0] as HTMLElement;
    expect(cell.style.background).toContain("linear-gradient");
    expect(cell.style.boxShadow).toBeTruthy();
    expect(cell.style.boxShadow).not.toBe("none");
  });
});
