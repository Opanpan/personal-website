import { ISLAND_RADIUS, ZONES } from './config';

/**
 * Procedural sound — everything is synthesised with Web Audio, no audio files.
 * Must be started from a user gesture (browsers block audio until then).
 *
 * Buses: master → { ambience (waves, birds, crickets), music (gamelan), sfx }
 */

export type Surface = 'grass' | 'wood' | 'stone';

const MUTE_KEY = 'world-muted';
const MASTER_VOLUME = 0.75;

// Slendro-like scale (5 roughly equal steps per octave) rooted on D4
const SLENDRO = Array.from({ length: 11 }, (_, i) => 293.66 * Math.pow(2, i / 5));
// 16-beat balungan pattern (scale degrees; -1 = rest), loops forever
const BALUNGAN = [2, 3, 2, 1, -1, 2, 3, 5, 3, 2, 1, 2, -1, 3, 5, 4];
const BEAT = 0.62; // seconds

class WorldAudio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private ambience!: GainNode;
  private music!: GainNode;
  private sfx!: GainNode;
  private waves!: GainNode;
  private noise!: AudioBuffer;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextBeat = 0;
  private beat = 0;
  private nextBird = 0;
  private nextCricket = 0;
  private night = false;
  muted = false;

  constructor() {
    try {
      this.muted = typeof window !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      // storage unavailable
    }
  }

  /** Call from a click/key handler. Safe to call repeatedly. */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended' && !this.muted) void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : MASTER_VOLUME;
    this.master.connect(ctx.destination);
    this.ambience = this.bus(0.9);
    this.music = this.bus(0.0);
    this.sfx = this.bus(0.9);

    // 2s of white noise, reused by waves, footsteps and paper rustles
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    // ocean: looping noise → lowpass, gain swells in update()
    this.waves = ctx.createGain();
    this.waves.gain.value = 0;
    const surf = ctx.createBufferSource();
    surf.buffer = this.noise;
    surf.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 650;
    surf.connect(lp).connect(this.waves).connect(this.ambience);
    surf.start();

    this.nextBeat = ctx.currentTime + 0.5;
    this.timer = setInterval(() => this.schedule(), 100);

    document.addEventListener('visibilitychange', this.onVisibility);
  }

  private bus(gain: number) {
    const g = this.ctx!.createGain();
    g.gain.value = gain;
    g.connect(this.master);
    return g;
  }

  private onVisibility = () => {
    if (!this.ctx) return;
    if (document.hidden) void this.ctx.suspend();
    else if (!this.muted) void this.ctx.resume();
  };

  setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      // ignore
    }
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, this.ctx.currentTime, 0.08);
    if (!muted) void this.ctx.resume();
  }

  setNight(night: boolean) {
    this.night = night;
  }

  /** Per-frame: distance-based mixing (louder surf near the shore, gamelan near the Joglo). */
  update(x: number, z: number, t: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    const shore = ISLAND_RADIUS - Math.hypot(x, z);
    const near = Math.min(1, Math.max(0.12, 1 - shore / 32));
    const swell = 0.55 + 0.45 * Math.sin(t * 0.33) * Math.sin(t * 0.21 + 1);
    this.waves.gain.setTargetAtTime(0.32 * near * swell, ctx.currentTime, 0.3);
    const dj = Math.hypot(x - ZONES.joglo.x, z - ZONES.joglo.z);
    const music = 0.05 + 0.3 * Math.max(0, 1 - dj / 30);
    this.music.gain.setTargetAtTime(music, ctx.currentTime, 0.5);
  }

  // -------------------------------------------------------------------------
  // scheduler: gamelan beats, bird chirps by day, crickets by night
  // -------------------------------------------------------------------------
  private schedule() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const ahead = ctx.currentTime + 0.25;
    while (this.nextBeat < ahead) {
      const step = this.beat % BALUNGAN.length;
      const degree = BALUNGAN[step];
      if (degree >= 0) this.saron(SLENDRO[degree + 2], this.nextBeat, 0.16);
      // bonang-ish ornament on off-beats, an octave up
      if (step % 2 === 1 && degree >= 0) this.saron(SLENDRO[degree + 7], this.nextBeat + BEAT / 2, 0.05, 0.6);
      if (step % 4 === 3) this.kempul(SLENDRO[degree >= 0 ? degree : 0] / 2, this.nextBeat);
      if (step === 0 && (this.beat / BALUNGAN.length) % 2 === 0) this.gongAgeng(this.nextBeat, this.music, 0.35);
      this.nextBeat += BEAT;
      this.beat++;
    }
    const now = ctx.currentTime;
    if (!this.night && now > this.nextBird) {
      const n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) this.chirp(now + 0.05 + i * 0.16);
      this.nextBird = now + 2 + Math.random() * 5;
    }
    if (this.night && now > this.nextCricket) {
      this.cricket(now + 0.05);
      this.nextCricket = now + 0.5 + Math.random() * 0.9;
    }
  }

  // -------------------------------------------------------------------------
  // instruments
  // -------------------------------------------------------------------------
  /** Metallophone: fundamental + inharmonic bronze partials, quick strike, long ring. */
  private saron(freq: number, t: number, vol: number, decay = 1.3, out: AudioNode = this.music) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g.connect(out);
    [
      [1, 1],
      [2.76, 0.28],
      [5.4, 0.08],
    ].forEach(([ratio, amp]) => {
      const o = ctx.createOscillator();
      o.frequency.value = freq * ratio;
      const pg = ctx.createGain();
      pg.gain.value = amp;
      o.connect(pg).connect(g);
      o.start(t);
      o.stop(t + decay + 0.05);
    });
  }

  private kempul(freq: number, t: number) {
    this.saron(freq, t, 0.12, 2.4);
  }

  /** Big gong: two slightly detuned low sines beating against each other. */
  private gongAgeng(t: number, out: AudioNode, vol: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 6);
    g.connect(out);
    [65, 66.2, 131.5].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      const pg = ctx.createGain();
      pg.gain.value = i === 2 ? 0.25 : 0.6;
      o.connect(pg).connect(g);
      o.start(t);
      o.stop(t + 6.1);
    });
  }

  private chirp(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const base = 2300 + Math.random() * 900;
    o.frequency.setValueAtTime(base, t);
    o.frequency.exponentialRampToValueAtTime(base * 1.45, t + 0.05);
    o.frequency.exponentialRampToValueAtTime(base * 1.05, t + 0.11);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.035, t + 0.015);
    g.gain.linearRampToValueAtTime(0, t + 0.12);
    o.connect(g).connect(this.ambience);
    o.start(t);
    o.stop(t + 0.13);
  }

  private cricket(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.frequency.value = 4200 + Math.random() * 400;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    for (let k = 0; k < 4; k++) {
      g.gain.linearRampToValueAtTime(0.02, t + k * 0.055 + 0.01);
      g.gain.linearRampToValueAtTime(0, t + k * 0.055 + 0.04);
    }
    o.connect(g).connect(this.ambience);
    o.start(t);
    o.stop(t + 0.3);
  }

  private noiseBurst(t: number, duration: number, filter: BiquadFilterType, freq: number, vol: number, out: AudioNode = this.sfx) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = 0.85 + Math.random() * 0.3;
    const f = ctx.createBiquadFilter();
    f.type = filter;
    f.frequency.value = freq;
    f.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(f).connect(g).connect(out);
    src.start(t, Math.random() * 1.5, duration + 0.02);
  }

  // -------------------------------------------------------------------------
  // public one-shots
  // -------------------------------------------------------------------------
  footstep(surface: Surface) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    if (surface === 'wood') this.noiseBurst(t, 0.09, 'bandpass', 1300, 0.22);
    else if (surface === 'stone') this.noiseBurst(t, 0.06, 'bandpass', 2400, 0.12);
    else this.noiseBurst(t, 0.08, 'lowpass', 900, 0.1);
  }

  /** Panel opens: a soft paper rustle. */
  page() {
    if (!this.ctx) return;
    this.noiseBurst(this.ctx.currentTime, 0.28, 'highpass', 1800, 0.08);
  }

  /** New discovery: gong + a rising saron phrase. */
  discover() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + 0.02;
    this.gongAgeng(t, this.sfx, 0.3);
    [4, 5, 7].forEach((d, i) => this.saron(SLENDRO[d], t + 0.12 + i * 0.14, 0.12, 1.4, this.sfx));
  }

  private sweep(type: OscillatorType, from: number, to: number, duration: number, vol: number) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    o.connect(g).connect(this.sfx);
    o.start(t);
    o.stop(t + duration + 0.02);
  }

  hop() {
    this.sweep('triangle', 220, 560, 0.12, 0.08);
  }

  land() {
    if (!this.ctx) return;
    this.noiseBurst(this.ctx.currentTime, 0.12, 'lowpass', 500, 0.25);
  }

  /** Striking the gamelan gong by hand. */
  gong() {
    if (!this.ctx) return;
    this.gongAgeng(this.ctx.currentTime + 0.01, this.sfx, 0.55);
  }

  /** "Ting-ting!" — a bakso seller tapping the bowl with a spoon. */
  ting() {
    const ctx = this.ctx;
    if (!ctx) return;
    [0, 0.14, 0.28].forEach((dt) => {
      const t = ctx.currentTime + dt;
      [
        [2650, 0.12],
        [6900, 0.03],
      ].forEach(([f, vol]) => {
        const o = ctx.createOscillator();
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        o.connect(g).connect(this.sfx);
        o.start(t);
        o.stop(t + 0.36);
      });
    });
  }

  /** Rope creak when the swing is pushed. */
  creak() {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(140, t);
    o.frequency.linearRampToValueAtTime(95, t + 0.35);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900;
    f.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.05);
    g.gain.linearRampToValueAtTime(0, t + 0.38);
    o.connect(f).connect(g).connect(this.sfx);
    o.start(t);
    o.stop(t + 0.4);
  }

  /** Torch catching fire / being snuffed out. */
  torch(lit: boolean) {
    if (!this.ctx) return;
    if (lit) this.noiseBurst(this.ctx.currentTime, 0.45, 'bandpass', 700, 0.22);
    else this.noiseBurst(this.ctx.currentTime, 0.18, 'lowpass', 400, 0.18);
  }

  /** Villager chatter: a few soft "voice" blips (Animal Crossing style). */
  blip(pitch = 1) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    lp.connect(this.sfx);
    const n = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const t = ctx.currentTime + i * 0.075;
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = (330 + Math.random() * 220) * pitch;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.035, t + 0.01);
      g.gain.linearRampToValueAtTime(0, t + 0.055);
      o.connect(g).connect(lp);
      o.start(t);
      o.stop(t + 0.06);
    }
  }
}

export const audio = new WorldAudio();
