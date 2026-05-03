import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Sidebar from "./Sidebar";
import type { Piece } from "@/lib/tetris/types";

afterEach(cleanup);

const T_PIECE: Piece = {
  shape: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  color: "#a020f0",
  position: { x: 3, y: 0 },
};

const I_PIECE: Piece = {
  shape: [[1, 1, 1, 1]],
  color: "#00f0f0",
  position: { x: 3, y: 0 },
};

function queryByTextContent(container: HTMLElement, text: string): HTMLElement | null {
  const all = container.querySelectorAll("div");
  for (const el of all) {
    if (el.textContent === text && el.children.length === 0) return el;
  }
  return null;
}

describe("Sidebar", () => {
  it("renders score, level, and lines", () => {
    const { container } = render(
      <Sidebar nextPiece={null} holdPiece={null} score={1200} level={3} lines={15} />
    );
    expect(queryByTextContent(container, "Score")).toBeInTheDocument();
    expect(queryByTextContent(container, "1200")).toBeInTheDocument();
    expect(queryByTextContent(container, "Level")).toBeInTheDocument();
    expect(queryByTextContent(container, "3")).toBeInTheDocument();
    expect(queryByTextContent(container, "Lines")).toBeInTheDocument();
    expect(queryByTextContent(container, "15")).toBeInTheDocument();
  });

  it("renders next and hold piece labels", () => {
    const { container } = render(
      <Sidebar nextPiece={T_PIECE} holdPiece={I_PIECE} score={0} level={1} lines={0} />
    );
    expect(queryByTextContent(container, "Next")).toBeInTheDocument();
    expect(queryByTextContent(container, "Hold")).toBeInTheDocument();
  });

  it("renders colored cells for next piece in mini grid", () => {
    const { container } = render(
      <Sidebar nextPiece={T_PIECE} holdPiece={null} score={0} level={1} lines={0} />
    );
    const nextLabel = queryByTextContent(container, "Next")!;
    const grid = nextLabel.nextElementSibling!;
    const cells = grid.children;
    expect(cells).toHaveLength(6); // T-piece: 2x3
    const filled = Array.from(cells).filter(
      (c) => (c as HTMLElement).style.backgroundColor !== "rgb(26, 26, 26)"
    );
    expect(filled).toHaveLength(4);
  });

  it("renders colored cells for hold piece in mini grid", () => {
    const { container } = render(
      <Sidebar nextPiece={null} holdPiece={I_PIECE} score={0} level={1} lines={0} />
    );
    const holdLabel = queryByTextContent(container, "Hold")!;
    const grid = holdLabel.nextElementSibling!;
    const cells = grid.children;
    expect(cells).toHaveLength(4); // I-piece: 1x4
    const filled = Array.from(cells).filter(
      (c) => (c as HTMLElement).style.backgroundColor !== "rgb(26, 26, 26)"
    );
    expect(filled).toHaveLength(4);
  });

  it("renders empty mini grids when pieces are null", () => {
    const { container } = render(
      <Sidebar nextPiece={null} holdPiece={null} score={0} level={1} lines={0} />
    );
    const grids = container.querySelectorAll("div[style*='inline-grid']");
    expect(grids).toHaveLength(2);
    expect(grids[0].children).toHaveLength(8); // 2x4 default
    expect(grids[1].children).toHaveLength(8);
  });

  it("displays zero score correctly", () => {
    const { container } = render(
      <Sidebar nextPiece={null} holdPiece={null} score={0} level={1} lines={0} />
    );
    const scoreLabel = queryByTextContent(container, "Score")!;
    expect(scoreLabel).toBeInTheDocument();
    const scoreValue = scoreLabel.nextElementSibling!;
    expect(scoreValue.textContent).toBe("0");
  });
});
