const Object = require('./object');
const Projectile = require('./projectile');
const Constants = require('../shared/constants');

class Player extends Object.Object {
  constructor(id, username, x, y) {
    super(id, x, y, Math.random() * 2 * Math.PI, Constants.SPEED_TYPES.PLAYER);
    this.username = username;
    this.classType = Constants.CLASS_TYPES.PLAYER;
    this.score = 0;
    this.mass = 1.0;

    this.hp = Constants.MAX_HEALTH_TYPES.PLAYER;

    this.mouseX = 0;
    this.mouseY = 0;

    this.primaryFireCooldown = 0;
    this.eCooldown = 0;
    this.qCooldown = 0;
    this.spaceCooldown = 0;

    this.primary_firing = false;
    this.eFiring = false;
    this.qFiring = false;
    this.spaceFiring = false;

    this.moveR = false;
    this.moveL = false;
    this.moveU = false;
    this.moveD = false;
  }

  // Returns a newly created projectile, or null.
  update(dt) {
    this.move(dt);

    // Update score
    this.score += dt * Constants.SCORE_PER_SECOND;

    // Make sure the player stays in bounds
    this.x = Math.max(0, Math.min(Constants.MAP_SIZE, this.x));
    this.y = Math.max(0, Math.min(Constants.MAP_SIZE, this.y));

    // Fire a projectile(s), if needed
    let projectiles = [];
    this.primaryFireCooldown -= dt;
    this.eCooldown -= dt;
    this.qCooldown -= dt;
    this.spaceCooldown -= dt;
    if (this.primaryFireCooldown <= 0 && this.primary_firing) {
      this.primaryFireCooldown = Constants.COOLDOWN_TYPES.BULLET;
      this.primaryFire(projectiles);
    }
    if (this.eCooldown <= 0 && this.eFiring) {
      this.eCooldown = Constants.COOLDOWN_TYPES.BULLET;
      this.eFire(projectiles);
    }
    if (this.qCooldown <= 0 && this.qFiring) {
      this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
      this.qFire(projectiles);
    }
    if (this.spaceCooldown <= 0 && this.spaceFiring) {
      this.spaceCooldown = Constants.COOLDOWN_TYPES.BULLET;
      this.spaceFire(projectiles);
    }
    return projectiles;
  }
  primaryFire(projectiles) {
    projectiles.push(new Projectile(this.id, this.x, this.y, this.direction));
  }
  eFire(projectiles) {
    projectiles.push(new Projectile(this.id, this.x, this.y, this.direction));
  }
  qFire(projectiles) {
    projectiles.push(new Projectile(this.id, this.x, this.y, this.direction));
  }
  spaceFire(projectiles) {
    projectiles.push(new Projectile(this.id, this.x, this.y, this.direction));
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