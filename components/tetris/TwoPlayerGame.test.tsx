import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import TwoPlayerGame from "./TwoPlayerGame";

vi.mock("@/components/tetris/Board", () => ({
  default: ({ board }: { board: unknown[][] }) => (
    <div data-testid="board">{JSON.stringify(board?.length)}</div>
  ),
}));

vi.mock("@/components/tetris/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));

describe("TwoPlayerGame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders two GameInstance components (two boards side by side)", () => {
    render(<TwoPlayerGame />);
    const boards = screen.getAllByTestId("board");
    expect(boards).toHaveLength(2);
  });

  it("displays player labels", () => {
    render(<TwoPlayerGame />);
    expect(screen.getByText(/PLAYER 1/)).toBeInTheDocument();
    expect(screen.getByText(/PLAYER 2/)).toBeInTheDocument();
  });

  it("renders in a flex layout for side-by-side display", () => {
    const { container } = render(<TwoPlayerGame />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.display).toBe("flex");
  });

  it("each instance has its own sidebar (independent state)", () => {
    render(<TwoPlayerGame />);
    const sidebars = screen.getAllByTestId("sidebar");
    expect(sidebars).toHaveLength(2);
  });
});
