/**
 * NEON DODGE — Player Spacecraft
 * Procedural vector neon fighter craft with dynamic thrusters and boundary physics
 */

export class Player {
  constructor(logicalWidth = 600, logicalHeight = 800) {
    this.screenWidth = logicalWidth;
    this.screenHeight = logicalHeight;

    // Dimensions & initial position
    this.width = 44;
    this.height = 48;
    this.radius = 16; // Effective collision circle radius
    this.reset();

    // Movement physics
    this.maxSpeed = 520;       // Pixels per second
    this.acceleration = 2800;   // Pixels/sec^2
    this.friction = 0.85;       // Velocity damping
    this.tiltAngle = 0;         // Visual roll bank
  }

  reset() {
    this.x = this.screenWidth / 2;
    this.y = this.screenHeight - 110;
    this.vx = 0;
    this.tiltAngle = 0;
  }

  /**
   * Update player physics and input response
   * @param {number} dt Delta time in seconds
   * @param {object} input InputManager instance
   * @param {object} particles ParticleSystem instance
   */
  update(dt, input, particles) {
    let moveDir = 0;

    if (input.targetLogicalX !== null) {
      // Direct touch / drag steering (smooth approach)
      const diff = input.targetLogicalX - this.x;
      if (Math.abs(diff) > 4) {
        moveDir = Math.sign(diff);
        const targetSpeed = Math.min(this.maxSpeed, Math.abs(diff) * 12);
        this.vx = moveDir * targetSpeed;
      } else {
        this.vx *= 0.5;
      }
    } else {
      // Keyboard / digital button controls
      if (input.leftPressed && !input.rightPressed) {
        moveDir = -1;
      } else if (input.rightPressed && !input.leftPressed) {
        moveDir = 1;
      }

      if (moveDir !== 0) {
        this.vx += moveDir * this.acceleration * dt;
        this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));
      } else {
        this.vx *= Math.pow(this.friction, dt * 60);
      }
    }

    // Apply movement
    this.x += this.vx * dt;

    // Enforce canvas horizontal boundaries
    const halfWidth = this.width / 2;
    if (this.x < halfWidth) {
      this.x = halfWidth;
      this.vx = 0;
    } else if (this.x > this.screenWidth - halfWidth) {
      this.x = this.screenWidth - halfWidth;
      this.vx = 0;
    }

    // Banking tilt angle based on velocity (-15 deg to +15 deg)
    const targetTilt = (this.vx / this.maxSpeed) * 0.26;
    this.tiltAngle += (targetTilt - this.tiltAngle) * Math.min(1, dt * 15);

    // Spawn thruster particles
    if (particles) {
      const isMoving = Math.abs(this.vx) > 30;
      particles.spawnThrusterTrail(this.x, this.y + 18, isMoving);
    }
  }

  /**
   * Render procedural neon fighter
   */
  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.tiltAngle);

    // Outer Neon Glow
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#00f0ff';

    // Spacecraft Body
    ctx.beginPath();
    ctx.moveTo(0, -24);         // Nose
    ctx.lineTo(22, 14);         // Right wing tip
    ctx.lineTo(12, 18);         // Right inner wing
    ctx.lineTo(0, 10);          // Engine notch
    ctx.lineTo(-12, 18);        // Left inner wing
    ctx.lineTo(-22, 14);        // Left wing tip
    ctx.closePath();

    ctx.fillStyle = '#0c111c';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();

    // Wing Neon Orange Accents
    ctx.shadowColor = '#ff7700';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff7700';

    ctx.beginPath();
    ctx.moveTo(6, 4);
    ctx.lineTo(18, 12);
    ctx.moveTo(-6, 4);
    ctx.lineTo(-18, 12);
    ctx.stroke();

    // Central Cockpit Core
    ctx.shadowColor = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(5, 2);
    ctx.lineTo(0, 6);
    ctx.lineTo(-5, 2);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  /**
   * Collision boundary descriptor
   */
  getHitbox() {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius
    };
  }
}
