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
    const { container } = render(<Board board={emptyBoard()} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={[]} />);
    const grid = container.firstElementChild as HTMLElement;
    // +1 for the <style> element
    expect(grid.children.length).toBe(BOARD_WIDTH * BOARD_HEIGHT + 1);
  });

  it("board has dark background and box-shadow for polish", () => {
    const { container } = render(<Board board={emptyBoard()} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={[]} />);
    const grid = container.firstElementChild as HTMLElement;
    expect(grid.style.backgroundColor).toBeTruthy();
    expect(grid.style.boxShadow).toBeTruthy();
  });

  it("empty cells have subtle gridline borders", () => {
    const { container } = render(<Board board={emptyBoard()} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={[]} />);
    const cell = container.firstElementChild!.children[1] as HTMLElement;
    expect(cell.style.border).toBeTruthy();
  });

  it("filled cells use gradient background and glow shadow", () => {
    const board = emptyBoard();
    board[0][0] = "#00f0f0";
    const { container } = render(<Board board={board} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={[]} />);
    const cell = container.firstElementChild!.children[1] as HTMLElement;
    expect(cell.style.background).toContain("linear-gradient");
    expect(cell.style.boxShadow).toBeTruthy();
    expect(cell.style.boxShadow).not.toBe("none");
  });
});

describe("Board lock and hard drop animations", () => {
  it("locking cells get lock-pulse animation", () => {
    const board = emptyBoard();
    board[19][0] = "#f0f000";
    board[19][1] = "#f0f000";
    const lockingCells = [{ x: 0, y: 19 }, { x: 1, y: 19 }];
    const { container } = render(
      <Board board={board} currentPiece={null} clearingRows={[]} lockingCells={lockingCells} hardDropTrail={[]} />
    );
    const grid = container.firstElementChild as HTMLElement;
    const cellIdx = 19 * BOARD_WIDTH + 0 + 1;
    const cell = grid.children[cellIdx] as HTMLElement;
    expect(cell.style.animation).toContain("lock-pulse");
  });

  it("non-locking cells do not get lock-pulse animation", () => {
    const board = emptyBoard();
    board[19][0] = "#f0f000";
    const lockingCells = [{ x: 0, y: 19 }];
    const { container } = render(
      <Board board={board} currentPiece={null} clearingRows={[]} lockingCells={lockingCells} hardDropTrail={[]} />
    );
    const grid = container.firstElementChild as HTMLElement;
    const otherCell = grid.children[19 * BOARD_WIDTH + 5 + 1] as HTMLElement;
    expect(otherCell.style.animation).toBe("none");
  });

  it("hard drop trail cells get drop-trail animation on empty cells", () => {
    const trail = [{ x: 3, y: 5, color: "#00f0f0" }];
    const { container } = render(
      <Board board={emptyBoard()} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={trail} />
    );
    const grid = container.firstElementChild as HTMLElement;
    const cell = grid.children[5 * BOARD_WIDTH + 3 + 1] as HTMLElement;
    expect(cell.style.animation).toContain("drop-trail");
  });

  it("hard drop trail does not apply to cells that already have a block", () => {
    const board = emptyBoard();
    board[5][3] = "#f0f000";
    const trail = [{ x: 3, y: 5, color: "#00f0f0" }];
    const { container } = render(
      <Board board={board} currentPiece={null} clearingRows={[]} lockingCells={[]} hardDropTrail={trail} />
    );
    const grid = container.firstElementChild as HTMLElement;
    const cell = grid.children[5 * BOARD_WIDTH + 3 + 1] as HTMLElement;
    expect(cell.style.animation).not.toContain("drop-trail");
  });
});
