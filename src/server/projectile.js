const shortid = require('shortid');
const Object = require('./object');
const Constants = require('../shared/constants');

// A Projectile is an Object that is generally
// used for damaging or healing other objects.
// They do not have mass and may pass through
// other objects in certain senarios
class Projectile extends Object.Object {
  constructor(parentID, x, y, dir, team) {
    super(shortid(), x, y, dir, team);
    this.parentID = parentID;
    this.lifespan = Constants.PROJ_LIFESPAN.BULLET;
    this.currenttime = 0;
    this.radius = Constants.RADIUS_TYPES.BULLET;
    this.damage = Constants.DAMAGE_TYPES.BULLET;
    this.healing = Constants.HEALING_TYPES.BULLET;
    this.selfheal = false; // Can you hit/heal yourself with this ability
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
  collide(dt) {}
}

// A DiscreteProjectile hits something once for contant damage / heal
// and hits a discrete amount of things before being deleted
class DiscreteProjectile extends Projectile {
  constructor(parentID, x, y, dir, team) {
    super(parentID, x, y, dir, team);
    this.numHits = 1; // number of hits left before being deleted
    this.collided = []; // list of objects it has collided with
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    if (this.numHits <= 0) return true;
    return super.update(dt);
  }
  collide(dt, entity) {
    this.numHits -= 1;
    this.collided.push(entity);
    if (entity.team == this.team) {
      return this.healing;
    } 
    else {
      return this.damage;
    }
  }
  hasCollided(object) {
    return this.collided.includes(object);
  }
}
// A Continous Projectile hits things more than once/ continuously
// and may have a 'health' pool before it disappears
class ContinuousProjectile extends Projectile {
  constructor(parentID, x, y, dir, team) {
    super(parentID, x, y, dir, team);
    this.parentID = parentID;
    this.resourcePool = 100;
    this.costPerSec = 0;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    if (this.health <= 0) return true;
    return super.update(dt);
  }
  collide(dt, entity) {
    if (entity.team == this.team) {
      heal = this.healing * dt;
      this.resourcePool -= heal;
      return heal;
    } else {
      damage = this.damage * dt;
      this.resourcePool -= damage;
      return damage;
    }
  }
  hasCollided(object) {
    return false;
  }
}

class EnergyBall extends DiscreteProjectile {
  constructor(parentID, x, y, dir, team) {
    super(parentID, x, y, dir, team);
    this.speed = Constants.SPEED_TYPES.ENERGY_BALL;
    this.lifespan = Constants.PROJ_LIFESPAN.ENERGY_BALL;
    this.radius = Constants.RADIUS_TYPES.ENERGY_BALL;
    this.damage = Constants.DAMAGE_TYPES.ENERGY_BALL;
    this.classType = Constants.CLASS_TYPES.ENERGY_BALL;
    this.numHits = Constants.PROJ_NUM_HITS.ENERGY_BALL;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    return super.update(dt);
  }
}

class HealingRing extends ContinuousProjectile {
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
    this.healing = Constants.HEALING_TYPES.HEALING_RING;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    return super.update(dt);
  }
}

class KnifeThrow extends DiscreteProjectile {
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
    return super.update(dt);
  }
}

module.exports.Projectile = Projectile;
module.exports.DiscreteProjectile = DiscreteProjectile;
module.exports.ContinuousProjectile = ContinuousProjectile;
module.exports.EnergyBall = EnergyBall;
//module.exports.MagicWall = MagicWall;
module.exports.HealingRing = HealingRing;

module.exports.KnifeThrow = KnifeThrow;