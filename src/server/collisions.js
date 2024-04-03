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
  var dx = circle.x - rectCenterX;
  var dy = circle.y - rectCenterY;

  // Rotate the circle's position back to the unrotated rectangle's frame of reference
  var angle = rectangle.direction; // Positive because we're rotating back
  var cosAngle = Math.cos(angle);
  var sinAngle = Math.sin(angle);
  var rotatedDx = dx * cosAngle + dy * sinAngle; // Note the change in sign
  var rotatedDy = -dx * sinAngle + dy * cosAngle; // Note the change in sign

  // Calculate the half-width and half-height of the rotated rectangle
  var rotatedHalfWidth = rectangle.width / 2;
  var rotatedHalfHeight = rectangle.height / 2;

  // Calculate the nearest point on the rectangle's boundary to the circle center
  var nearestX = Math.max(-rotatedHalfWidth, Math.min(rotatedHalfWidth, rotatedDx));
  var nearestY = Math.max(-rotatedHalfHeight, Math.min(rotatedHalfHeight, rotatedDy));

  // Calculate the distance between the nearest point and the circle center
  var distanceSquared = (rotatedDx - nearestX) ** 2 + (rotatedDy - nearestY) ** 2;

  // Check if the distance is less than or equal to the circle's radius squared
  return distanceSquared <= (circle.radius ** 2);
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
    throw("Bad arguements for detect collisions")
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
  // enemy object, damaging projectile
  } else if (object.team != projectile.team && projectile.damage > 0) {
    object.takeDamage(projectile.collide(dt, object));
  }
}


// Apply collision physics and other effects on 
// non-projectile objects, i.e. players, structures
// Objects should have mass and push eachother
function applyPhysicalCollisions(objects1, objects2, dt) {
  // after each player has move()d, check if any are overlapping and apply collision between the two
  for (let j = 0; j < objects1.length; j++) {
    for (let i = 0; i < objects2.length; i++) {
      const o1 = objects1[j];
      const o2 = objects2[i];
      if (detectCollision(o1,o2) && o1.team != o2.team) {
        collidePhysicalObjects(o1, o2, dt);
      }
    }
  }
  return;
}



// player1 and player2 can be of type player or type structure
function collidePhysicalObjects(player1, player2, dt) {
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
module.exports.applyPhysicalCollisions = applyPhysicalCollisions;