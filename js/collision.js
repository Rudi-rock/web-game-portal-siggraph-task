/**
 * NEON DODGE — Collision System
 * Highly optimized, fair collision detection with tailored hitboxes
 */

export class CollisionSystem {
  /**
   * Check collision between player and a list of obstacles
   * @param {object} playerHitbox { x, y, radius }
   * @param {Array} obstacles Array of obstacle objects
   * @returns {object|null} The collided obstacle or null
   */
  static checkCollisions(playerHitbox, obstacles) {
    if (!playerHitbox || !obstacles || obstacles.length === 0) return null;

    const px = playerHitbox.x;
    const py = playerHitbox.y;
    const pr = playerHitbox.radius;

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];

      if (obs.type === 'asteroid') {
        // Circle-to-circle collision with 85% grace radius for fair gameplay
        const dx = px - obs.x;
        const dy = py - obs.y;
        const distanceSq = dx * dx + dy * dy;
        const combinedRadius = (pr + obs.radius) * 0.85;

        if (distanceSq <= combinedRadius * combinedRadius) {
          return obs;
        }
      } else if (obs.type === 'shard') {
        // Shard is a vertical projectile from y-obs.length to y
        // Check closest point on vertical line segment to player center
        const topY = obs.y - obs.length;
        const bottomY = obs.y;

        const clampedY = Math.max(topY, Math.min(bottomY, py));
        const dx = px - obs.x;
        const dy = py - clampedY;
        const distanceSq = dx * dx + dy * dy;

        const effectiveRadius = (pr + obs.width) * 0.85;
        if (distanceSq <= effectiveRadius * effectiveRadius) {
          return obs;
        }
      }
    }

    return null;
  }
}
