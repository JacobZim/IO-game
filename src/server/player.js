const Object = require('./object');
const Projectiles = require('./projectile');
const Constants = require('../shared/constants');
const Structures = require('./structure');
//const { COOLDOWN_TYPES } = require('../shared/constants');

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
    this.overrideMovement = false;
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
    let structures = [];
    this.primaryFireCooldown -= dt;
    this.eCooldown -= dt;
    this.qCooldown -= dt;
    this.spaceCooldown -= dt;
    this.regenCooldown -= dt;
    if (this.primaryFireCooldown <= 0 && this.primary_firing) {
      this.primaryFire(projectiles, structures);
    }
    if (this.eCooldown <= 0 && this.eFiring) {
      this.eFire(projectiles, structures);
    }
    if (this.qCooldown <= 0 && this.qFiring) {
      this.qFire(projectiles, structures);
    }
    if (this.spaceCooldown <= 0 && this.spaceFiring) {
      this.spaceFire(projectiles, structures);
    }
    this.regen(dt);
    return [projectiles, structures];
  }
  primaryFire(projectiles, structures) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  eFire(projectiles, structures) {
    this.eCooldown = Constants.COOLDOWN_TYPES.BULLET;
    let inc = Math.PI / 12;
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction        , this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction+inc    , this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction+inc+inc, this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction-inc    , this.team, this.mouseX, this.mouseY));
    projectiles.push(new Projectiles.MagicWall(this.id, this.x, this.y, this.direction-inc-inc, this.team, this.mouseX, this.mouseY));
  }
  qFire(projectiles, structures) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles, structures) {
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
    if (this.overrideMovement) return;
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
    if (this.invisible) {
      this.invisible -= Constants.INVISIBILITY.DAMAGE;
      if (this.invisible < Constants.INVISIBILITY.NONE) {
        this.invisible = Constants.INVISIBILITY.NONE;
      }
    }
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

// heaven/hell io? angels vs demons holy.io?

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
  primaryFire(projectiles, structures) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.ENERGY_BALL;
    projectiles.push(new Projectiles.EnergyBall(this.id, this.x, this.y, this.direction, this.team));
  }
  eFire(projectiles, structures) {
    this.eCooldown = Constants.COOLDOWN_TYPES.MAGIC_WALL;
    let inc = Math.PI / 12;
    structures.push(new Structures.MagicWall(this.id, this.x, this.y, this.direction        , this.team, this.mouseX, this.mouseY));
    structures.push(new Structures.MagicWall(this.id, this.x, this.y, this.direction+inc    , this.team, this.mouseX, this.mouseY));
    structures.push(new Structures.MagicWall(this.id, this.x, this.y, this.direction+inc+inc, this.team, this.mouseX, this.mouseY));
    structures.push(new Structures.MagicWall(this.id, this.x, this.y, this.direction-inc    , this.team, this.mouseX, this.mouseY));
    structures.push(new Structures.MagicWall(this.id, this.x, this.y, this.direction-inc-inc, this.team, this.mouseX, this.mouseY));
  }
  qFire(projectiles, structures) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles, structures) {
    this.spaceCooldown = Constants.COOLDOWN_TYPES.HEALING_RING;
    let oppTeam;
    if (this.team == 0) oppTeam = 1;
    else oppTeam = 0;
    let x = new Projectiles.HealingRing(this.id, this.x, this.y, this.direction, this.team, this.mouseX, this.mouseY);
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
    this.invisible = Constants.INVISIBILITY.NONE;
    this.dashTimer = 0;
    this.dashDirection = 0;
    this.dashCollisions = [];
  }
  primaryFire(projectiles, structures) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.KNIFE_THROW;
    if (this.invisible) {
      let inc = Math.PI / 24;
      projectiles.push(new Projectiles.KnifeThrow(this.id, this.x, this.y, this.direction - inc - inc, this.team, 0));
      projectiles.push(new Projectiles.KnifeThrow(this.id, this.x, this.y, this.direction - inc, this.team, 0));
      projectiles.push(new Projectiles.KnifeThrow(this.id, this.x, this.y, this.direction, this.team, 0));
      projectiles.push(new Projectiles.KnifeThrow(this.id, this.x, this.y, this.direction + inc, this.team, 0));
      projectiles.push(new Projectiles.KnifeThrow(this.id, this.x, this.y, this.direction + inc + inc, this.team, 0));
      this.invisible = Constants.INVISIBILITY.NONE;
    }
    else {
      projectiles.push(new Projectiles.KnifeThrow(this.id, this.x, this.y, this.direction, this.team, 0));
    }
  }
  eFire(projectiles, structures) {
    this.eCooldown = Constants.COOLDOWN_TYPES.INVISIBILITY;
    this.invisible = Constants.INVISIBILITY.INIT;
  }
  qFire(projectiles, structures) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles, structures) {
    this.spaceCooldown = Constants.COOLDOWN_TYPES.DASH;
    this.dashTimer = Constants.PROJ_LIFESPAN.DASH;
    this.dashDirection = this.direction;
    this.overrideMovement = true;
  }
  Dash(dt) {
    this.x += dt * Constants.SPEED_TYPES.DASH * Math.sin(this.dashDirection);
    this.y -= dt * Constants.SPEED_TYPES.DASH * Math.cos(this.dashDirection);
    this.direction = this.dashDirection;
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
  update(dt) {
    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
    } else {
      this.dashTimer = 0;
    }
    if (this.invisible) {
      if (this.invisible < Constants.INVISIBILITY.FULL) {
        this.invisible += Constants.INVISIBILITY.REGEN * dt;
        if (this.invisible > Constants.INVISIBILITY.FULL) {
          this.invisible = Constants.INVISIBILITY.FULL;
        }
      }
    }
    if (this.dashTimer > 0) {
      this.Dash(dt);
    } else {
      this.dashCollisions = [];
      this.overrideMovement = false;
    }
    return super.update(dt);
  }
  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      invisible: this.invisible,
    };
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
    this.bashTimer = 0;
    this.bashDirection = 0;
    this.shields = [new Structures.Shield(this.id, this.x, this.y, this.direction, this.team, this),
      new Structures.Shield(this.id, this.x, this.y, this.direction, this.team, this),
      new Structures.Shield(this.id, this.x, this.y, this.direction, this.team, this)];
    this.shieldsHp = [Constants.MAX_HEALTH_TYPES.SHIELD,Constants.MAX_HEALTH_TYPES.SHIELD,Constants.MAX_HEALTH_TYPES.SHIELD];
    this.shieldsActive = false;
  }
  primaryFire(projectiles, structures) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.SWORD_SWIPE;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  eFire(projectiles, structures) {
    this.eCooldown = Constants.COOLDOWN_TYPES.SHIELD_BASH;
    this.bashTimer = Constants.PROJ_LIFESPAN.SHIELD_BASH;
    this.bashDirection = this.direction;
    this.overrideMovement = true;
    //this.speed = 4 * Constants.SPEED_TYPES.SHIELD_BASH;
    for (let i = 0; i<3; i++ ) {
      this.shields[i].damage = Constants.DAMAGE_TYPES.SHIELD_BASH;
    }
  }
  ShieldBash(dt) {
    //this.speed = Constants.SPEED_TYPES.WARRIOR;
    this.x += dt * Constants.SPEED_TYPES.SHIELD_BASH * Math.sin(this.bashDirection);
    this.y -= dt * Constants.SPEED_TYPES.SHIELD_BASH * Math.cos(this.bashDirection);
    this.direction = this.bashDirection;
  }
  qFire(projectiles, structures) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles, structures) {
    this.spaceCooldown = Constants.COOLDOWN_TYPES.SHIELD;
    this.shieldsActive = !this.shieldsActive;
    if (this.shieldsActive) {
      for (let i = 0; i<3; i++ ) {
        this.shields[i].hp = this.shieldsHp[i];
        structures.push(this.shields[i])
      }
    } else {
      for (let i = 0; i<3; i++ ) {
        this.shieldsHp[i] = this.shields[i].hp;
        this.shields[i].hp = 0;
      }
    }
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
  update(dt) {
    if (this.bashTimer > 0) {
      this.bashTimer -= dt;
    } else {
      this.bashTimer = 0;
    }
    let totalHp = 0;
    this.shields.forEach(shield => {
      totalHp += shield.hp;
    })
    if (totalHp <= 0) this.shieldsActive = false;
    let inc = Math.PI / 4;
    this.shields[0].shieldupdate(this.x, this.y, this.direction - inc);
    this.shields[1].shieldupdate(this.x, this.y, this.direction);
    this.shields[2].shieldupdate(this.x, this.y, this.direction + inc);
    if (!this.shieldsActive) {
      for (let i = 0; i < 3; i++) {
        this.shieldsHp[i] += Constants.REGEN_TYPES.SHIELD * dt;
        if (this.shieldsHp[i] < 0 ) this.shieldsHp[i] = 0;
        if (this.shieldsHp[i] > Constants.MAX_HEALTH_TYPES.SHIELD) this.shieldsHp[i] = Constants.MAX_HEALTH_TYPES.SHIELD;
      }
    }
    if (this.bashTimer > 0) {
      this.ShieldBash(dt);
    }
    else {
      for (let i = 0; i<3; i++ ) {
        this.shields[i].damage = Constants.DAMAGE_TYPES.SHIELD;
      }
      this.overrideMovement = false;
    }
    return super.update(dt);
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
  primaryFire(projectiles, structures) {
    this.primaryFireCooldown = Constants.COOLDOWN_TYPES.FIST_SMASH;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  eFire(projectiles, structures) {
    this.eCooldown = Constants.COOLDOWN_TYPES.GROUND_POUND;
    let inc = Math.PI / 12;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction        , this.team));
  }
  qFire(projectiles, structures) {
    this.qCooldown = Constants.COOLDOWN_TYPES.BULLET;
    projectiles.push(new Projectiles.Projectile(this.id, this.x, this.y, this.direction, this.team));
  }
  spaceFire(projectiles, structures) {
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