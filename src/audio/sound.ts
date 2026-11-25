class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  private getCtx(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.06, delay = 0) {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // ignore audio context errors
    }
  }

  click() {
    this.playTone(540, 0.055, 'triangle', 0.035);
  }

  cashIn() {
    this.playTone(660, 0.09, 'sine', 0.06, 0);
    this.playTone(880, 0.14, 'sine', 0.07, 0.065);
  }

  nextMonth() {
    this.playTone(440, 0.08, 'triangle', 0.045, 0);
    this.playTone(554, 0.08, 'triangle', 0.045, 0.06);
    this.playTone(659, 0.14, 'sine', 0.055, 0.12);
  }

  warning() {
    this.playTone(260, 0.12, 'sawtooth', 0.04, 0);
    this.playTone(210, 0.16, 'sawtooth', 0.04, 0.1);
  }

  victory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.25, 'triangle', 0.075, idx * 0.09);
    });
  }

  gameOver() {
    const notes = [330, 261.63, 196];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.28, 'sawtooth', 0.055, idx * 0.14);
    });
  }
}

export const sound = new SoundEngine();
