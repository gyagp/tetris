import { render, act, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Sidebar from "./Sidebar";
import { AudioManager } from "@/lib/tetris/audio";
import type { Piece } from "@/lib/tetris/types";

vi.stubGlobal(
  "AudioContext",
  vi.fn(() => ({
    state: "running",
    currentTime: 0,
    sampleRate: 44100,
    destination: {},
    resume: vi.fn(),
    createOscillator: vi.fn(() => ({
      type: "",
      frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createBuffer: vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(4410)) })),
    createBufferSource: vi.fn(() => ({ buffer: null, connect: vi.fn(), start: vi.fn() })),
  }))
);

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

const sidebarProps = { nextPiece: null, holdPiece: null, score: 0, level: 1, lines: 0, highScore: 0 };

describe("Sidebar VolumeControl", () => {
  beforeEach(() => {
    // @ts-expect-error reset singleton
    AudioManager["instance"] = null;
    vi.clearAllMocks();
  });

  it("renders a mute/unmute button in the sidebar", () => {
    render(<Sidebar {...sidebarProps} />);
    expect(screen.getByRole("button", { name: /mute|unmute/i })).toBeInTheDocument();
  });

  it("renders a volume slider with correct range", () => {
    render(<Sidebar {...sidebarProps} />);
    const slider = screen.getByRole("slider", { name: /volume/i });
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "1");
  });

  it("toggles mute state when button is clicked", () => {
    render(<Sidebar {...sidebarProps} />);
    const btn = screen.getByRole("button", { name: /mute/i });
    expect(btn).toHaveAttribute("aria-label", "Mute");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-label", "Unmute");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-label", "Mute");
  });

  it("shows muted icon when muted", () => {
    render(<Sidebar {...sidebarProps} />);
    const btn = screen.getByRole("button", { name: /mute/i });
    expect(btn.textContent).toMatch(/🔉|🔊/);
    fireEvent.click(btn);
    expect(btn.textContent).toBe("🔇");
  });

  it("slider reflects current volume", () => {
    render(<Sidebar {...sidebarProps} />);
    const slider = screen.getByRole("slider", { name: /volume/i }) as HTMLInputElement;
    expect(parseFloat(slider.value)).toBe(1);
  });

  it("changing volume slider updates AudioManager", () => {
    render(<Sidebar {...sidebarProps} />);
    const slider = screen.getByRole("slider", { name: /volume/i });
    fireEvent.change(slider, { target: { value: "0.3" } });
    expect(AudioManager.getInstance().getVolume()).toBeCloseTo(0.3);
  });

  it("slider shows 0 when muted", () => {
    render(<Sidebar {...sidebarProps} />);
    const slider = screen.getByRole("slider", { name: /volume/i }) as HTMLInputElement;
    const btn = screen.getByRole("button", { name: /mute/i });
    fireEvent.click(btn);
    expect(parseFloat(slider.value)).toBe(0);
  });

  it("setting volume > 0 while muted unmutes", () => {
    render(<Sidebar {...sidebarProps} />);
    const btn = screen.getByRole("button", { name: /mute/i });
    const slider = screen.getByRole("slider", { name: /volume/i });
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-label", "Unmute");
    fireEvent.change(slider, { target: { value: "0.5" } });
    expect(btn).toHaveAttribute("aria-label", "Mute");
  });

  it("displays volume icon based on level", () => {
    render(<Sidebar {...sidebarProps} />);
    const btn = screen.getByRole("button", { name: /mute/i });
    const slider = screen.getByRole("slider", { name: /volume/i });
    fireEvent.change(slider, { target: { value: "0.3" } });
    expect(btn.textContent).toBe("🔉");
    fireEvent.change(slider, { target: { value: "0.8" } });
    expect(btn.textContent).toBe("🔊");
  });
});

describe("Sidebar CSS transitions", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  describe("Score, level, and lines update with smooth transitions", () => {
    it("AnimatedValue spans have CSS transition property", () => {
      const { container } = render(
        <Sidebar nextPiece={null} holdPiece={null} score={100} level={1} lines={5} highScore={0} />
      );
      const spans = container.querySelectorAll(".stat-panel div:nth-child(2) span");
      expect(spans.length).toBe(4);
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
      expect(panels.length).toBe(4);
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
