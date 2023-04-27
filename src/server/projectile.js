const shortid = require('shortid');
const Object = require('./object');
const Constants = require('../shared/constants');

class Projectile extends Object.Object {
  constructor(parentID, x, y, dir, team) {
    super(shortid(), x, y, dir, team);
    this.parentID = parentID;
    this.lifespan = Constants.PROJ_LIFESPAN.BULLET;
    this.currenttime = 0;
    this.radius = Constants.RADIUS_TYPES.BULLET;
    this.damage = Constants.DAMAGE_TYPES.BULLET;
    this.classType = Constants.CLASS_TYPES.BULLET;
    this.speed = Constants.SPEED_TYPES.BULLET;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    super.update(dt);
    this.currenttime += dt;
    if (this.currenttime >= this.lifespan) return true;
    return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE;
  }
}

class EnergyBall extends Projectile {
  constructor(parentID, x, y, dir, team) {
    super(parentID, x, y, dir, team);
    this.speed = Constants.SPEED_TYPES.ENERGY_BALL;
    this.lifespan = Constants.PROJ_LIFESPAN.ENERGY_BALL;
    this.radius = Constants.RADIUS_TYPES.ENERGY_BALL;
    this.damage = Constants.DAMAGE_TYPES.ENERGY_BALL;
    this.classType = Constants.CLASS_TYPES.ENERGY_BALL;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    if (super.update(dt)) return true;
    return false;
  }
}

class HealingRing extends Projectile {
  constructor(parentID, x, y, dir, team, finX, finY) {
    super(parentID, finX, finY, dir, team);
    this.speed = Constants.SPEED_TYPES.HEALING_RING;
    this.startX = x;
    this.startY = y;
    this.distance = this.distanceTo2(finX, finY);
    this.lifespan = Constants.PROJ_LIFESPAN.HEALING_RING;
    this.hp = Constants.MAX_HEALTH_TYPES.MAGE;
    this.radius = Constants.RADIUS_TYPES.HEALING_RING;
    this.damage = Constants.DAMAGE_TYPES.HEALING_RING;
    this.classType = Constants.CLASS_TYPES.HEALING_RING;
    this.AoE = Constants.AoE_TYPES.HEAL;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    if (super.update(dt)) return true;
    return false;
  }
}

class KnifeThrow extends Projectile {
  constructor(parentID, x, y, dir, team, invis) {
    super(parentID, x, y, dir, team);
    this.speed = Constants.SPEED_TYPES.KNIFE_THROW;
    this.lifespan = Constants.PROJ_LIFESPAN.KNIFE_THROW;
    this.radius = Constants.RADIUS_TYPES.KNIFE_THROW;
    if (invis != Constants.INVISIBILITY.NONE)
      this.damage = Constants.DAMAGE_TYPES.KNIFE_THROW * 5;
    else this.damage = Constants.DAMAGE_TYPES.KNIFE_THROW;
    this.classType = Constants.CLASS_TYPES.KNIFE_THROW;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    if (super.update(dt)) return true;
    return false;
  }
}

module.exports.Projectile = Projectile;

module.exports.EnergyBall = EnergyBall;
//module.exports.MagicWall = MagicWall;
module.exports.HealingRing = HealingRing;

module.exports.KnifeThrow = KnifeThrow;