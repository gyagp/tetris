import { describe, it, expect } from "vitest";
import { TETROMINOES, PIECE_STYLES } from "../constants";

describe("PIECE_STYLES", () => {
  const allColors = Object.values(TETROMINOES).map((t) => t.color);

  it("every tetromino color has a corresponding style entry", () => {
    for (const color of allColors) {
      expect(PIECE_STYLES[color]).toBeDefined();
    }
  });

  it("all 7 tetromino types have distinct colors", () => {
    const unique = new Set(allColors);
    expect(unique.size).toBe(7);
  });

  it("each style has a gradient with linear-gradient", () => {
    for (const color of allColors) {
      expect(PIECE_STYLES[color].gradient).toMatch(/^linear-gradient\(/);
    }
  });

  it("each style has a glow with box-shadow syntax", () => {
    for (const color of allColors) {
      const glow = PIECE_STYLES[color].glow;
      expect(glow).toContain("0 0");
      expect(glow).toContain("px");
    }
  });

  it("each gradient uses multiple color stops for depth effect", () => {
    for (const color of allColors) {
      const stops = PIECE_STYLES[color].gradient.match(/%/g);
      expect(stops!.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("each glow includes an inset shadow for shine effect", () => {
    for (const color of allColors) {
      expect(PIECE_STYLES[color].glow).toContain("inset");
    }
  });
});
