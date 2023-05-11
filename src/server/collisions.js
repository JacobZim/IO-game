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
          if (player.team == projectile.team)
            player.takeDamage(projectile.damage * dt);
        } else if (projectile.AoE == Constants.AoE_TYPES.DAMAGE) {
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

// Returns an array of projectiles to be destroyed.
function applyStructureProjectileCollisions(structures, projectiles, dt) {
  const destroyedStructures = [];
  for (let i = 0; i < projectiles.length; i++) {
    // Look for a player (who didn't create the projectile) to collide each projectile with.
    // As soon as we find one, break out of the loop to prevent double counting a projectile.
    for (let j = 0; j < structures.length; j++) {
      const projectile = projectiles[i];
      const structure = structures[j];
      if (structure.distanceTo(projectile) <= structure.radius + projectile.radius) {
        if (projectile.AoE == Constants.AoE_TYPES.HEAL) {
          //if (structure.team == projectile.team)
          //  structure.takeDamage(projectile.damage * dt);
        } else if (projectile.AoE == Constants.AoE_TYPES.DAMAGE) {
          if (structure.team != projectile.team)
            structure.takeDamage(projectile.damage * dt);
        } else if (structure.team != projectile.team) {
          destroyedStructures.push(projectile);
          structure.takeDamage(projectile.damage);
          break;
        }
      }
    }
  }
  return destroyedStructures;
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
function applyPlayerStructureCollisions(players, structures, dt) {
  // after each player has move()d, check if any are overlapping and apply collision between the two
  for (let j = 0; j < players.length; j++) {
    for (let i = 0; i < structures.length; i++) {
      const player = players[j];
      const structure = structures[i];
      if (player.distanceTo(structure) <= player.radius + structure.radius &&
      player.team != structure.team) {
        collidePlayers(player, structure, dt);
      }
    }
  }
  return;
}
function applyStructureCollisions(structures, dt) {
  // after each player has move()d, check if any are overlapping and apply collision between the two
  for (let j = 0; j < structures.length; j++) {
    for (let i = j + 1; i < structures.length; i++) {
      const structure = structures[j];
      const other = structures[i];
      if (structure.distanceTo(other) <= structure.radius + other.radius  &&
      structure.team != other.team) {
        collidePlayers(structure, other, dt);
      }
    }
  }
  return;
}


module.exports.applyProjectileCollisions = applyProjectileCollisions;
module.exports.applyStructureProjectileCollisions = applyStructureProjectileCollisions;
module.exports.applyPlayerCollisions = applyPlayerCollisions;
module.exports.applyPlayerStructureCollisions = applyPlayerStructureCollisions;
module.exports.applyStructureCollisions = applyStructureCollisions;


// player1 and player2 can be of type player or type structure
function collidePlayers(player1, player2, dt) {
  // collision damage 
  if (player1.dashTimer) {
    if (!player1.dashCollisions.includes(player2)) {
      player1.dashCollisions.push(player2);
      player2.takeDamage(Constants.DAMAGE_TYPES.DASH);
    }
  }
  if (player2.dashTimer) {
    if (!player2.dashCollisions.includes(player1)) {
      player2.dashCollisions.push(player1);
      player1.takeDamage(Constants.DAMAGE_TYPES.DASH);
    }
  }
  player2.takeDamage(player1.damage * dt) ;
  player1.takeDamage(player2.damage * dt) ;

  // collision 'physics'
  let dy, dx;
  if (player1.classType == Constants.CLASS_TYPES.SHIELD && player2.classType == Constants.CLASS_TYPES.SHIELD) {
    dy = player1.parent.y - player2.parent.y;
    dx = player1.parent.x - player2.parent.x;
  }
  else if (player2.classType == Constants.CLASS_TYPES.SHIELD) {
    dy = player1.y - player2.parent.y;
    dx = player1.x - player2.parent.x;
  }
  else if (player1.classType == Constants.CLASS_TYPES.SHIELD) {
    dy = player1.parent.y - player2.y;
    dx = player1.parent.x - player2.x;
  } else {
    dy = player1.y - player2.y;
    dx = player1.x - player2.x;
  }
  let hyp = Math.sqrt(dy*dy + dx*dx);
  let collisionFactor = 2;
  dy = dy / hyp * collisionFactor;
  dx = dx / hyp * collisionFactor;
  /*if (player1.classType == Constants.CLASS_TYPES.SHIELD && player2.classType == Constants.CLASS_TYPES.SHIELD) {
    player1.parent.y += player2.mass * dy / player1.mass;
    player1.parent.x += player2.mass * dx / player1.mass;
    player2.parent.y -= player1.mass * dy / player2.mass;
    player2.parent.x -= player1.mass * dx / player2.mass;
  }
  else if (player1.classType == Constants.CLASS_TYPES.SHIELD) {
    player1.parent.y += player2.mass * dy / player1.mass;
    player1.parent.x += player2.mass * dx / player1.mass;
    player2.y -= player1.mass * dy / player2.mass;
    player2.x -= player1.mass * dx / player2.mass;
  }
  else if (player2.classType == Constants.CLASS_TYPES.SHIELD) {
    player1.y += player2.mass * dy / player1.mass;
    player1.x += player2.mass * dx / player1.mass;
    player2.parent.y += player1.mass * dy / player2.mass;
    player2.parent.x += player1.mass * dx / player2.mass;
  }
  else {
    player1.y += player2.mass * dy / player1.mass;
    player1.x += player2.mass * dx / player1.mass;
    player2.y -= player1.mass * dy / player2.mass;
    player2.x -= player1.mass * dx / player2.mass;
  }*/
  player1.y += player2.mass * dy / player1.mass;
  player1.x += player2.mass * dx / player1.mass;
  player2.y -= player1.mass * dy / player2.mass;
  player2.x -= player1.mass * dx / player2.mass;
  if (player2.classType == Constants.CLASS_TYPES.SHIELD) {
    player2.parent.y -= player1.mass * dy / player2.mass;
    player2.parent.x -= player1.mass * dx / player2.mass;
  }
  if (player1.classType == Constants.CLASS_TYPES.SHIELD) {
    player1.parent.y += player2.mass * dy / player1.mass;
    player1.parent.x += player2.mass * dx / player1.mass;
  }
}

function detectCollisionRectangle(rect1, rect2) {
  return;
}