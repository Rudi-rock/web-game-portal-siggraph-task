/**
 * NEON DODGE — Main Game Engine
 * Coordinates state machine, high-DPI Canvas scaling, delta-time game loop,
 * physics, collisions, particle effects, audio, and HUD updates.
 */

import { Player } from './player.js';
import { ObstacleManager } from './obstacle.js';
import { ParticleSystem } from './particles.js';
import { CollisionSystem } from './collision.js';
import { ScoreManager } from './score.js';
import { InputManager } from './input.js';
import { audio } from './audio.js';
import { storage } from './storage.js';

// Game State Enum
const STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

class NeonDodgeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasContainer = document.getElementById('canvas-container');

    // Logical dimensions
    this.logicalWidth = 600;
    this.logicalHeight = 800;

    // Subsystems
    this.player = new Player(this.logicalWidth, this.logicalHeight);
    this.obstacles = new ObstacleManager(this.logicalWidth, this.logicalHeight);
    this.particles = new ParticleSystem(this.logicalWidth, this.logicalHeight);
    this.score = new ScoreManager();
    this.input = new InputManager(this.canvas);

    // Engine loop tracking
    this.state = STATE.MENU;
    this.lastTime = performance.now();
    this.animationFrameId = null;

    // DOM UI Elements
    this.ui = {
      score: document.getElementById('hud-score-val'),
      level: document.getElementById('hud-level-val'),
      best: document.getElementById('hud-best-val'),
      startOverlay: document.getElementById('start-overlay'),
      pauseOverlay: document.getElementById('pause-overlay'),
      gameoverOverlay: document.getElementById('gameover-overlay'),
      startBestScore: document.getElementById('start-best-score'),
      goFinalScore: document.getElementById('gameover-final-score'),
      goBestScore: document.getElementById('gameover-best-score'),
      newRecordBanner: document.getElementById('new-record-banner'),
      muteBtn: document.getElementById('mute-toggle-btn'),
      iconSoundOn: document.getElementById('icon-sound-on'),
      iconSoundOff: document.getElementById('icon-sound-off'),
      pauseBtn: document.getElementById('pause-toggle-btn'),
      btnStart: document.getElementById('btn-start-game'),
      btnResume: document.getElementById('btn-resume-game'),
      btnRestartPause: document.getElementById('btn-restart-from-pause'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnTouchLeft: document.getElementById('btn-touch-left'),
      btnTouchRight: document.getElementById('btn-touch-right')
    };

    this.init();
  }

  init() {
    this.setupResolution();
    window.addEventListener('resize', () => this.setupResolution(), { passive: true });

    this.bindEvents();
    this.updateMuteUI();
    this.syncInitialHUD();

    // Start rendering idle animation loop
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /**
   * Device Pixel Ratio (DPR) Scaling
   * Ensures crisp Canvas drawing on Retina/mobile displays without distorting logic
   */
  setupResolution() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for performance
    this.canvas.width = this.logicalWidth * dpr;
    this.canvas.height = this.logicalHeight * dpr;

    // Scale canvas context to match logical coordinate system
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Connect UI buttons, mobile controls, and keyboard shortcuts
   */
  bindEvents() {
    // Start button
    this.ui.btnStart.addEventListener('click', () => {
      audio.playClick();
      this.startGame();
    });

    // Resume button
    this.ui.btnResume.addEventListener('click', () => {
      audio.playClick();
      this.resumeGame();
    });

    // Restart buttons
    this.ui.btnRestartPause.addEventListener('click', () => {
      audio.playClick();
      this.restartGame();
    });
    this.ui.btnPlayAgain.addEventListener('click', () => {
      audio.playClick();
      this.restartGame();
    });

    // Pause toggle button
    this.ui.pauseBtn.addEventListener('click', () => {
      this.togglePause();
    });

    // Audio mute toggle
    this.ui.muteBtn.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      this.updateMuteUI();
      if (!isMuted) audio.playClick();
    });

    // Keyboard shortcut M for mute
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM') {
        const isMuted = audio.toggleMute();
        this.updateMuteUI();
        if (!isMuted) audio.playClick();
      }
    });

    // Hook input manager actions
    this.input.onPauseTrigger = () => this.togglePause();
    this.input.onRestartTrigger = () => {
      if (this.state === STATE.GAME_OVER || this.state === STATE.PAUSED) {
        this.restartGame();
      }
    };

    // Mobile on-screen buttons
    this.input.bindVirtualControls(this.ui.btnTouchLeft, this.ui.btnTouchRight);
  }

  updateMuteUI() {
    const isMuted = audio.isMuted;
    if (this.ui.iconSoundOn && this.ui.iconSoundOff) {
      this.ui.iconSoundOn.style.display = isMuted ? 'none' : 'block';
      this.ui.iconSoundOff.style.display = isMuted ? 'block' : 'none';
      this.ui.muteBtn.setAttribute('aria-label', isMuted ? 'Unmute Audio' : 'Mute Audio');
    }
  }

  syncInitialHUD() {
    const best = storage.getHighScore();
    this.ui.best.textContent = best.toLocaleString();
    if (this.ui.startBestScore) {
      this.ui.startBestScore.textContent = best.toLocaleString();
    }
  }

  /**
   * State Transitions
   */
  startGame() {
    this.state = STATE.PLAYING;
    this.ui.startOverlay.classList.remove('active');
    this.ui.pauseOverlay.classList.remove('active');
    this.ui.gameoverOverlay.classList.remove('active');

    this.player.reset();
    this.obstacles.reset();
    this.particles.clearDynamic();
    this.score.reset();
    this.input.reset();

    audio.playStart();
    this.lastTime = performance.now();
  }

  togglePause() {
    if (this.state === STATE.PLAYING) {
      this.state = STATE.PAUSED;
      this.ui.pauseOverlay.classList.add('active');
      audio.playClick();
    } else if (this.state === STATE.PAUSED) {
      this.resumeGame();
    }
  }

  resumeGame() {
    if (this.state === STATE.PAUSED) {
      this.state = STATE.PLAYING;
      this.ui.pauseOverlay.classList.remove('active');
      this.lastTime = performance.now(); // Reset lastTime so dt doesn't jump
      audio.playClick();
    }
  }

  restartGame() {
    this.startGame();
  }

  triggerGameOver() {
    this.state = STATE.GAME_OVER;

    // Trigger explosive audio & particle effects
    audio.playExplosion();
    this.particles.spawnExplosion(this.player.x, this.player.y);

    // Subtle screen shake
    if (this.canvasContainer) {
      this.canvasContainer.classList.remove('shake-active');
      void this.canvasContainer.offsetWidth; // Trigger reflow for re-animation
      this.canvasContainer.classList.add('shake-active');
    }

    // Finalize score and commit high score
    const results = this.score.finalizeGame();

    this.ui.goFinalScore.textContent = results.finalScore.toLocaleString();
    this.ui.goBestScore.textContent = results.bestScore.toLocaleString();
    this.ui.best.textContent = results.bestScore.toLocaleString();

    if (results.isNewHighScore) {
      this.ui.newRecordBanner.classList.add('visible');
    } else {
      this.ui.newRecordBanner.classList.remove('visible');
    }

    // Show Game Over overlay after a micro pause to witness explosion
    setTimeout(() => {
      if (this.state === STATE.GAME_OVER) {
        this.ui.gameoverOverlay.classList.add('active');
      }
    }, 450);
  }

  /**
   * Main Game Loop (Delta-Time Based)
   */
  loop(currentTime) {
    // Calculate delta time in seconds, clamped to max 0.1 to avoid spiral of death
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.handleInput();
    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  handleInput() {
    // Input is polled during player.update
  }

  update(dt) {
    // Ambient stars & dynamic particles always update for visual continuity
    const speedMult = this.state === STATE.PLAYING ? this.score.getDifficultyFactor() : 0.6;
    this.particles.update(dt, speedMult);

    if (this.state === STATE.PLAYING) {
      // 1. Update Player
      this.player.update(dt, this.input, this.particles);

      // 2. Update Obstacles with current difficulty factor
      const difficulty = this.score.getDifficultyFactor();
      this.obstacles.update(dt, difficulty);

      // 3. Collision Detection
      const playerHitbox = this.player.getHitbox();
      const collidedObstacle = CollisionSystem.checkCollisions(playerHitbox, this.obstacles.getObstacles());

      if (collidedObstacle) {
        this.triggerGameOver();
        return;
      }

      // 4. Update Score & HUD
      this.score.update(dt);
      this.ui.score.textContent = this.score.getScoreFormatted();
      this.ui.level.textContent = String(this.score.level).padStart(2, '0');
      this.ui.best.textContent = this.score.getBestFormatted();
    }
  }

  render() {
    // Clear logical canvas area
    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

    // 1. Render background stardust particles
    this.particles.render(this.ctx);

    // 2. Render obstacles
    this.obstacles.render(this.ctx);

    // 3. Render player (if not game over or during menu preview)
    if (this.state !== STATE.GAME_OVER) {
      this.player.render(this.ctx);
    }
  }
}

// Instantiate game engine on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new NeonDodgeGame();
});
