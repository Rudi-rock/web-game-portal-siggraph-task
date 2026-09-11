/**
 * NEON DODGE — Audio Synthesizer
 * Zero-dependency procedural Web Audio API sound generator
 * Handles browser autoplay restrictions, provides mute toggle & persistence
 */

import { storage } from './storage.js';

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = storage.getAudioMuted();
    this.isInitialized = false;
  }

  /**
   * Lazily initialize AudioContext on explicit user gesture
   */
  initContext() {
    if (this.ctx || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this environment:', e);
    }
  }

  /**
   * Resume context if suspended by browser autoplay policy
   */
  ensureReady() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Toggle mute state and save to storage
   * @returns {boolean} Current muted state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    storage.setAudioMuted(this.isMuted);
    return this.isMuted;
  }

  /**
   * Synth sound: Game Start Fanfare
   */
  playStart() {
    if (this.isMuted) return;
    this.ensureReady();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.08 + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.3);
    });
  }

  /**
   * Synth sound: Button Click Feedback
   */
  playClick() {
    if (this.isMuted) return;
    this.ensureReady();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  /**
   * Synth sound: Explosion / Impact
   */
  playExplosion() {
    if (this.isMuted) return;
    this.ensureReady();
    if (!this.ctx) return;

    // Filtered noise buffer synthesis
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.38);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.4);
  }

  /**
   * Synth sound: Laser Shard Pass Warning
   */
  playWarning() {
    if (this.isMuted) return;
    this.ensureReady();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(850, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}

export const audio = new AudioManager();
