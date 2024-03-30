const { parseSync } = require('@babel/core');
const Constants = require('../shared/constants');
const Solids = require("./solids.js");
const Polygons = require("./js-intersect/solution.js");
const { Rectangle } = require('./object.js');
const Projectile = require('./projectile.js')
const Player = require('./player.js')

// Retrun true if Circle on Circle collision
function detectCollisionCircCirc(c1, c2) {
  if (c1.distanceTo(c2) <= c1.radius + c2.radius) {
    return true;
  }
  return false;
}
// Return true if Rectangle on Circle collision.
// Note: there is no circle class. Class Object represent circles by default
function detectCollisionRectCirc(rectangle, circle) {
  // Calculate the center of the rectangle
  var rectCenterX = rectangle.x;
  var rectCenterY = rectangle.y;

  // Calculate the position of the circle relative to the rotated rectangle
  var dx = Math.abs(circle.x - rectCenterX);
  var dy = Math.abs(circle.y - rectCenterY);

  // Rotate the circle's position back to the unrotated rectangle's frame of reference
  var angle = -rectangle.direction; // Negative because we're rotating back
  var cosAngle = Math.cos(angle);
  var sinAngle = Math.sin(angle);
  var rotatedDx = dx * cosAngle - dy * sinAngle;
  var rotatedDy = dx * sinAngle + dy * cosAngle;

  // Calculate the half-width and half-height of the rotated rectangle
  var rotatedHalfWidth = rectangle.width / 2;
  var rotatedHalfHeight = rectangle.height / 2;

  // Check if the rotated circle center is within the bounds of the rotated rectangle
  if (Math.abs(rotatedDx) <= rotatedHalfWidth + circle.radius && Math.abs(rotatedDy) <= rotatedHalfHeight + circle.radius) {
      return true; // Circle intersects with rectangle
  }

  // Calculate the nearest point on the rotated rectangle's boundary to the rotated circle center
  var nearestX = Math.max(-rotatedHalfWidth, Math.min(rotatedHalfWidth, rotatedDx));
  var nearestY = Math.max(-rotatedHalfHeight, Math.min(rotatedHalfHeight, rotatedDy));

  // Calculate the distance between the nearest point and the rotated circle center
  var distance = Math.sqrt((rotatedDx - nearestX) ** 2 + (rotatedDy - nearestY) ** 2);

  // Check if the distance is less than or equal to the circle's radius
  if (distance <= circle.radius) {
      return true; // Circle intersects with rectangle
  }

  return false; // No intersection
}

// Return true if there is Rectangle on Rectangle collision.
// https://github.com/vrd/js-intersect/tree/gh-pages?tab=readme-ov-file
function detectCollisionRectRect(r1, r2) {
  points1 = r1.getCornerPoints();
  points2 = r2.getCornerPoints();
  if (Polygons.intersect(points1, points2).length > 0) {
    return true;
  }
  return false;
}
// Detect collisions between any combination of Rectangle and Circle
function detectCollision(o1, o2) {
  if (o1 instanceof Rectangle && o2 instanceof Rectangle) {
    return detectCollisionRectRect(o1,o2);
  } else if (o1 instanceof Rectangle && o2 instanceof Object) {
    return detectCollisionRectCirc(o1,o2);
  } else if (o1 instanceof Object && o2 instanceof Rectangle) {
    return detectCollisionRectCirc(o2,o1);
  } else if (o1 instanceof Object && o2 instanceof Object) {
    return detectCollisionCircCirc(o1,o2);
  } else {
    console.error("Bad arguements for detect collisions")
  }
}

// Applys player-projectile collisions
function applyProjectileCollisions(objects, projectiles, dt) {
  for (let i = 0; i < projectiles.length; i++) {
    // Look for a object (player/structures, no other projectiles) to collide each projectile with.
    for (let j = 0; j < objects.length; j++) {
      const projectile = projectiles[i];
      const object = objects[j];
      if (object instanceof Projectile.Projectile) {
        throw("applyProjectileCollisions: should not have projectile on projectile collisions")
      }
      // collision detected
      if (detectCollision(projectile, object)) {
        console.log("Collision detected");
        // if Discrete Projectile and not collided before
        if (!(projectile.hasCollided(object))) {
          projectileCollision(object, projectile, dt);
        }
      }
    }
  }
  return [];
}

function projectileCollision(object, projectile, dt) {
  // friendly object, object below max health, healing projectile
  if (object instanceof Player.Player && object.team == projectile.team && projectile.healing > 0 && object.hp < object.maxhp) {
    // friendly object is not parent
    if (object.id != projectile.parentID) {
      object.takeHealing(projectile.collide(dt, object));
    }
    // object is parent, can heal parent
    else if (projectile.selfheal == true) {
      object.takeHealing(projectile.collide(dt, object));
    }
    else {
      console.log("friendly else statement");
    }
  // enemy object, damaging projectile
  } else if (object.team != projectile.team && projectile.damage > 0) {
      console.log("enemy spotted");
      object.takeDamage(projectile.collide(dt, object));
  } else {
    console.log("no collision else statement");
  }
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
      if (detectCollision(projectile, structure)) {
        if (projectile instanceof Projectile.DiscreteProjectile) {
          if (structure.team != projectile.team && projectile.damage > 0) {
            structure.takeDamage(projectile.damage);
            projectile.collide(dt);
          } else if (structure.team == projectile.team && projectile.healing > 0 && structure.hp < structure.maxhp) {
            structure.takeHealing(projectile.healing);
            projectile.collide(dt);
          } 
        } else if (projectile instanceof Projectile.ContinuousProjectile) {
          if (structure.team != projectile.team && projectile.damage > 0) {
            structure.takeDamage(projectile.damage * dt);
            projectile.collide(dt);
          } else if (structure.team == projectile.team && projectile.healing > 0 && structure.hp < structure.maxhp) {
            structure.takeHealing(projectile.healing * dt);
            structure.collide(dt);
          }
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

module.exports.applyProjectileCollisions = applyProjectileCollisions;
module.exports.applyStructureProjectileCollisions = applyStructureProjectileCollisions;
module.exports.applyPlayerCollisions = applyPlayerCollisions;
module.exports.applyPlayerStructureCollisions = applyPlayerStructureCollisions;
module.exports.applyStructureCollisions = applyStructureCollisions;