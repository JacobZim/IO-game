const Constants = require('../shared/constants');

// Returns an array of bullets to be destroyed.
function applyProjectileCollisions(players, bullets) {
  const destroyedBullets = [];
  for (let i = 0; i < bullets.length; i++) {
    // Look for a player (who didn't create the bullet) to collide each bullet with.
    // As soon as we find one, break out of the loop to prevent double counting a bullet.
    for (let j = 0; j < players.length; j++) {
      const bullet = bullets[i];
      const player = players[j];
      if (
        bullet.parentID !== player.id &&
        player.distanceTo(bullet) <= Constants.PLAYER_RADIUS + Constants.BULLET_RADIUS
      ) {
        destroyedBullets.push(bullet);
        player.takeDamage(Constants.DAMAGE_TYPES.BULLET);
        break;
      }
    }
  }
  return destroyedBullets;
}
function applyPlayerCollisions(players) {
  // after each player has move()d, check if any are overlapping and apply collision between the two
  for (let j = 0; j < players.length; j++) {
    console.log("applyPlayerCollisions() outer loop");
    for (let i = j + 1; i < players.length; i++) {
      const player = players[j];
      const other = players[i];
      console.log("applyPLayerCollisions() inner loops");
      if (player.distanceTo(other) <= Constants.PLAYER_RADIUS + Constants.PLAYER_RADIUS) {
        player.takeDamage(Constants.DAMAGE_TYPES.COLLISION_PLAYER);
        other.takeDamage(Constants.DAMAGE_TYPES.COLLISION_PLAYER);
      }
    }
  }
  return;
}

module.exports.applyProjectileCollisions = applyProjectileCollisions;
module.exports.applyPlayerCollisions = applyPlayerCollisions;
