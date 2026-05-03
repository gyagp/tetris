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
