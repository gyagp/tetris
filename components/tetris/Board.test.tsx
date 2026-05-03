import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Board from "./Board";
import { BOARD_WIDTH, BOARD_HEIGHT } from "@/lib/tetris/constants";
import type { Board as BoardType, Piece } from "@/lib/tetris/types";

function emptyBoard(): BoardType {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
    position: { x: 4, y: 0 },
    rotationState: 0,
    ...overrides,
  };
}

function getCells(container: HTMLElement): HTMLElement[] {
  const grid = container.firstElementChild as HTMLElement;
  return Array.from(grid.children) as HTMLElement[];
}

describe("Board component", () => {
  it("renders a 10x20 grid (200 cells)", () => {
    const { container } = render(
      <Board board={emptyBoard()} currentPiece={null} />
    );
    const cells = getCells(container);
    expect(cells.length).toBe(BOARD_WIDTH * BOARD_HEIGHT);
  });

  it("renders placed blocks with gradient styling", () => {
    const board = emptyBoard();
    board[19][0] = "#f00000";
    board[19][1] = "#00f000";

    const { container } = render(
      <Board board={board} currentPiece={null} />
    );
    const cells = getCells(container);
    const lastRowStart = 19 * BOARD_WIDTH;

    expect(cells[lastRowStart].style.background).toContain("linear-gradient");
    expect(cells[lastRowStart + 1].style.background).toContain("linear-gradient");
  });

  it("renders empty cells with dark background", () => {
    const { container } = render(
      <Board board={emptyBoard()} currentPiece={null} />
    );
    const cells = getCells(container);
    expect(cells[0].style.background).toBe("rgb(26, 26, 26)");
  });

  it("shows current piece with gradient at its position", () => {
    const piece = makePiece({ position: { x: 0, y: 0 } });
    const { container } = render(
      <Board board={emptyBoard()} currentPiece={piece} />
    );
    const cells = getCells(container);

    expect(cells[0 * BOARD_WIDTH + 0].style.background).toContain("linear-gradient");
    expect(cells[0 * BOARD_WIDTH + 1].style.background).toContain("linear-gradient");
    expect(cells[1 * BOARD_WIDTH + 0].style.background).toContain("linear-gradient");
    expect(cells[1 * BOARD_WIDTH + 1].style.background).toContain("linear-gradient");
    expect(cells[0 * BOARD_WIDTH + 0].style.opacity).toBe("1");
  });

  it("shows ghost piece as translucent (opacity 0.3)", () => {
    const piece = makePiece({ position: { x: 0, y: 0 } });
    const { container } = render(
      <Board board={emptyBoard()} currentPiece={piece} />
    );
    const cells = getCells(container);

    const ghostY = BOARD_HEIGHT - 2;
    const ghostCell = cells[ghostY * BOARD_WIDTH + 0];
    expect(ghostCell.style.background).toBeTruthy();
    expect(ghostCell.style.opacity).toBe("0.3");
  });

  it("current piece overwrites ghost piece when overlapping", () => {
    const piece = makePiece({ position: { x: 0, y: BOARD_HEIGHT - 2 } });
    const { container } = render(
      <Board board={emptyBoard()} currentPiece={piece} />
    );
    const cells = getCells(container);

    const idx = (BOARD_HEIGHT - 2) * BOARD_WIDTH;
    expect(cells[idx].style.opacity).toBe("1");
  });

  it("ghost piece does not overwrite placed blocks", () => {
    const board = emptyBoard();
    board[19][0] = "#f00000";

    const piece = makePiece({ position: { x: 0, y: 0 } });
    const { container } = render(
      <Board board={board} currentPiece={piece} />
    );
    const cells = getCells(container);

    expect(cells[19 * BOARD_WIDTH + 0].style.background).toContain("linear-gradient");
  });
});
