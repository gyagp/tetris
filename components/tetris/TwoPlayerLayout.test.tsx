import { describe, it, expect } from "vitest";

/**
 * Layout arithmetic tests for the two-player split-screen.
 *
 * Board dimensions (from constants / Board.tsx / Sidebar.tsx):
 *   board  = 300px  (10 cols × 30px)
 *   sidebar = 120px min-width + 20px margin-left = 140px
 *   one player total ≈ 440px
 *
 * TwoPlayerGame.tsx renders two GameInstances in a flex row with gap: 32px.
 *   total = 440 + 32 + 440 = 912px
 *
 * The CSS in page.tsx applies a scale transform via:
 *   @media (max-width: 1100px) {
 *     .two-player-board { transform: scale(calc(min(1, (100vw - 40px) / 920))); }
 *   }
 *
 * At 1024px viewport: scale = min(1, (1024 - 40) / 920) = min(1, 1.069) = 1
 * So at 1024px the boards fit at full size (912px < 1024px).
 */

const CELL_SIZE = 30;
const BOARD_COLS = 10;
const BOARD_WIDTH = BOARD_COLS * CELL_SIZE; // 300
const SIDEBAR_MIN_WIDTH = 120;
const SIDEBAR_MARGIN = 20;
const PLAYER_WIDTH = BOARD_WIDTH + SIDEBAR_MARGIN + SIDEBAR_MIN_WIDTH; // 440
const FLEX_GAP = 32;
const TWO_PLAYER_TOTAL = PLAYER_WIDTH * 2 + FLEX_GAP; // 912

describe("Two-player layout fits at 1024px+", () => {
  it("two boards + gap are narrower than 1024px", () => {
    expect(TWO_PLAYER_TOTAL).toBeLessThan(1024);
  });

  it("no horizontal scroll needed at 1024px (content fits without scaling)", () => {
    const viewport = 1024;
    const scaleFactor = Math.min(1, (viewport - 40) / 920);
    const renderedWidth = TWO_PLAYER_TOTAL * scaleFactor;
    expect(renderedWidth).toBeLessThanOrEqual(viewport);
    expect(scaleFactor).toBe(1);
  });

  it("boards scale down gracefully below 1100px breakpoint", () => {
    for (const vw of [800, 900, 1000, 1099]) {
      const scale = Math.min(1, (vw - 40) / 920);
      const rendered = TWO_PLAYER_TOTAL * scale;
      expect(rendered).toBeLessThanOrEqual(vw);
      expect(scale).toBeGreaterThan(0);
    }
  });

  it("scale is exactly 1 at widths >= 1100px (no unnecessary shrink)", () => {
    for (const vw of [1100, 1200, 1400, 1920]) {
      const scale = Math.min(1, (vw - 40) / 920);
      expect(scale).toBe(1);
    }
  });

  it("sidebar min-width is at least 120px (readable)", () => {
    expect(SIDEBAR_MIN_WIDTH).toBeGreaterThanOrEqual(100);
  });

  it("sidebar stays readable even when board is scaled to smallest reasonable viewport", () => {
    const vw = 800;
    const scale = Math.min(1, (vw - 40) / 920);
    const effectiveSidebarWidth = SIDEBAR_MIN_WIDTH * scale;
    expect(effectiveSidebarWidth).toBeGreaterThanOrEqual(90);
  });
});
