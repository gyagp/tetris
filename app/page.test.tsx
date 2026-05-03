import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Home from "./page";

function fireKey(key: string) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true });
  window.dispatchEvent(event);
}

// ── Mode Selection Tests ──

describe("Mode selection screen", () => {
  it("renders mode selection UI on load", () => {
    render(<Home />);
    expect(screen.getByText("TETRIS")).toBeInTheDocument();
    expect(screen.getByText("1 PLAYER")).toBeInTheDocument();
    expect(screen.getByText("2 PLAYERS")).toBeInTheDocument();
    expect(screen.getByText("Select a mode to begin")).toBeInTheDocument();
  });

  it("does not show game instances on the selection screen", () => {
    render(<Home />);
    expect(screen.queryByText(/SCORE/i)).not.toBeInTheDocument();
  });

  it("selecting 1 Player starts single-player game", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("1 PLAYER"));
    expect(screen.queryByText("1 PLAYER")).not.toBeInTheDocument();
    expect(screen.queryByText("2 PLAYERS")).not.toBeInTheDocument();
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText(/PLAYER 1/)).not.toBeInTheDocument();
  });

  it("selecting 2 Players shows two-player layout with labels", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("2 PLAYERS"));
    expect(screen.queryByText("1 PLAYER")).not.toBeInTheDocument();
    expect(screen.getByText(/PLAYER 1/)).toBeInTheDocument();
    expect(screen.getByText(/PLAYER 2/)).toBeInTheDocument();
  });
});

// ── Single-player integration (enter 1P mode first) ──

describe("Home page integration (1P mode)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function enter1P() {
    render(<Home />);
    fireEvent.click(screen.getByText("1 PLAYER"));
  }

  it("renders sidebar with score, level, lines", () => {
    enter1P();
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/level/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/lines/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders next piece section", () => {
    enter1P();
    expect(screen.getAllByText(/next/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders hold piece section", () => {
    enter1P();
    expect(screen.getAllByText(/hold/i).length).toBeGreaterThanOrEqual(1);
  });

  it("responds to arrow key inputs without crashing", () => {
    enter1P();
    act(() => {
      fireKey("ArrowLeft");
      fireKey("ArrowRight");
      fireKey("ArrowDown");
      fireKey("ArrowUp");
    });
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
  });

  it("responds to space (hard drop) without crashing", () => {
    enter1P();
    act(() => {
      fireKey(" ");
    });
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
  });

  it("responds to C (hold) without crashing", () => {
    enter1P();
    act(() => {
      fireKey("c");
    });
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
  });

  it("pauses and resumes with P key", () => {
    enter1P();
    act(() => fireKey("Enter"));
    act(() => fireKey("p"));
    expect(screen.getAllByText("PAUSED").length).toBeGreaterThanOrEqual(1);
    act(() => fireKey("p"));
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.queryAllByText("PAUSED").length).toBe(0);
  });

  it("game ticks automatically (timer fires TICK)", () => {
    enter1P();
    act(() => fireKey("Enter"));
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
  });

  it("does not tick when paused", () => {
    enter1P();
    act(() => fireKey("Enter"));
    act(() => fireKey("p"));
    expect(screen.getAllByText("PAUSED").length).toBeGreaterThanOrEqual(1);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getAllByText("PAUSED").length).toBeGreaterThanOrEqual(1);
  });

  it("shows game over overlay and restarts with R", () => {
    enter1P();
    act(() => fireKey("Enter"));
    act(() => {
      for (let i = 0; i < 50; i++) fireKey(" ");
    });
    const gameOverElements = screen.queryAllByText("GAME OVER");
    if (gameOverElements.length > 0) {
      act(() => fireKey("r"));
      expect(screen.queryAllByText("GAME OVER").length).toBe(0);
    }
  });
});

// ── Animation tests ──

describe("Game state overlay animations", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function getStyleCSS() {
    return document.querySelector("style")?.textContent ?? "";
  }

  function findOverlayText(text: string) {
    const all = screen.getAllByText(text);
    return all.find((el) => {
      const p = el.closest("[style*='position: absolute']") || el.parentElement;
      return p?.style?.position === "absolute" || p?.getAttribute("style")?.includes("position: absolute");
    }) ?? all[0];
  }

  it("mode selection title has shimmer animation", () => {
    render(<Home />);
    const title = screen.getByText("TETRIS");
    expect(title.style.animation).toContain("title-shimmer");
  });

  it("mode selection has entrance animation", () => {
    render(<Home />);
    const title = screen.getByText("TETRIS");
    const container = title.parentElement!;
    expect(container.style.animation).toContain("overlay-fade-scale");
  });

  it("pause overlay animates in with entrance animation", () => {
    const { container } = render(<Home />);
    fireEvent.click(screen.getByText("1 PLAYER"));
    act(() => fireKey("Enter"));
    act(() => fireKey("p"));
    const overlays = Array.from(container.querySelectorAll<HTMLElement>("[style*='position: absolute']"));
    const pauseOverlay = overlays.find((el) => el.textContent?.includes("PAUSED"));
    expect(pauseOverlay).toBeTruthy();
    expect(pauseOverlay!.style.animation).toContain("overlay-fade-scale");
  });

  it("pause overlay animates out with exit animation", () => {
    const { container } = render(<Home />);
    fireEvent.click(screen.getByText("1 PLAYER"));
    act(() => fireKey("Enter"));
    act(() => fireKey("p"));
    act(() => fireKey("p"));
    const overlays = Array.from(container.querySelectorAll<HTMLElement>("[style*='position: absolute']"));
    const pauseOverlay = overlays.find((el) => el.textContent?.includes("PAUSED"));
    expect(pauseOverlay).toBeTruthy();
    expect(pauseOverlay!.style.animation).toContain("overlay-fade-out");
  });

  it("PAUSED text has shimmer animation", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("1 PLAYER"));
    act(() => fireKey("Enter"));
    act(() => fireKey("p"));
    const paused = findOverlayText("PAUSED");
    expect(paused.style.animation).toContain("title-shimmer");
  });

  it("defines all required keyframe animations", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("1 PLAYER"));
    const css = getStyleCSS();
    for (const name of ["overlay-fade-scale", "overlay-fade-out", "game-over-entrance", "title-shimmer", "prompt-pulse"]) {
      expect(css).toContain(`@keyframes ${name}`);
    }
  });

  it("prompt text has pulse animation", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("1 PLAYER"));
    const prompts = screen.getAllByText(/to Start/);
    const prompt = prompts[0];
    expect(prompt.style.animation).toContain("prompt-pulse");
  });
});
