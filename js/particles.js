/**
 * NEON DODGE — Particle System
 * High-performance, strictly capped particle pool with zero runaway memory allocation
 */

export class ParticleSystem {
  constructor(logicalWidth = 600, logicalHeight = 800) {
    this.width = logicalWidth;
    this.height = logicalHeight;
    this.maxParticles = 160; // Strict hard cap
    this.particles = [];

    // Ambient stardust particles in game canvas
    this.initAmbientStars(45);
  }

  /**
   * Populate persistent background space dust
   */
  initAmbientStars(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'star',
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: 0,
        vy: Math.random() * 80 + 40, // Base fall speed
        size: Math.random() * 1.5 + 0.8,
        color: Math.random() > 0.3 ? 'rgba(0, 240, 255, ' : 'rgba(255, 255, 255, ',
        alpha: Math.random() * 0.6 + 0.2,
        life: 999999, // Persistent, wraps around
        maxLife: 999999
      });
    }
  }

  /**
   * Spawn engine thruster exhaust particles
   */
  spawnThrusterTrail(x, y, isMoving) {
    // Only spawn if below hard cap
    if (this.particles.length >= this.maxParticles) return;

    const count = isMoving ? 2 : 1;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'exhaust',
        x: x + (Math.random() - 0.5) * 8,
        y: y + 2,
        vx: (Math.random() - 0.5) * 40,
        vy: Math.random() * 160 + 120, // Downward stream
        size: Math.random() * 3 + 2,
        color: Math.random() > 0.4 ? 'rgba(255, 119, 0, ' : 'rgba(0, 240, 255, ',
        alpha: 0.9,
        life: 0.25, // 250ms life
        maxLife: 0.25
      });
    }
  }

  /**
   * Spawn explosive burst on collision
   */
  spawnExplosion(x, y) {
    const count = 36;
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        // Discard oldest non-star particle if at cap
        const removeIdx = this.particles.findIndex(p => p.type !== 'star');
        if (removeIdx !== -1) this.particles.splice(removeIdx, 1);
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 80;
      const isOrange = Math.random() > 0.4;

      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        color: isOrange ? 'rgba(255, 119, 0, ' : 'rgba(0, 240, 255, ',
        alpha: 1.0,
        life: Math.random() * 0.45 + 0.3,
        maxLife: 0.6
      });
    }
  }

  /**
   * Update all active particles using delta time (seconds)
   */
  update(dt, speedMultiplier = 1) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.type === 'star') {
        p.y += p.vy * speedMultiplier * dt;
        if (p.y > this.height) {
          p.y = 0;
          p.x = Math.random() * this.width;
        }
      } else {
        // Dynamic particles (exhaust, explosion sparks)
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = Math.max(0, p.life / p.maxLife);
        p.size = Math.max(0.5, p.size * (1 - dt * 1.5));
      }
    }
  }

  /**
   * Render particles to canvas context
   */
  render(ctx) {
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}${p.alpha.toFixed(2)})`;
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Reset dynamic particles while keeping ambient stardust
   */
  clearDynamic() {
    this.particles = this.particles.filter(p => p.type === 'star');
  }
}
