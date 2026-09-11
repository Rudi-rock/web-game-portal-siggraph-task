/**
 * NEON DODGE — Game Hub Controller
 * Manages ambient starfield canvas, live high-score syncing, and desktop hover card tilt
 */

import { storage } from './storage.js';

class GameHub {
  constructor() {
    this.canvas = document.getElementById('hub-bg-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.stars = [];
    this.maxStars = 70; // Lightweight ambient star count
    this.animationFrameId = null;
    this.isDesktopHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    this.init();
  }

  init() {
    this.displayHighScore();
    this.initBackgroundCanvas();
    this.initCardInteractions();
    this.initSmoothScroll();
  }

  /**
   * Sync and display high score from storage
   */
  displayHighScore() {
    const scoreDisplay = document.getElementById('hub-high-score-display');
    if (scoreDisplay) {
      const best = storage.getHighScore();
      scoreDisplay.textContent = `RECORD: ${best.toLocaleString()}`;
    }
  }

  /**
   * Ambient drifting starfield on hub background canvas
   */
  initBackgroundCanvas() {
    if (!this.canvas || !this.ctx) return;

    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.initStars();
    };

    window.addEventListener('resize', resize, { passive: true });
    resize();
    this.animateStars();
  }

  initStars() {
    this.stars = [];
    const w = this.canvas.width;
    const h = this.canvas.height;

    for (let i = 0; i < this.maxStars; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(255, 255, 255, ',
        alpha: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseDir: Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  animateStars() {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const h = this.canvas.height;
    const w = this.canvas.width;

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];

      // Subtle pulse
      s.alpha += s.pulseSpeed * s.pulseDir;
      if (s.alpha > 0.8) {
        s.alpha = 0.8;
        s.pulseDir = -1;
      } else if (s.alpha < 0.2) {
        s.alpha = 0.2;
        s.pulseDir = 1;
      }

      // Drift downward slowly
      s.y += s.speed;
      if (s.y > h) {
        s.y = 0;
        s.x = Math.random() * w;
      }

      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `${s.color}${s.alpha})`;
      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(() => this.animateStars());
  }

  /**
   * Card micro-interactions: Desktop-only mouse-tracking 3D tilt & glow
   */
  initCardInteractions() {
    const card = document.getElementById('featured-game-card');
    if (!card) return;

    // Strict check: Only attach 3D mouse tracking on fine-pointer desktop devices
    if (!this.isDesktopHover) {
      return; // Mobile devices get standard tap feedback without tilt
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5; // Max 5 deg tilt
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  }

  /**
   * Smooth navigation scrolling
   */
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new GameHub();
});
