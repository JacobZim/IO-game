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
    if (this.moveR && this.moveU) {
      this.x += dt * this.speed * diag;
      this.y -= dt * this.speed * diag;
    }
    else if (this.moveR && this.moveD) {
      this.x += dt * this.speed * diag;
      this.y += dt * this.speed * diag;
    }
    else if (this.moveL && this.moveU) {
      this.x -= dt * this.speed * diag;
      this.y -= dt * this.speed * diag;
    }
    else if (this.moveL && this.moveD) {
      this.x -= dt * this.speed * diag;
      this.y += dt * this.speed * diag;
    }
    else if (this.moveR) this.x += dt * this.speed;
    else if (this.moveL) this.x -= dt * this.speed;
    else if (this.moveU) this.y -= dt * this.speed;
    else if (this.moveD) this.y += dt * this.speed;
  }

  takeBulletDamage() {
    this.hp -= Constants.BULLET_DAMAGE;
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
