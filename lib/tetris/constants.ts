export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export interface TetrominoDef {
  shape: number[][];
  color: string;
}

export const TETROMINOES: Record<string, TetrominoDef> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00f0f0",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#a000f0",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#00f000",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#f00000",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#0000f0",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#f0a000",
  },
};

export const PIECE_STYLES: Record<string, { gradient: string; glow: string }> = {
  "#00f0f0": { gradient: "linear-gradient(135deg, #66ffff 0%, #00d4d4 40%, #009999 100%)", glow: "0 0 8px #00f0f0, inset 0 0 6px rgba(255,255,255,0.3)" },
  "#f0f000": { gradient: "linear-gradient(135deg, #ffff66 0%, #d4d400 40%, #999900 100%)", glow: "0 0 8px #f0f000, inset 0 0 6px rgba(255,255,255,0.3)" },
  "#a000f0": { gradient: "linear-gradient(135deg, #cc66ff 0%, #9900d4 40%, #660099 100%)", glow: "0 0 8px #a000f0, inset 0 0 6px rgba(255,255,255,0.3)" },
  "#00f000": { gradient: "linear-gradient(135deg, #66ff66 0%, #00d400 40%, #009900 100%)", glow: "0 0 8px #00f000, inset 0 0 6px rgba(255,255,255,0.3)" },
  "#f00000": { gradient: "linear-gradient(135deg, #ff6666 0%, #d40000 40%, #990000 100%)", glow: "0 0 8px #f00000, inset 0 0 6px rgba(255,255,255,0.3)" },
  "#0000f0": { gradient: "linear-gradient(135deg, #6666ff 0%, #0000d4 40%, #000099 100%)", glow: "0 0 8px #0000f0, inset 0 0 6px rgba(255,255,255,0.3)" },
  "#f0a000": { gradient: "linear-gradient(135deg, #ffcc66 0%, #d49000 40%, #996600 100%)", glow: "0 0 8px #f0a000, inset 0 0 6px rgba(255,255,255,0.3)" },
};
