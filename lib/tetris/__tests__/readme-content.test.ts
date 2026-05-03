import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("README.md content verification", () => {
  const readmePath = path.resolve(__dirname, "../../../README.md");
  const readmeContent = fs.readFileSync(readmePath, "utf-8");

  it("includes a game description", () => {
    expect(readmeContent).toMatch(/tetris/i);
    expect(readmeContent).toMatch(/game/i);
    expect(readmeContent).toMatch(/next\.?js|react/i);
  });

  it("includes a controls section", () => {
    expect(readmeContent).toMatch(/## Controls/);
    expect(readmeContent).toMatch(/move left/i);
    expect(readmeContent).toMatch(/move right/i);
    expect(readmeContent).toMatch(/hard drop/i);
    expect(readmeContent).toMatch(/rotate/i);
  });

  it("includes a features section", () => {
    expect(readmeContent).toMatch(/## Features/);
  });

  it("includes deployment instructions", () => {
    expect(readmeContent).toMatch(/npm install/);
    expect(readmeContent).toMatch(/npm run build/);
    expect(readmeContent).toMatch(/npm start/);
  });
});
