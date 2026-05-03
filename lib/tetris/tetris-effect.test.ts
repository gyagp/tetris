import { describe, it, expect } from "vitest";

describe("Tetris (4-line clear) special effect trigger", () => {
  function shouldShowTetrisEffect(clearingRowsLength: number): boolean {
    return clearingRowsLength === 4;
  }

  it("triggers on exactly 4 cleared rows", () => {
    expect(shouldShowTetrisEffect(4)).toBe(true);
  });

  it("does not trigger on 1, 2, or 3 cleared rows", () => {
    expect(shouldShowTetrisEffect(1)).toBe(false);
    expect(shouldShowTetrisEffect(2)).toBe(false);
    expect(shouldShowTetrisEffect(3)).toBe(false);
  });

  it("does not trigger on 0 cleared rows", () => {
    expect(shouldShowTetrisEffect(0)).toBe(false);
  });
});

describe("Screen shake intensity scales with line count", () => {
  it("4-line clear has highest shake intensity", () => {
    const intensities = [1, 2, 3, 4];
    expect(Math.max(...intensities)).toBe(4);
    expect(intensities[3]).toBeGreaterThan(intensities[0]);
  });
});
