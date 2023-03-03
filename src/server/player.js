const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, username, x, y) {
    super(id, x, y, Math.random() * 2 * Math.PI, Constants.PLAYER_SPEED);
    this.username = username;
    this.hp = Constants.PLAYER_MAX_HP;
    this.fireCooldown = 0;
    this.score = 0;
    this.moveR = false;
    this.moveL = false;
    this.moveU = false;
    this.moveD = false;
    this.primary_firing = false;
  }

  // Returns a newly created bullet, or null.
  update(dt) {
    this.move(dt);

    // Update score
    this.score += dt * Constants.SCORE_PER_SECOND;

    // Make sure the player stays in bounds
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));

    // Fire a bullet, if needed
    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0 && this.primary_firing) {
      this.fireCooldown = Constants.PLAYER_FIRE_COOLDOWN;
      return new Bullet(this.id, this.x, this.y, this.direction);
    }

    return null;
  }

  move(dt) {
    const diag = Math.sqrt(2) / 2;
    let newX = this.x;
    let newY = this.y;

    // Calculate new X and Y positions based on keys pressed
    if (this.moveR && this.moveU) {
      newX += dt * this.speed * diag;
      newY -= dt * this.speed * diag;
    }
    else if (this.moveR && this.moveD) {
      newX += dt * this.speed * diag;
      newY += dt * this.speed * diag;
    }
    else if (this.moveL && this.moveU) {
      newX -= dt * this.speed * diag;
      newY -= dt * this.speed * diag;
    }
    else if (this.moveL && this.moveD) {
      newX -= dt * this.speed * diag;
      newY += dt * this.speed * diag;
    }
    else if (this.moveR) newX += dt * this.speed;
    else if (this.moveL) newX -= dt * this.speed;
    else if (this.moveU) newY -= dt * this.speed;
    else if (this.moveD) newY += dt * this.speed;

    // Check if the new X and Y positions collide with anything

    this.x = newX;
    this.y = newY;
  }

  takeDamage(damage) {
    this.hp -= damage;
  }

  onDealtDamage() {
    this.score += Constants.SCORE_BULLET_HIT;
  }

  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      hp: this.hp,
    };
  }
}

module.exports = Player;
