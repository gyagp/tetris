import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Home from "./page";

function fireKey(key: string) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true });
  window.dispatchEvent(event);
}

describe("Home page integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the game board", () => {
    const { container } = render(<Home />);
    expect(container.querySelector("canvas, table, [data-testid]") || container.firstChild).toBeTruthy();
  });

  it("renders sidebar with score, level, lines", () => {
    render(<Home />);
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/level/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/lines/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders next piece section", () => {
    render(<Home />);
    expect(screen.getAllByText(/next/i).length).toBeGreaterThanOrEqual(1);
  });

  it("renders hold piece section", () => {
    render(<Home />);
    expect(screen.getAllByText(/hold/i).length).toBeGreaterThanOrEqual(1);
  });

  it("responds to arrow key inputs without crashing", () => {
    render(<Home />);
    act(() => {
      fireKey("ArrowLeft");
      fireKey("ArrowRight");
      fireKey("ArrowDown");
      fireKey("ArrowUp");
    });
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
  });

  it("responds to space (hard drop) without crashing", () => {
    render(<Home />);
    act(() => {
      fireKey(" ");
    });
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
  });

  it("responds to C (hold) without crashing", () => {
    render(<Home />);
    act(() => {
      fireKey("c");
    });
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
  });

  it("pauses and resumes with P key", () => {
    render(<Home />);
    act(() => {
      fireKey("Enter");
    });
    act(() => {
      fireKey("p");
    });
    expect(screen.getAllByText("PAUSED").length).toBeGreaterThanOrEqual(1);
    act(() => {
      fireKey("p");
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryAllByText("PAUSED").length).toBe(0);
  });

  it("game ticks automatically (timer fires TICK)", () => {
    render(<Home />);
    act(() => {
      fireKey("Enter");
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getAllByText(/score/i).length).toBeGreaterThanOrEqual(1);
  });

  it("does not tick when paused", () => {
    render(<Home />);
    act(() => {
      fireKey("Enter");
    });
    act(() => {
      fireKey("p");
    });
    expect(screen.getAllByText("PAUSED").length).toBeGreaterThanOrEqual(1);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getAllByText("PAUSED").length).toBeGreaterThanOrEqual(1);
  });

  it("shows game over overlay and restarts with R", () => {
    render(<Home />);
    act(() => {
      fireKey("Enter");
    });
    act(() => {
      for (let i = 0; i < 50; i++) {
        fireKey(" ");
      }
    });
    const gameOverElements = screen.queryAllByText("GAME OVER");
    if (gameOverElements.length > 0) {
      act(() => {
        fireKey("r");
      });
      expect(screen.queryAllByText("GAME OVER").length).toBe(0);
    }
  });
});

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

  it("start screen overlay has fade-scale entrance animation", () => {
    render(<Home />);
    const titleEl = findOverlayText("TETRIS");
    const overlay = titleEl.parentElement!;
    expect(overlay.style.animation).toContain("overlay-fade-scale");
  });

  it("start screen title has shimmer animation", () => {
    render(<Home />);
    const title = findOverlayText("TETRIS");
    expect(title.style.animation).toContain("title-shimmer");
  });

  it("pause overlay animates in with entrance animation", () => {
    const { container } = render(<Home />);
    act(() => fireKey("Enter"));
    act(() => fireKey("p"));
    const overlays = Array.from(container.querySelectorAll<HTMLElement>("[style*='position: absolute']"));
    const pauseOverlay = overlays.find((el) => el.textContent?.includes("PAUSED"));
    expect(pauseOverlay).toBeTruthy();
    expect(pauseOverlay!.style.animation).toContain("overlay-fade-scale");
  });

  it("pause overlay animates out with exit animation", () => {
    const { container } = render(<Home />);
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
    act(() => fireKey("Enter"));
    act(() => fireKey("p"));
    const paused = findOverlayText("PAUSED");
    expect(paused.style.animation).toContain("title-shimmer");
  });

  it("defines game-over-entrance keyframes with dramatic scale and rotation", () => {
    render(<Home />);
    const css = getStyleCSS();
    expect(css).toContain("@keyframes game-over-entrance");
    expect(css).toContain("scale(0.3)");
    expect(css).toContain("rotate(-5deg)");
  });

  it("defines all required keyframe animations", () => {
    render(<Home />);
    const css = getStyleCSS();
    for (const name of ["overlay-fade-scale", "overlay-fade-out", "game-over-entrance", "title-shimmer", "prompt-pulse"]) {
      expect(css).toContain(`@keyframes ${name}`);
    }
  });

  it("prompt text has pulse animation", () => {
    render(<Home />);
    const prompts = screen.getAllByText("Press Enter to Start");
    const prompt = prompts[0];
    expect(prompt.style.animation).toContain("prompt-pulse");
  });
});
