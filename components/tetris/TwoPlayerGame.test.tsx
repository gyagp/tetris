import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import React from "react";
import TwoPlayerGame from "./TwoPlayerGame";

let capturedOnGameOver: Record<string, (() => void) | undefined> = {};
let capturedForceGameOver: Record<string, (() => void) | undefined> = {};

vi.mock("@/components/tetris/GameInstance", () => {
  const React = require("react");
  return {
    default: React.forwardRef(function MockGameInstance(
      props: { label: string; onGameOver?: () => void },
      ref: React.Ref<{ sendGarbage: () => void; forceGameOver: () => void }>
    ) {
      const key = props.label.includes("1") ? "p1" : "p2";
      capturedOnGameOver[key] = props.onGameOver;
      React.useImperativeHandle(ref, () => ({
        sendGarbage: vi.fn(),
        forceGameOver: () => {
          capturedForceGameOver[key]?.();
        },
      }));
      capturedForceGameOver[key] = undefined;
      return <div data-testid={`game-${key}`}>{props.label}</div>;
    }),
  };
});

describe("TwoPlayerGame", () => {
  beforeEach(() => {
    capturedOnGameOver = {};
    capturedForceGameOver = {};
  });

  it("renders two GameInstance components", () => {
    render(<TwoPlayerGame />);
    expect(screen.getByTestId("game-p1")).toBeInTheDocument();
    expect(screen.getByTestId("game-p2")).toBeInTheDocument();
  });

  it("shows no victory screen initially", () => {
    render(<TwoPlayerGame />);
    expect(screen.queryByText(/WINS!/)).not.toBeInTheDocument();
  });

  it("shows Player 2 wins when Player 1 tops out", () => {
    render(<TwoPlayerGame />);
    act(() => capturedOnGameOver["p1"]?.());
    expect(screen.getByText("PLAYER 2 WINS!")).toBeInTheDocument();
    expect(screen.getByText(/Player 1 topped out/)).toBeInTheDocument();
  });

  it("shows Player 1 wins when Player 2 tops out", () => {
    render(<TwoPlayerGame />);
    act(() => capturedOnGameOver["p2"]?.());
    expect(screen.getByText("PLAYER 1 WINS!")).toBeInTheDocument();
    expect(screen.getByText(/Player 2 topped out/)).toBeInTheDocument();
  });

  it("only first game-over triggers winner (no double-trigger)", () => {
    render(<TwoPlayerGame />);
    act(() => capturedOnGameOver["p1"]?.());
    act(() => capturedOnGameOver["p2"]?.());
    expect(screen.getByText("PLAYER 2 WINS!")).toBeInTheDocument();
    expect(screen.queryByText("PLAYER 1 WINS!")).not.toBeInTheDocument();
  });

  it("shows PLAY AGAIN button on victory screen", () => {
    render(<TwoPlayerGame />);
    act(() => capturedOnGameOver["p1"]?.());
    expect(screen.getByText("PLAY AGAIN")).toBeInTheDocument();
  });

  it("shows BACK TO MENU button when onBackToMenu is provided", () => {
    const onBack = vi.fn();
    render(<TwoPlayerGame onBackToMenu={onBack} />);
    act(() => capturedOnGameOver["p1"]?.());
    expect(screen.getByText("BACK TO MENU")).toBeInTheDocument();
  });

  it("does not show BACK TO MENU when onBackToMenu is not provided", () => {
    render(<TwoPlayerGame />);
    act(() => capturedOnGameOver["p1"]?.());
    expect(screen.queryByText("BACK TO MENU")).not.toBeInTheDocument();
  });

  it("PLAY AGAIN dismisses victory screen and resets", () => {
    render(<TwoPlayerGame />);
    act(() => capturedOnGameOver["p1"]?.());
    fireEvent.click(screen.getByText("PLAY AGAIN"));
    expect(screen.queryByText(/WINS!/)).not.toBeInTheDocument();
    expect(screen.getByTestId("game-p1")).toBeInTheDocument();
  });

  it("BACK TO MENU calls onBackToMenu", () => {
    const onBack = vi.fn();
    render(<TwoPlayerGame onBackToMenu={onBack} />);
    act(() => capturedOnGameOver["p1"]?.());
    fireEvent.click(screen.getByText("BACK TO MENU"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
