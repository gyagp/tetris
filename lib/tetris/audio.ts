type SoundType = "move" | "rotate" | "hardDrop" | "lineClear" | "tetris" | "gameOver";

class AudioManager {
  private static instance: AudioManager | null = null;
  private ctx: AudioContext | null = null;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  play(sound: SoundType): void {
    try {
      const ctx = this.getContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      switch (sound) {
        case "move":
          this.playTone(ctx, 200, 0.05, "square", 0.15);
          break;
        case "rotate":
          this.playTone(ctx, 300, 0.08, "sine", 0.15);
          break;
        case "hardDrop":
          this.playNoise(ctx, 0.1, 0.3);
          break;
        case "lineClear":
          this.playSweep(ctx, 400, 800, 0.15, 0.2);
          break;
        case "tetris":
          this.playArpeggio(ctx, [523, 659, 784, 1047], 0.08, 0.25);
          break;
        case "gameOver":
          this.playSweep(ctx, 400, 100, 0.6, 0.3);
          break;
      }
    } catch {
      // Web Audio API unavailable
    }
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  private playNoise(ctx: AudioContext, duration: number, volume: number): void {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
  }

  private playSweep(
    ctx: AudioContext,
    startFreq: number,
    endFreq: number,
    duration: number,
    volume: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  private playArpeggio(
    ctx: AudioContext,
    freqs: number[],
    noteLength: number,
    volume: number
  ): void {
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * noteLength;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, start + noteLength);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + noteLength);
    });
  }
}

export { AudioManager, SoundType };
