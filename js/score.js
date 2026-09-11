/**
 * NEON DODGE — Score Manager
 * Progressive difficulty curve, level calculation, and persistent high scores
 */

import { storage } from './storage.js';

export class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.bestScore = storage.getHighScore();
    this.level = 1;
    this.pointsPerSecond = 120;
    this.isNewHighScore = false;
  }

  reset() {
    this.currentScore = 0;
    this.level = 1;
    this.bestScore = storage.getHighScore();
    this.isNewHighScore = false;
  }

  /**
   * Advance score via survival delta time
   * @param {number} dt Delta time in seconds
   */
  update(dt) {
    const points = dt * this.pointsPerSecond * (1 + (this.level - 1) * 0.15);
    this.currentScore += points;

    // Calculate level (every 500 points advances level)
    this.level = Math.max(1, Math.floor(this.currentScore / 500) + 1);

    // Live best score update
    if (this.currentScore > this.bestScore) {
      this.bestScore = Math.floor(this.currentScore);
      this.isNewHighScore = true;
    }
  }

  /**
   * Add immediate bonus points (e.g. near-misses)
   */
  addBonus(points) {
    this.currentScore += points;
    if (this.currentScore > this.bestScore) {
      this.bestScore = Math.floor(this.currentScore);
      this.isNewHighScore = true;
    }
  }

  /**
   * Finalize game over score and commit to localStorage
   */
  finalizeGame() {
    const finalScore = Math.floor(this.currentScore);
    const wasNewBest = storage.saveHighScore(finalScore);
    if (wasNewBest) {
      this.isNewHighScore = true;
      this.bestScore = finalScore;
    }
    return {
      finalScore: finalScore,
      bestScore: this.bestScore,
      isNewHighScore: this.isNewHighScore,
      levelReached: this.level
    };
  }

  /**
   * Difficulty factor used by ObstacleManager
   */
  getDifficultyFactor() {
    return 1 + (this.level - 1) * 0.22;
  }

  getScoreFormatted() {
    return Math.floor(this.currentScore).toLocaleString();
  }

  getBestFormatted() {
    return Math.floor(this.bestScore).toLocaleString();
  }
}
