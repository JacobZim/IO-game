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


/*
function createVector(mx = 0, my = 0) {
  return {x : mx, y : my};
}
function createArray(a = 0, b = 0) {
  return [a, b];
}

function collidePlayerz(player1, player2) {
  let en = createVector();// Center of Mass coordinate system, normal component
  let et = createVector();// Center of Mass coordinate system, tangential component
  let u = createVector(createVector(), createVector());// initial velocities of two particles
  let um = createVector(createVector(), createVector());// initial velocities in Center of Mass coordinates

  let umt = createArray(0.0, 0.0);// initial velocities in Center of Mass coordinates, tangent component
  let umn = createArray(0.0, 0.0);// initial velocities in Center of Mass coordinates, normal component
  let v = createVector(createVector(), createVector());// final velocities of two particles

  let m = createArray(0.0, 0.0);// mass of two particles
  let M = 0.0; // mass of two particles together
  let V = createVector();// velocity of two particles together
  let size = 0.0;
  let i = 0;

  let xdif = player1.getNextX() - player2.getNextX();
  let ydif = player1.getNextY() - player2.getNextY();

  // set Center of Mass coordinate system
	size = sqrt(xdif * xdif + ydif * ydif);
	xdif /= size; ydif /= size; // normalize
	en.x = xdif;
	en.y = ydif;
	et.x = ydif;
	et.y = -xdif;
  // set u values
  u[0].x = particles[p1].getdx();
  u[0].y = particles[p1].getdy();
  m[0] = particles[p1].getradius() * particles[p1].getradius();
  u[1].x = particles[p2].getdx();
  u[1].y = particles[p2].getdy();
  m[1] = particles[p2].getradius() * particles[p2].getradius();

  // set M and V
  M = m[0] + m[1];
  V.x = (u[0].x * m[0] + u[1].x * m[1]) / M;
  V.y = (u[0].y * m[0] + u[1].y * m[1]) / M;

  // set um values
  um[0].x = m[1] / M * (u[0].x - u[1].x);
  um[0].y = m[1] / M * (u[0].y - u[1].y);
  um[1].x = m[0] / M * (u[1].x - u[0].x);
  um[1].y = m[0] / M * (u[1].y - u[0].y);

  // set umt and umn values
  for (i = 0; i < 2; i++)
  {
    umt[i] = um[i].x * et.x + um[i].y * et.y;
    umn[i] = um[i].x * en.x + um[i].y * en.y;
  }

  // set v values
  for (i = 0; i < 2; i++)
  {
    v[i].x = umt[i] * et.x - umn[i] * en.x + V.x;
    v[i].y = umt[i] * et.y - umn[i] * en.y + V.y;
  }

  let COLLISION_FRICTION = 1;
  // reset particle values
  player1.setdx(v[0].x * COLLISION_FRICTION);
  player1[p1].setdy(v[0].y * COLLISION_FRICTION);
  particles[p2].setdx(v[1].x * COLLISION_FRICTION);
  particles[p2].setdy(v[1].y * COLLISION_FRICTION);
} /* Collide */
