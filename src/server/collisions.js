const Constants = require('../shared/constants');
const Solids = require("./solids.js");

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
function applyPlayerCollisions(players, dt) {
  // after each player has move()d, check if any are overlapping and apply collision between the two
  for (let j = 0; j < players.length; j++) {
    for (let i = j + 1; i < players.length; i++) {
      const player = players[j];
      const other = players[i];
      if (player.distanceTo(other) <= Constants.PLAYER_RADIUS + Constants.PLAYER_RADIUS) {
        collidePlayers(player, other, dt);
      }
    }
  }
  return;
}

module.exports.applyProjectileCollisions = applyProjectileCollisions;
module.exports.applyPlayerCollisions = applyPlayerCollisions;

function collidePlayers(player1, player2, dt) {
  let dy = player1.y - player2.y;
  let dx = player1.x - player2.x;
  let hyp = Math.sqrt(dy*dy + dx*dx);
  let collisionFactor = 2;
  dy = dy / hyp * collisionFactor;
  dx = dx / hyp * collisionFactor;
  player1.y += dy / player1.mass;
  player1.x += dx / player1.mass;
  player2.y -= dy / player2.mass;
  player2.x -= dx / player2.mass;
}

function detectCollisionRectangle(rect1, rect2) {
  
}