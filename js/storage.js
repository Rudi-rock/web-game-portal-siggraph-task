/**
 * NEON DODGE — Storage Manager
 * Resilient, failure-tolerant LocalStorage handler for high scores & settings
 */

const STORAGE_KEYS = {
  HIGH_SCORE: 'neonDodgeHighScore',
  AUDIO_MUTED: 'neonDodgeMuted'
};

class StorageManager {
  constructor() {
    this.isAvailable = this.checkAvailability();
    this.memoryFallback = {};
  }

  /**
   * Safe test for localStorage availability
   */
  checkAvailability() {
    try {
      const testKey = '__nd_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('LocalStorage unavailable, using in-memory storage fallback:', e);
      return false;
    }
  }

  /**
   * Get current persisted high score
   * @returns {number}
   */
  getHighScore() {
    try {
      if (this.isAvailable) {
        const val = window.localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
        return val ? parseInt(val, 10) || 0 : 0;
      }
      return this.memoryFallback[STORAGE_KEYS.HIGH_SCORE] || 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Save new high score if it exceeds previous best
   * @param {number} score
   * @returns {boolean} True if a new high score was set
   */
  saveHighScore(score) {
    const currentBest = this.getHighScore();
    if (score > currentBest) {
      try {
        if (this.isAvailable) {
          window.localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
        } else {
          this.memoryFallback[STORAGE_KEYS.HIGH_SCORE] = score;
        }
        return true;
      } catch (e) {
        console.warn('Failed to persist high score:', e);
      }
    }
    return false;
  }

  /**
   * Get audio mute preference
   * @returns {boolean}
   */
  getAudioMuted() {
    try {
      if (this.isAvailable) {
        return window.localStorage.getItem(STORAGE_KEYS.AUDIO_MUTED) === 'true';
      }
      return !!this.memoryFallback[STORAGE_KEYS.AUDIO_MUTED];
    } catch (e) {
      return false;
    }
  }

  /**
   * Save audio mute preference
   * @param {boolean} isMuted
   */
  setAudioMuted(isMuted) {
    try {
      if (this.isAvailable) {
        window.localStorage.setItem(STORAGE_KEYS.AUDIO_MUTED, isMuted ? 'true' : 'false');
      } else {
        this.memoryFallback[STORAGE_KEYS.AUDIO_MUTED] = isMuted;
      }
    } catch (e) {
      console.warn('Failed to persist audio settings:', e);
    }
  }
}

export const storage = new StorageManager();
