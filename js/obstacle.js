/**
 * NEON DODGE — Obstacle Manager
 * Spawns and manages distinct hazards:
 * 1. Asteroid: Large, medium-speed, rotating geometric obstacle with orange glow
 * 2. Laser Shard: High-speed, narrow, high-threat projectile with cyan energy trail
 */

export class ObstacleManager {
  constructor(logicalWidth = 600, logicalHeight = 800) {
    this.screenWidth = logicalWidth;
    this.screenHeight = logicalHeight;
    this.obstacles = [];

    // Spawning timer state
    this.spawnTimer = 0;
    this.baseSpawnInterval = 1.1; // Seconds between spawns at level 1
    this.currentSpawnInterval = 1.1;
  }

  reset() {
    this.obstacles = [];
    this.spawnTimer = 0;
    this.currentSpawnInterval = this.baseSpawnInterval;
  }

  /**
   * Update obstacle positions, handle spawning, and prune off-screen hazards
   * @param {number} dt Delta time in seconds
   * @param {number} difficultyFactor Multiplier based on current score/level
   */
  update(dt, difficultyFactor = 1) {
    // Dynamic spawn interval: gets faster with difficulty (clamped at 0.35s minimum)
    this.currentSpawnInterval = Math.max(0.35, this.baseSpawnInterval / (1 + (difficultyFactor - 1) * 0.25));

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.currentSpawnInterval) {
      this.spawnTimer = 0;
      this.spawnObstacle(difficultyFactor);
    }

    // Update active obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      obs.y += obs.speed * dt;
      obs.rotation += obs.rotationSpeed * dt;

      // Clean up offscreen obstacles
      if (obs.y > this.screenHeight + 80) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  /**
   * Spawn either an Asteroid or a Laser Shard
   */
  spawnObstacle(difficultyFactor) {
    // 65% Asteroids, 35% Laser Shards (more shards as difficulty increases)
    const shardChance = Math.min(0.55, 0.25 + (difficultyFactor - 1) * 0.05);
    const isShard = Math.random() < shardChance;

    if (isShard) {
      // ----------------------------------------------------
      // LASER SHARD: Fast, sleek, narrow vertical hazard
      // ----------------------------------------------------
      const x = Math.random() * (this.screenWidth - 80) + 40;
      const baseSpeed = 460 + Math.random() * 80;

      this.obstacles.push({
        type: 'shard',
        x: x,
        y: -60,
        width: 8,
        length: 50,
        radius: 12, // Approximate collision radius
        speed: baseSpeed * (1 + (difficultyFactor - 1) * 0.12),
        rotation: 0,
        rotationSpeed: 0,
        color: '#00f0ff'
      });
    } else {
      // ----------------------------------------------------
      // ASTEROID: Heavy, medium-speed rotating polygon
      // ----------------------------------------------------
      const radius = Math.random() * 12 + 20; // 20 to 32px
      const x = Math.random() * (this.screenWidth - radius * 2) + radius;
      const baseSpeed = 200 + Math.random() * 90;

      // Generate jagged polygon vertices once at spawn
      const vertices = [];
      const numVertices = 7 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numVertices; i++) {
        const angle = (i / numVertices) * Math.PI * 2;
        const dist = radius * (0.8 + Math.random() * 0.4);
        vertices.push({
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist
        });
      }

      this.obstacles.push({
        type: 'asteroid',
        x: x,
        y: -radius - 20,
        radius: radius,
        speed: baseSpeed * (1 + (difficultyFactor - 1) * 0.1),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2.5,
        vertices: vertices,
        color: '#ff7700'
      });
    }
  }

  /**
   * Render all obstacles with glowing neon aesthetics
   */
  render(ctx) {
    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];

      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.type === 'asteroid') {
        ctx.rotate(obs.rotation);
        ctx.shadowBlur = 14;
        ctx.shadowColor = obs.color;

        // Asteroid outer perimeter
        ctx.beginPath();
        const v = obs.vertices;
        ctx.moveTo(v[0].x, v[0].y);
        for (let j = 1; j < v.length; j++) {
          ctx.lineTo(v[j].x, v[j].y);
        }
        ctx.closePath();

        ctx.fillStyle = '#100e17';
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = obs.color;
        ctx.stroke();

        // Inner crater details
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(255, 119, 0, 0.45)';
        ctx.beginPath();
        ctx.arc(-obs.radius * 0.25, -obs.radius * 0.2, obs.radius * 0.28, 0, Math.PI * 2);
        ctx.stroke();
      } else if (obs.type === 'shard') {
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#00f0ff';

        // Glowing vertical laser shard
        const gradient = ctx.createLinearGradient(0, -obs.length, 0, 0);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0)');
        gradient.addColorStop(0.7, '#00f0ff');
        gradient.addColorStop(1, '#ffffff');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);                 // Sharp bottom point
        ctx.lineTo(obs.width / 2, -obs.length);
        ctx.lineTo(-obs.width / 2, -obs.length);
        ctx.closePath();
        ctx.fill();

        // Inner energy core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -obs.length * 0.8);
        ctx.lineTo(0, 0);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  /**
   * Get active obstacle hitboxes for collision detection
   */
  getObstacles() {
    return this.obstacles;
  }
}
