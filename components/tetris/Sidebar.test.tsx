import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Sidebar from "./Sidebar";
import type { Piece } from "@/lib/tetris/types";

const T_PIECE: Piece = {
  shape: [[0, 1, 0], [1, 1, 1]],
  color: "purple",
  position: { x: 0, y: 0 },
};

const I_PIECE: Piece = {
  shape: [[1, 1, 1, 1]],
  color: "cyan",
  position: { x: 0, y: 0 },
};

describe("Sidebar CSS transitions", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  describe("Score, level, and lines update with smooth transitions", () => {
    it("AnimatedValue spans have CSS transition property", () => {
      const { container } = render(
        <Sidebar nextPiece={null} holdPiece={null} score={100} level={1} lines={5} />
      );
      const spans = container.querySelectorAll(".stat-panel div:nth-child(2) span");
      expect(spans.length).toBe(3);
      spans.forEach((span) => {
        const el = span as HTMLElement;
        expect(el.style.transition).toContain("transform");
        expect(el.style.transition).toContain("0.15s");
      });
    });

    it("AnimatedValue scales up on value change then returns", () => {
      const { container, rerender } = render(
        <Sidebar nextPiece={null} holdPiece={null} score={0} level={1} lines={0} />
      );
      const scoreSpan = container.querySelector(".stat-panel div:nth-child(2) span") as HTMLElement;
      expect(scoreSpan.style.transform).toBe("scale(1)");

      rerender(<Sidebar nextPiece={null} holdPiece={null} score={100} level={1} lines={0} />);
      expect(scoreSpan.style.transform).toBe("scale(1.2)");

      act(() => { vi.advanceTimersByTime(200); });
      expect(scoreSpan.style.transform).toBe("scale(1)");
    });
  });

  describe("Hold and next piece previews transition smoothly", () => {
    it("PiecePreview has transform transition", () => {
      const { container } = render(
        <Sidebar nextPiece={T_PIECE} holdPiece={null} score={0} level={1} lines={0} />
      );
      const previews = container.querySelectorAll(".piece-preview");
      previews.forEach((el) => {
        expect((el as HTMLElement).style.transition).toContain("transform 0.2s");
      });
    });

    it("PiecePreview scales down on piece change then restores", () => {
      const { container, rerender } = render(
        <Sidebar nextPiece={T_PIECE} holdPiece={null} score={0} level={1} lines={0} />
      );
      const next = container.querySelectorAll(".piece-preview")[1] as HTMLElement;
      expect(next.style.transform).toBe("scale(1)");

      rerender(<Sidebar nextPiece={I_PIECE} holdPiece={null} score={0} level={1} lines={0} />);
      expect(next.style.transform).toBe("scale(0.85)");

      act(() => { vi.advanceTimersByTime(250); });
      expect(next.style.transform).toBe("scale(1)");
    });

    it("mini-grid cells have background/box-shadow transitions", () => {
      const { container } = render(
        <Sidebar nextPiece={T_PIECE} holdPiece={null} score={0} level={1} lines={0} />
      );
      const cells = container.querySelectorAll(".piece-preview div");
      let foundTransition = false;
      cells.forEach((cell) => {
        const t = (cell as HTMLElement).style.transition;
        if (t && t.includes("background")) {
          expect(t).toContain("box-shadow");
          foundTransition = true;
        }
      });
      expect(foundTransition).toBe(true);
    });
  });

  describe("Interactive elements have hover/focus transitions", () => {
    it("stat panels have border-color and box-shadow transition", () => {
      const { container } = render(
        <Sidebar nextPiece={null} holdPiece={null} score={0} level={1} lines={0} />
      );
      const panels = container.querySelectorAll(".stat-panel");
      expect(panels.length).toBe(3);
      panels.forEach((panel) => {
        const t = (panel as HTMLElement).style.transition;
        expect(t).toContain("border-color");
        expect(t).toContain("box-shadow");
      });
    });

    it("has hover CSS rules for stat-panel and piece-preview", () => {
      const { container } = render(
        <Sidebar nextPiece={null} holdPiece={null} score={0} level={1} lines={0} />
      );
      const css = container.querySelector("style")!.textContent!;
      expect(css).toContain(".stat-panel:hover");
      expect(css).toContain(".piece-preview:hover");
    });
  });
});
