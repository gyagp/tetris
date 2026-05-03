import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

import { metadata } from "./layout";

describe("Page metadata", () => {
  it("has a game-specific title", () => {
    expect(metadata.title).toMatch(/tetris/i);
  });

  it("has a game-relevant description", () => {
    expect(metadata.description).toBeTruthy();
    expect(typeof metadata.description).toBe("string");
    expect((metadata.description as string).length).toBeGreaterThan(10);
  });

  it("has og:title", () => {
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og).toBeDefined();
    expect(og.title).toMatch(/tetris/i);
  });

  it("has og:description", () => {
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og).toBeDefined();
    expect(og.description).toBeTruthy();
  });

  it("has og:image", () => {
    const og = metadata.openGraph as Record<string, unknown>;
    expect(og).toBeDefined();
    expect(og.images).toBeDefined();
    const images = og.images as string[];
    expect(images.length).toBeGreaterThan(0);
  });
});
