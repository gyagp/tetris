import { describe, it, expect } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Home from "./page";

function getStyleCSS(container: HTMLElement) {
  return container.querySelector("style")?.textContent ?? "";
}

describe("Responsive layout", () => {
  it("outer container has overflow hidden to prevent horizontal scrolling", () => {
    const { container } = render(<Home />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.overflow).toBe("hidden");
  });

  it("game-container class exists for layout", () => {
    const { container } = render(<Home />);
    fireEvent.click(screen.getByText("1 PLAYER"));
    const gameContainer = container.querySelector(".game-container");
    expect(gameContainer).toBeTruthy();
  });

  it("sidebar has game-sidebar class for responsive targeting", () => {
    const { container } = render(<Home />);
    fireEvent.click(screen.getByText("1 PLAYER"));
    const sidebar = container.querySelector(".game-sidebar");
    expect(sidebar).toBeTruthy();
  });

  it("defines media query for small screens (max-width: 500px)", () => {
    const { container } = render(<Home />);
    const css = getStyleCSS(container);
    expect(css).toContain("@media (max-width: 500px)");
    expect(css).toContain("flex-direction: column");
  });

  it("defines scaling for narrow screens (max-width: 480px)", () => {
    const { container } = render(<Home />);
    const css = getStyleCSS(container);
    expect(css).toContain("@media (max-width: 480px)");
    expect(css).toContain("transform: scale(");
  });

  it("defines scaling for minimum supported width (360px)", () => {
    const { container } = render(<Home />);
    const css = getStyleCSS(container);
    expect(css).toContain("@media (max-width: 360px)");
  });

  it("small screen layout stacks sidebar below board with centered wrapping", () => {
    const { container } = render(<Home />);
    const css = getStyleCSS(container);
    expect(css).toContain("flex-direction: column");
    expect(css).toContain("align-items: center");
    expect(css).toContain("flex-wrap: wrap");
    expect(css).toContain("justify-content: center");
  });

  it("small screen sidebar removes left margin", () => {
    const { container } = render(<Home />);
    const css = getStyleCSS(container);
    expect(css).toContain("margin-left: 0");
  });

  it("game-container uses top center transform origin for scaling", () => {
    const { container } = render(<Home />);
    const css = getStyleCSS(container);
    expect(css).toContain("transform-origin: top center");
  });

  it("outer container uses flex centering so content doesn't overflow", () => {
    const { container } = render(<Home />);
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.style.display).toBe("flex");
    expect(outer.style.justifyContent).toBe("center");
  });
});
