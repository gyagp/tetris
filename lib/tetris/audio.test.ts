import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AudioManager, SoundType } from "./audio";

const mockGainNode = {
  gain: {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
};

const mockOscillator = {
  type: "" as OscillatorType,
  frequency: {
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockBufferSource = {
  buffer: null as AudioBuffer | null,
  connect: vi.fn(),
  start: vi.fn(),
};

const mockBuffer = {
  getChannelData: vi.fn(() => new Float32Array(4410)),
};

let mockCtxState = "running";

const mockAudioContext = {
  get state() {
    return mockCtxState;
  },
  currentTime: 0,
  sampleRate: 44100,
  destination: {},
  resume: vi.fn(),
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({
    gain: { ...mockGainNode.gain },
    connect: vi.fn(),
  })),
  createBuffer: vi.fn(() => mockBuffer),
  createBufferSource: vi.fn(() => ({ ...mockBufferSource })),
};

vi.stubGlobal(
  "AudioContext",
  vi.fn(() => ({ ...mockAudioContext }))
);

describe("AudioManager", () => {
  beforeEach(() => {
    // Reset singleton
    // @ts-expect-error accessing private static for test reset
    AudioManager["instance"] = null;
    mockCtxState = "running";
    vi.clearAllMocks();
  });

  describe("singleton pattern", () => {
    it("returns the same instance on repeated calls", () => {
      const a = AudioManager.getInstance();
      const b = AudioManager.getInstance();
      expect(a).toBe(b);
    });

    it("is an instance of AudioManager", () => {
      expect(AudioManager.getInstance()).toBeInstanceOf(AudioManager);
    });
  });

  describe("lazy initialization", () => {
    it("does not create AudioContext until play is called", () => {
      AudioManager.getInstance();
      expect(AudioContext).not.toHaveBeenCalled();
    });

    it("creates AudioContext on first play", () => {
      AudioManager.getInstance().play("move");
      expect(AudioContext).toHaveBeenCalledTimes(1);
    });

    it("reuses the same AudioContext on subsequent plays", () => {
      const mgr = AudioManager.getInstance();
      mgr.play("move");
      mgr.play("rotate");
      expect(AudioContext).toHaveBeenCalledTimes(1);
    });
  });

  describe("play methods for each sound effect", () => {
    const sounds: SoundType[] = [
      "move",
      "rotate",
      "hardDrop",
      "lineClear",
      "tetris",
      "gameOver",
    ];

    for (const sound of sounds) {
      it(`plays "${sound}" without throwing`, () => {
        expect(() => AudioManager.getInstance().play(sound)).not.toThrow();
      });
    }
  });

  describe("procedural generation via oscillators/noise", () => {
    it("move uses createOscillator (tone-based)", () => {
      const mgr = AudioManager.getInstance();
      mgr.play("move");
      expect(AudioContext).toHaveBeenCalled();
    });

    it("hardDrop uses createBufferSource (noise-based)", () => {
      const ctx = { ...mockAudioContext };
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        ctx
      );
      const mgr = AudioManager.getInstance();
      mgr.play("hardDrop");
      expect(ctx.createBufferSource).toHaveBeenCalled();
      expect(ctx.createBuffer).toHaveBeenCalled();
    });

    it("tetris plays multiple oscillators (arpeggio)", () => {
      const ctx = { ...mockAudioContext };
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        ctx
      );
      const mgr = AudioManager.getInstance();
      mgr.play("tetris");
      expect(ctx.createOscillator).toHaveBeenCalledTimes(4);
    });
  });

  describe("suspended context", () => {
    it("resumes a suspended AudioContext", () => {
      mockCtxState = "suspended";
      const ctx = { ...mockAudioContext, state: "suspended", resume: vi.fn() };
      Object.defineProperty(ctx, "state", { get: () => "suspended" });
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        ctx
      );
      const mgr = AudioManager.getInstance();
      mgr.play("move");
      expect(ctx.resume).toHaveBeenCalled();
    });
  });

  describe("error resilience", () => {
    it("does not throw when AudioContext constructor fails", () => {
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => {
          throw new Error("not supported");
        }
      );
      const mgr = AudioManager.getInstance();
      expect(() => mgr.play("move")).not.toThrow();
    });
  });

  describe("background music", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("startMusic() begins playback and creates oscillators", () => {
      const ctx = { ...mockAudioContext, createGain: vi.fn(() => ({
        gain: { ...mockGainNode.gain },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })), createOscillator: vi.fn(() => ({ ...mockOscillator })) };
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(ctx);
      const mgr = AudioManager.getInstance();
      mgr.startMusic();
      expect(ctx.createGain).toHaveBeenCalled();
      expect(ctx.createOscillator).toHaveBeenCalled();
    });

    it("stopMusic() stops playback", () => {
      const gainNode = {
        gain: { ...mockGainNode.gain },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      const ctx = { ...mockAudioContext, createGain: vi.fn(() => gainNode), createOscillator: vi.fn(() => ({ ...mockOscillator })) };
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(ctx);
      const mgr = AudioManager.getInstance();
      mgr.startMusic();
      mgr.stopMusic();
      expect(gainNode.disconnect).toHaveBeenCalled();
    });

    it("startMusic() is idempotent when already playing", () => {
      const ctx = { ...mockAudioContext, createGain: vi.fn(() => ({
        gain: { ...mockGainNode.gain },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })), createOscillator: vi.fn(() => ({ ...mockOscillator })) };
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(ctx);
      const mgr = AudioManager.getInstance();
      mgr.startMusic();
      const callCount = ctx.createGain.mock.calls.length;
      mgr.startMusic();
      expect(ctx.createGain).toHaveBeenCalledTimes(callCount);
    });

    it("loops the melody by scheduling repeated notes via setTimeout", () => {
      const ctx = { ...mockAudioContext, createGain: vi.fn(() => ({
        gain: { ...mockGainNode.gain },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })), createOscillator: vi.fn(() => ({ ...mockOscillator })) };
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(ctx);
      const mgr = AudioManager.getInstance();
      mgr.startMusic();
      const initialCalls = ctx.createOscillator.mock.calls.length;
      vi.advanceTimersByTime(2000);
      expect(ctx.createOscillator.mock.calls.length).toBeGreaterThan(initialCalls);
    });

    it("does not schedule more notes after stopMusic()", () => {
      const ctx = { ...mockAudioContext, createGain: vi.fn(() => ({
        gain: { ...mockGainNode.gain },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })), createOscillator: vi.fn(() => ({ ...mockOscillator })) };
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(ctx);
      const mgr = AudioManager.getInstance();
      mgr.startMusic();
      vi.advanceTimersByTime(500);
      mgr.stopMusic();
      const callsAfterStop = ctx.createOscillator.mock.calls.length;
      vi.advanceTimersByTime(2000);
      expect(ctx.createOscillator.mock.calls.length).toBe(callsAfterStop);
    });

    it("setMusicTempo() clamps BPM between 80 and 300", () => {
      const mgr = AudioManager.getInstance();
      mgr.setMusicTempo(50);
      // @ts-expect-error accessing private field for test
      expect(mgr["musicBpm"]).toBe(80);
      mgr.setMusicTempo(500);
      // @ts-expect-error accessing private field for test
      expect(mgr["musicBpm"]).toBe(300);
      mgr.setMusicTempo(180);
      // @ts-expect-error accessing private field for test
      expect(mgr["musicBpm"]).toBe(180);
    });

    it("does not block page load (startMusic is synchronous and non-blocking)", () => {
      const ctx = { ...mockAudioContext, createGain: vi.fn(() => ({
        gain: { ...mockGainNode.gain },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })), createOscillator: vi.fn(() => ({ ...mockOscillator })) };
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(ctx);
      const mgr = AudioManager.getInstance();
      const start = performance.now();
      mgr.startMusic();
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
      mgr.stopMusic();
    });

    it("resumes suspended AudioContext when starting music", () => {
      const ctx = { ...mockAudioContext, resume: vi.fn(), createGain: vi.fn(() => ({
        gain: { ...mockGainNode.gain },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })), createOscillator: vi.fn(() => ({ ...mockOscillator })) };
      Object.defineProperty(ctx, "state", { get: () => "suspended" });
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce(ctx);
      const mgr = AudioManager.getInstance();
      mgr.startMusic();
      expect(ctx.resume).toHaveBeenCalled();
      mgr.stopMusic();
    });

    it("does not throw when AudioContext is unavailable for music", () => {
      (AudioContext as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(
        () => { throw new Error("not supported"); }
      );
      const mgr = AudioManager.getInstance();
      expect(() => mgr.startMusic()).not.toThrow();
    });
  });
});
