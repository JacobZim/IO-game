const ObjectClass = require('./object');
const Bullet = require('./bullet');
const Constants = require('../shared/constants');

class Player extends ObjectClass {
  constructor(id, username, x, y) {
    super(id, x, y, Math.random() * 2 * Math.PI, Constants.PLAYER_SPEED);
    this.username = username;
    this.classType = Constants.CLASS_TYPES.PLAYER;
    this.hp = Constants.PLAYER_MAX_HP;
    this.primaryFireCooldown = 0;
    this.eCooldown = 0;
    this.qCooldown = 0;

    this.score = 0;
    this.mass = 1.0;
    this.primary_firing = false;
    this.eFiring = false;
    this.qFiring = false;
    this.moveR = false;
    this.moveL = false;
    this.moveU = false;
    this.moveD = false;
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
    this.primaryFireCooldown -= dt;
    if (this.primaryFireCooldown <= 0 && this.primary_firing) {
      this.primaryFireCooldown = Constants.PLAYER_FIRE_COOLDOWN;
      return new Bullet(this.id, this.x, this.y, this.direction);
    }

    return null;
  }

  move(dt) {
    const diag = Math.sqrt(2) / 2;
    this.dx = 0;
    this.dy = 0;
    
    // Calculate new X and Y positions based on keys pressed
    if (this.moveR && this.moveU) {
      this.dx = diag * this.speed;
      this.dy = diag * this.speed;
    }
    else if (this.moveR && this.moveD) {
      this.dx = diag * this.speed;
      this.dy = diag * this.speed * (-1);
    }
    else if (this.moveL && this.moveU) {
      this.dx = diag * this.speed * (-1);
      this.dy = diag * this.speed;
    }
    else if (this.moveL && this.moveD) {
      this.dx = diag * this.speed * (-1);
      this.dy = diag * this.speed * (-1);
    }
    else if (this.moveR) this.dx = this.speed;
    else if (this.moveL) this.dx = this.speed * (-1);
    else if (this.moveU) this.dy = this.speed;
    else if (this.moveD) this.dy = this.speed * (-1);

    // Check if the new X and Y positions collide with anything

    this.x += this.dx * dt;
    this.y -= this.dy * dt;
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
      classType: this.classType,
    };
  }
}

class Rogue extends Player {
  constructor(id, username, x, y) {
    super(id, username, x, y);
    this.classType = Constants.CLASS_TYPES.ROGUE;
  }
}

module.exports.Player = Player;
module.exports.Rogue = Rogue;