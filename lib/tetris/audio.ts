type SoundType = "move" | "rotate" | "hardDrop" | "lineClear" | "tetris" | "gameOver";

class AudioManager {
  private static instance: AudioManager | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume = 1;
  private muted = false;
  private musicPlaying = false;
  private musicTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private musicGain: GainNode | null = null;
  private musicBpm = 140;

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
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private getMasterGain(): GainNode {
    this.getContext();
    return this.masterGain!;
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.value = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : this.volume;
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
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
    gain.connect(this.getMasterGain());
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
    gain.connect(this.getMasterGain());
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
    gain.connect(this.getMasterGain());
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  startMusic(): void {
    if (this.musicPlaying) return;
    try {
      const ctx = this.getContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      this.musicGain = ctx.createGain();
      this.musicGain.gain.value = 0.12;
      this.musicGain.connect(this.getMasterGain());
      this.musicPlaying = true;
      this.scheduleMusic();
    } catch {
      // Web Audio API unavailable
    }
  }

  stopMusic(): void {
    this.musicPlaying = false;
    if (this.musicTimeoutId !== null) {
      clearTimeout(this.musicTimeoutId);
      this.musicTimeoutId = null;
    }
    if (this.musicGain) {
      this.musicGain.disconnect();
      this.musicGain = null;
    }
  }

  setMusicTempo(bpm: number): void {
    this.musicBpm = Math.max(80, Math.min(300, bpm));
  }

  private static readonly MELODY: number[] = [
    262, 294, 330, 349, 330, 294, 262, 0,
    349, 392, 440, 392, 349, 330, 294, 0,
    262, 330, 392, 440, 392, 330, 262, 0,
    349, 330, 294, 262, 294, 330, 349, 0,
  ];

  private musicStep = 0;

  private scheduleMusic(): void {
    if (!this.musicPlaying || !this.musicGain || !this.ctx) return;

    const ctx = this.ctx;
    const beatDuration = 60 / this.musicBpm;
    const freq = AudioManager.MELODY[this.musicStep % AudioManager.MELODY.length];
    this.musicStep++;

    if (freq > 0) {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const dur = beatDuration * 0.8;
      noteGain.gain.setValueAtTime(1, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(noteGain);
      noteGain.connect(this.musicGain);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    }

    this.musicTimeoutId = setTimeout(
      () => this.scheduleMusic(),
      beatDuration * 1000
    );
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
      gain.connect(this.getMasterGain());
      osc.start(start);
      osc.stop(start + noteLength);
    });
  }
}

export { AudioManager, SoundType };
