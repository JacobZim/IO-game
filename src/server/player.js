const Object = require('./object');
const Projectiles = require('./projectile');
const Constants = require('../shared/constants');
const { COOLDOWN_TYPES } = require('../shared/constants');

class Player extends Object.Object {
  constructor(id, username, x, y, team) {
    super(id, x, y, Math.random() * 2 * Math.PI, team);
    this.username = username;
    this.classType = Constants.CLASS_TYPES.PLAYER;
    this.score = 0;
    this.mass = Constants.MASS_TYPES.PLAYER;
    this.radius = Constants.RADIUS_TYPES.PLAYER;
    this.speed = Constants.SPEED_TYPES.PLAYER;
    this.hp = Constants.MAX_HEALTH_TYPES.PLAYER;
    this.maxhp = Constants.MAX_HEALTH_TYPES.PLAYER;
    this.damage = Constants.DAMAGE_TYPES.PLAYER;

    this.mouseX = 0;
    this.mouseY = 0;

    this.primaryFireCooldown = 0;
    this.eCooldown = 0;
    this.qCooldown = 0;
    this.spaceCooldown = 0;
    this.regenCooldown = 0;

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
    this.regenCooldown -= dt;
    if (this.primaryFireCooldown <= 0 && this.primary_firing) {
      this.primaryFire(projectiles);
    }
    if (this.eCooldown <= 0 && this.eFiring) {
      this.eFire(projectiles);
    }
    if (this.qCooldown <= 0 && this.qFiring) {
      this.qFire(projectiles);
    }
    if (this.spaceCooldown <= 0 && this.spaceFiring) {
      this.spaceFire(projectiles);
    }
    this.regen(dt);
    return projectiles;
  }
  primaryFire(projectiles) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  eFire(projectiles) {
    this.eCooldown = Constants.COOLDOWN_TYPES.BULLET;
    let inc = Math.PI / 12;
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction        , this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction+inc    , this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction+inc+inc, this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction-inc    , this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction-inc-inc, this.team, this.mouseX, this.mouseY));
  }
  qFire(projectiles) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles) {
    this.spaceCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  regen(dt) {
    if (this.hp >= Constants.MAX_HEALTH_TYPES.PLAYER) {
      this.hp = Constants.MAX_HEALTH_TYPES.PLAYER;
      return;
    }
    if (this.regenCooldown <= 0) {
      this.hp += Constants.REGEN_TYPES.PLAYER * dt;
    }
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
  updateMouse(x, y) {
    this.mouseX = x + this.x;
    this.mouseY = y + this.y;
  }
  takeDamage(damage) {
    this.hp -= damage;
    this.regenCooldown = Constants.REGEN_TIME;
  }
  onDealtDamage() {
    this.score += Constants.SCORE_BULLET_HIT;
  }
  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      hp: this.hp,
      maxhp: this.maxhp,
    };
  }
}

class Mage extends Player {
  constructor(id, username, x, y, team) {
    super(id, username, x, y, team);
    this.classType = Constants.CLASS_TYPES.MAGE;
    this.speed = Constants.SPEED_TYPES.MAGE;
    this.hp = Constants.MAX_HEALTH_TYPES.MAGE;
    this.maxhp = Constants.MAX_HEALTH_TYPES.MAGE;
    this.radius = Constants.RADIUS_TYPES.MAGE;
    this.damage = Constants.DAMAGE_TYPES.MAGE;
    this.mass = Constants.MASS_TYPES.MAGE;
  }
  primaryFire(projectiles) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.ENERGY_BALL;
    projectiles.push(new Projectiles.EnergyBall(this.id, this.x, this.y, this.direction, this.team));
  }
  eFire(projectiles) {
    this.eCooldown = Constants.COOLDOWN_TYPES.MAGIC_WALL;
    let inc = Math.PI / 12;
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction        , this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction+inc    , this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction+inc+inc, this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction-inc    , this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction-inc-inc, this.team, this.mouseX, this.mouseY));
  }
  qFire(projectiles) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles) {
    console.log("Healing ring created");
    this.spaceCooldown = Constants.COOLDOWN_TYPES.HEALING_RING;
    let oppTeam;
    if (this.team == 0) oppTeam = 1;
    else oppTeam = 0;
    console.log("mage: ", this);
    let x = new Projectiles.HealingRing(this.id, this.x, this.y, this.direction, this.team, this.mouseX, this.mouseY);
    console.log("new healing ring: ", x)
    projectiles.push(x);
  }
  regen(dt) {
    if (this.hp >= Constants.MAX_HEALTH_TYPES.MAGE) {
      this.hp = Constants.MAX_HEALTH_TYPES.MAGE;
      return;
    }
    if (this.regenCooldown <= 0) {
      this.hp += Constants.REGEN_TYPES.MAGE * dt;
    }
  }
}

class Rogue extends Player {
  constructor(id, username, x, y, team) {
    super(id, username, x, y, team);
    this.classType = Constants.CLASS_TYPES.ROGUE;
    this.speed = Constants.SPEED_TYPES.ROGUE;
    this.hp = Constants.MAX_HEALTH_TYPES.ROGUE;
    this.maxhp = Constants.MAX_HEALTH_TYPES.ROGUE;
    this.radius = Constants.RADIUS_TYPES.ROGUE;
    this.damage = Constants.DAMAGE_TYPES.ROGUE;
    this.mass = Constants.MASS_TYPES.ROGUE;
  }
  primaryFire(projectiles) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.KNIFE_THROW;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  eFire(projectiles) {
    this.eCooldown = Constants.COOLDOWN_TYPES.KNIFE_FAN;
    let inc = Math.PI / 12;
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction        , this.team, this.mouseX, this.mouseY));
  }
  qFire(projectiles) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles) {
    this.spaceCooldown = Constants.COOLDOWN_TYPES.DASH;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  regen(dt) {
    if (this.hp >= Constants.MAX_HEALTH_TYPES.ROGUE) {
      this.hp = Constants.MAX_HEALTH_TYPES.ROGUE;
      return;
    }
    if (this.regenCooldown <= 0) {
      this.hp += Constants.REGEN_TYPES.ROGUE * dt;
    }
  }
}
class Warrior extends Player {
  constructor(id, username, x, y, team) {
    super(id, username, x, y, team);
    this.classType = Constants.CLASS_TYPES.WARRIOR;
    this.speed = Constants.SPEED_TYPES.WARRIOR;
    this.hp = Constants.MAX_HEALTH_TYPES.WARRIOR;
    this.maxhp = Constants.MAX_HEALTH_TYPES.WARRIOR;
    this.radius = Constants.RADIUS_TYPES.WARRIOR;
    this.damage = Constants.DAMAGE_TYPES.WARRIOR;
    this.mass = Constants.MASS_TYPES.WARRIOR;
  }
  primaryFire(projectiles) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.SWORD_SWIPE;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  eFire(projectiles) {
    this.eCooldown = Constants.COOLDOWN_TYPES.SHIELD_BASH;
    let inc = Math.PI / 12;
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction        , this.team, this.mouseX, this.mouseY));
  }
  qFire(projectiles) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles) {
    this.spaceCooldown = Constants.COOLDOWN_TYPES.SHIELD;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  regen(dt) {
    if (this.hp >= Constants.MAX_HEALTH_TYPES.WARRIOR) {
      this.hp = Constants.MAX_HEALTH_TYPES.WARRIOR;
      return;
    }
    if (this.regenCooldown <= 0) {
      this.hp += Constants.REGEN_TYPES.WARRIOR * dt;
    }
  }
}
class Brute extends Player {
  constructor(id, username, x, y, team) {
    super(id, username, x, y, team);
    this.classType = Constants.CLASS_TYPES.BRUTE;
    this.speed = Constants.SPEED_TYPES.BRUTE;
    this.hp = Constants.MAX_HEALTH_TYPES.BRUTE;
    this.maxhp = Constants.MAX_HEALTH_TYPES.BRUTE;
    this.radius = Constants.RADIUS_TYPES.BRUTE;
    this.damage = Constants.DAMAGE_TYPES.BRUTE;
    this.mass = Constants.MASS_TYPES.BRUTE;
  }
  primaryFire(projectiles) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.FIST_SMASH;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  eFire(projectiles) {
    this.eCooldown = Constants.COOLDOWN_TYPES.GROUND_POUND;
    let inc = Math.PI / 12;
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction        , this.team, this.mouseX, this.mouseY));
  }
  qFire(projectiles) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles) {
    this.spaceCooldown = Constants.COOLDOWN_TYPES.RAGE;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  regen(dt) {
    if (this.hp >= Constants.MAX_HEALTH_TYPES.BRUTE) {
      this.hp = Constants.MAX_HEALTH_TYPES.BRUTE;
      return;
    }
    if (this.regenCooldown <= 0) {
      this.hp += Constants.REGEN_TYPES.BRUTE * dt;
    }
  }
}

module.exports.Player = Player;
module.exports.Mage = Mage;
module.exports.Rogue = Rogue;
module.exports.Warrior = Warrior;
module.exports.Brute = Brute;