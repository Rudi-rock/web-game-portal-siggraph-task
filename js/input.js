/**
 * NEON DODGE — Input Manager
 * Unified input coordinator for Desktop keyboard, touch buttons, and canvas touch-drag
 */

export class InputManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;

    // Digital movement flags
    this.leftPressed = false;
    this.rightPressed = false;

    // Analog / Touch target position (null if using digital keys)
    this.targetLogicalX = null;

    // Key callbacks for immediate action triggers
    this.onPauseTrigger = null;
    this.onRestartTrigger = null;

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);

    this.initKeyboard();
    this.initCanvasTouch();
  }

  initKeyboard() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown(e) {
    // Prevent page scrolling on Arrow keys and Space during gameplay
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.leftPressed = true;
      this.targetLogicalX = null; // Keyboard overrides touch target
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.rightPressed = true;
      this.targetLogicalX = null;
    } else if (e.code === 'KeyP' || e.code === 'Space' || e.code === 'Escape') {
      if (typeof this.onPauseTrigger === 'function') {
        this.onPauseTrigger();
      }
    } else if (e.code === 'KeyR') {
      if (typeof this.onRestartTrigger === 'function') {
        this.onRestartTrigger();
      }
    }
  }

  handleKeyUp(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      this.leftPressed = false;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      this.rightPressed = false;
    }
  }

  /**
   * Touch-drag directly on Canvas
   */
  initCanvasTouch() {
    if (!this.canvas) return;

    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
  }

  updateTouchPosition(touch) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    // Map screen touch coordinate to 600 logical width
    const logicalX = (touchX / rect.width) * 600;
    this.targetLogicalX = Math.max(30, Math.min(570, logicalX));
  }

  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.updateTouchPosition(e.touches[0]);
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.updateTouchPosition(e.touches[0]);
    }
  }

  handleTouchEnd(e) {
    e.preventDefault();
    this.targetLogicalX = null;
  }

  /**
   * Hook on-screen virtual buttons
   */
  bindVirtualControls(leftBtn, rightBtn) {
    if (leftBtn) {
      const startLeft = (e) => {
        e.preventDefault();
        this.leftPressed = true;
        this.targetLogicalX = null;
      };
      const endLeft = (e) => {
        e.preventDefault();
        this.leftPressed = false;
      };

      leftBtn.addEventListener('touchstart', startLeft, { passive: false });
      leftBtn.addEventListener('touchend', endLeft, { passive: false });
      leftBtn.addEventListener('touchcancel', endLeft, { passive: false });
      leftBtn.addEventListener('mousedown', startLeft);
      leftBtn.addEventListener('mouseup', endLeft);
      leftBtn.addEventListener('mouseleave', endLeft);
    }

    if (rightBtn) {
      const startRight = (e) => {
        e.preventDefault();
        this.rightPressed = true;
        this.targetLogicalX = null;
      };
      const endRight = (e) => {
        e.preventDefault();
        this.rightPressed = false;
      };

      rightBtn.addEventListener('touchstart', startRight, { passive: false });
      rightBtn.addEventListener('touchend', endRight, { passive: false });
      rightBtn.addEventListener('touchcancel', endRight, { passive: false });
      rightBtn.addEventListener('mousedown', startRight);
      rightBtn.addEventListener('mouseup', endRight);
      rightBtn.addEventListener('mouseleave', endRight);
    }
  }

  reset() {
    this.leftPressed = false;
    this.rightPressed = false;
    this.targetLogicalX = null;
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchmove', this.handleTouchMove);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
      this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    }
  }
}
