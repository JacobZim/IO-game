const { parseSync } = require('@babel/core');
const Constants = require('../shared/constants');
const Solids = require("./solids.js");

// Returns an array of projectiles to be destroyed.
function applyProjectileCollisions(players, projectiles, dt) {
  const destroyedProjectiles = [];
  for (let i = 0; i < projectiles.length; i++) {
    // Look for a player (who didn't create the projectile) to collide each projectile with.
    // As soon as we find one, break out of the loop to prevent double counting a projectile.
    for (let j = 0; j < players.length; j++) {
      const projectile = projectiles[i];
      const player = players[j];
      if (player.distanceTo(projectile) <= player.radius + projectile.radius) {
        if (projectile.AoE == Constants.AoE_TYPES.HEAL) {
          console.log("AoE affect heal");
          if (player.team == projectile.team)
            player.takeDamage(projectile.damage * dt);
        } else if (projectile.AoE == Constants.AoE_TYPES.DAMAGE) {
          console.log("AoE affect damage");
          if (player.team != projectile.team)
            player.takeDamage(projectile.damage * dt);
        } else if (player.team != projectile.team) {
          destroyedProjectiles.push(projectile);
          player.takeDamage(projectile.damage);
          break;
        }
      /*if (
        projectile.parentID !== player.id &&
        player.distanceTo(projectile) <= player.radius + projectile.radius && 
        player.team != projectile.team
      ) {
        destroyedProjectiles.push(projectile);
        player.takeDamage(projectile.damage);
        break;
      }*/
      }
    }
  }
  return destroyedProjectiles;
}


function applyPlayerCollisions(players, dt) {
  // after each player has move()d, check if any are overlapping and apply collision between the two
  for (let j = 0; j < players.length; j++) {
    for (let i = j + 1; i < players.length; i++) {
      const player = players[j];
      const other = players[i];
      if (player.distanceTo(other) <= player.radius + other.radius) {
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
  
  player2.takeDamage(player1.damage * dt) ;
  player1.takeDamage(player2.damage * dt) ;
}

function detectCollisionRectangle(rect1, rect2) {
  return;
}