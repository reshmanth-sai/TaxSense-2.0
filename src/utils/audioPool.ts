class AudioPoolManager {
  private static instance: AudioPoolManager;
  private ctx: AudioContext | null = null;

  private constructor() {}

  public static getInstance(): AudioPoolManager {
    if (!AudioPoolManager.instance) {
      AudioPoolManager.instance = new AudioPoolManager();
    }
    return AudioPoolManager.instance;
  }

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    // Resume context if suspended (common browser security behavior)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((err) => console.warn('AudioContext resume failed:', err));
    }
    return this.ctx;
  }

  public playBeep(freq = 600, type: OscillatorType = 'sine', duration = 0.08, volume = 0.02) {
    try {
      if (typeof window === 'undefined') return;
      const ctx = this.getContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (freq === 600) {
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + duration);
      } else if (freq === 400) {
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);
      }
      
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play block:', e);
    }
  }
}

export const audioPool = AudioPoolManager.getInstance();
