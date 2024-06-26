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
    this.pierce = Constants.PROJ_PIERCE.BULLET;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    super.update(dt);
    this.currenttime += dt;
    if (this.currenttime >= this.lifespan) return true;
    return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE;
  }
  collide(dt, entity) {
    if (entity.armor > this.pierce) {
      this.currenttime = this.lifespan;
    }
    return 0;
  }
  hasCollided(object) {
    return false;
  }
}

class ProjectileRect extends Object.Rectangle {
  constructor(parentID, x, y, dir, team, w, h) {
    super(shortid(), x, y, dir, team, w, h);
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
  collide(dt, entity) {
    if (entity.armor > this.pierce) {
      this.currenttime = this.lifespan;
    }
    return 0;
  }
  hasCollided(object) {
    return false;
  }
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
    super.collide(dt, entity);
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
    if (this.resourcePool <= 0) return true;
    return super.update(dt);
  }
  collide(dt, entity) {
    super.collide(dt, entity);
    if (entity.team == this.team) {
      let heal = this.healing * dt;
      this.resourcePool -= heal;
      return heal;
    } else {
      let damage = this.damage * dt;
      this.resourcePool -= damage;
      return damage;
    }
  }
  hasCollided(object) {
    return false;
  }
}

class DiscreteProjectileRect extends ProjectileRect {
  constructor(parentID, x, y, dir, team, w, h) {
    super(parentID, x, y, dir, team, w, h);
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
    super.collide(dt, entity);
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
class ContinuousProjectileRect extends ProjectileRect {
  constructor(parentID, x, y, dir, team, w, h) {
    super(parentID, x, y, dir, team, w, h);
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
    super.collide(dt, entity);
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
  constructor(parentID, x, y, dir, team, charge) {
    super(parentID, x, y, dir, team);
    this.speed = Constants.SPEED_TYPES.ENERGY_BALL;
    this.lifespan = Constants.PROJ_LIFESPAN.ENERGY_BALL;
    this.radius = Constants.RADIUS_TYPES.ENERGY_BALL + Constants.RADIUS_TYPES.AURA_EB * charge;
    this.damage = Constants.DAMAGE_TYPES.ENERGY_BALL + Constants.DAMAGE_TYPES.AURA_EB * charge;
    this.classType = Constants.CLASS_TYPES.ENERGY_BALL;
    this.numHits = Constants.PROJ_NUM_HITS.ENERGY_BALL + charge;
    this.pierce = Constants.PROJ_PIERCE.ENERGY_BALL + charge;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    return super.update(dt);
  }
}

class HealingRing extends ContinuousProjectile {
  constructor(parentID, x, y, dir, team, finX, finY, charge) {
    super(parentID, finX, finY, dir, team);
    this.speed = Constants.SPEED_TYPES.HEALING_RING;
    this.startX = x;
    this.startY = y;
    this.distance = this.distanceTo2(finX, finY);
    this.lifespan = Constants.PROJ_LIFESPAN.HEALING_RING;
    this.hp = Constants.MAX_HEALTH_TYPES.MAGE;
    this.radius = Constants.RADIUS_TYPES.HEALING_RING  + (Constants.RADIUS_TYPES.AURA_HR * charge);
    this.maxradius = this.radius;
    this.damage = Constants.DAMAGE_TYPES.HEALING_RING;
    this.classType = Constants.CLASS_TYPES.HEALING_RING;
    this.healing = Constants.HEALING_TYPES.HEALING_RING  + (Constants.HEALING_TYPES.AURA_HR * charge);
    this.selfheal = true;
    this.pierce = Constants.PROJ_PIERCE.HEALING_RING;
    this.resourcePool = Constants.QUANTITIES.HEALING_RING + Constants.QUANTITIES.AURA_HR * charge;
    this.maxResourcePool = this.resourcePool;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    this.radius = (this.maxradius / 2) + (this.maxradius / 2 * this.resourcePool / this.maxResourcePool);
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
    this.pierce = Constants.PROJ_PIERCE.KNIFE_THROW;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    return super.update(dt);
  }
}
class RogueSwipe extends DiscreteProjectileRect {
  constructor(parentID, x, y, dir, team, w, h, parent, invis) {
    super(parentID, x, y, dir, team, w, h);
    this.parent = parent;
    this.classType = Constants.CLASS_TYPES.ROGUE_SWIPE;
    this.lifespan = Constants.PROJ_LIFESPAN.ROGUE_SWIPE; // this determines how fast the sword swipes across its arc
    this.swipeupdate();
    this.pierce = Constants.PROJ_PIERCE.ROGUE_SWIPE;
    this.numHits = Constants.PROJ_NUM_HITS.ROGUE_SWIPE;
    this.damage = Constants.DAMAGE_TYPES.ROGUE_SWIPE;
    this.invisible = invis;
    if (invis) {
      this.pierce *= 3;
      this.numHits += 2;
      this.damage *= 2;
    }
  }
  swipeupdate() {
    let x = this.parent.x;
    let y = this.parent.y;
    let totalArc = Math.PI;
    let startArc = this.parent.direction - (totalArc / 2);
    let currentArc = totalArc * (this.currenttime / this.lifespan);
    var direction = startArc + currentArc - (Math.PI / 2); // Not sure why a constant PI/2 needs to be subtracted but it does
    let dist = 40;
    this.x = x + Math.cos(direction) * dist;
    this.y = y + Math.sin(direction) * dist;
    this.direction = direction + Math.PI / 2;
  }
  update(dt) {
    this.swipeupdate();
    return super.update(dt);
  }
  collide(dt, entity) {
    if (entity.armor > this.pierce) {
      this.currenttime = this.lifespan;
    }
    this.numHits -= 1;
    this.collided.push(entity);
    if (entity.team == this.team) {
      return this.healing;
    } 
    else {
      let damage;
      if (this.invisible)
        damage = entity.maxhp / 3;
      else damage = entity.maxhp / 6;
      return damage;
    }
  }
}

class WarriorSwipe extends DiscreteProjectileRect {
  constructor(parentID, x, y, dir, team, w, h, parent, cutdir) {
    super(parentID, x, y, dir, team, w, h);
    this.parent = parent;
    this.classType = Constants.CLASS_TYPES.SWORD_SWIPE;
    this.lifespan = Constants.PROJ_LIFESPAN.SWORD_SWIPE; // this determines how fast the sword swipes across its arc
    this.cutdir = cutdir; // 0 = left-to-right, 1 = right-to-left
    this.swipeupdate();
    this.pierce = Constants.PROJ_PIERCE.SWORD_SWIPE;
    this.numHits = Constants.PROJ_NUM_HITS.SWORD_SWIPE;
    this.damage = Constants.DAMAGE_TYPES.SWORD_SWIPE;
  }
  swipeupdate() {
    let x = this.parent.x;
    let y = this.parent.y;
    let totalArc = Math.PI * 2 / 3;
    if (this.cutdir == 0) {
      let startArc = this.parent.direction - (totalArc / 2);
      let currentArc = totalArc * (this.currenttime / this.lifespan);
      var direction = startArc + currentArc - (Math.PI / 2); // Not sure why a constant PI/2 needs to be subtracted but it does
    } else {
      let startArc = this.parent.direction + (totalArc / 2);
      let currentArc = totalArc * (this.currenttime / this.lifespan);
      var direction = startArc - currentArc - (Math.PI / 2); // Not sure why a constant PI/2 needs to be subtracted but it does
    }
    let dist = 50;
    this.x = x + Math.cos(direction) * dist;
    this.y = y + Math.sin(direction) * dist;
    this.direction = direction + Math.PI / 2;
  }
  update(dt) {
    this.swipeupdate();
    return super.update(dt);
  }
}
class SpearThrow extends DiscreteProjectileRect {
  constructor(parentID, x, y, dir, team, w, h, parent) {
    super(parentID, x, y, dir, team, w, h);
    this.parent = parent;
    this.speed = Constants.SPEED_TYPES.SPEAR_THROW;
    this.lifespan = Constants.PROJ_LIFESPAN.SPEAR_THROW;
    this.classType = Constants.CLASS_TYPES.SPEAR_THROW;
    this.pierce = Constants.PROJ_PIERCE.SPEAR_THROW;
    this.damage = Constants.DAMAGE_TYPES.SPEAR_THROW;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    return super.update(dt);
  }
  collide(dt, entity) {
    if (entity.team != this.team) {
      entity.slow = 2.0;
    }
    return super.collide(dt, entity);
  }
}
class BruteSwipe extends DiscreteProjectile {
  constructor(parentID, x, y, dir, team, parent, cutdir) {
    super(parentID, x, y, dir, team);
    this.parent = parent;
    this.radius = Constants.RADIUS_TYPES.FIST_SMASH;
    this.lifespan = Constants.PROJ_LIFESPAN.FIST_SMASH; // this determines how fast the sword swipes across its arc
    this.damage = Constants.DAMAGE_TYPES.FIST_SMASH;
    this.numHits = Constants.PROJ_NUM_HITS.FIST_SMASH;
    this.pierce = Constants.PROJ_PIERCE.FIST_SMASH;
    this.cutdir = cutdir; // 0 = left-to-right, 1 = right-to-left
    this.swipeupdate();
  }
  swipeupdate() {
    let x = this.parent.x;
    let y = this.parent.y;
    let totalArc = Math.PI;
    if (this.cutdir == 0) {
      let startArc = this.parent.direction - (totalArc / 2);
      let currentArc = totalArc * (this.currenttime / this.lifespan);
      var direction = startArc + currentArc - (Math.PI / 2); // Not sure why a constant PI/2 needs to be subtracted but it does
    } else {
      let startArc = this.parent.direction + (totalArc / 2);
      let currentArc = totalArc * (this.currenttime / this.lifespan);
      var direction = startArc - currentArc - (Math.PI / 2); // Not sure why a constant PI/2 needs to be subtracted but it does
    }
    let dist = 60;
    this.x = x + Math.cos(direction) * dist;
    this.y = y + Math.sin(direction) * dist;
    this.direction = direction + Math.PI / 2;
  }
  update(dt) {
    this.swipeupdate();
    return super.update(dt);
  }
}

class RagingBruteSwipe extends BruteSwipe {
  constructor(parentID, x, y, dir, team, parent, cutdir) {
    super(parentID, x, y, dir, team, parent, cutdir);
    this.radius = Constants.RADIUS_TYPES.RAGING_FIST_SMASH;
    this.lifespan = Constants.PROJ_LIFESPAN.RAGING_FIST_SMASH; // this determines how fast the sword swipes across its arc
    this.damage = Constants.DAMAGE_TYPES.RAGING_FIST_SMASH;
    this.numHits = Constants.PROJ_NUM_HITS.RAGING_FIST_SMASH;
    this.pierce = Constants.PROJ_PIERCE.RAGING_FIST_SMASH;
    this.swipeupdate();
  }
}

class GroundPound extends ContinuousProjectile {
  constructor(parentID, x, y, dir, team, raging) {
    super(parentID, x, y, dir, team);
    this.speed = Constants.SPEED_TYPES.GROUND_POUND;
    this.lifespan = Constants.PROJ_LIFESPAN.GROUND_POUND;
    this.radius = Constants.RADIUS_TYPES.GROUND_POUND;
    this.damage = Constants.DAMAGE_TYPES.GROUND_POUND;
    this.classType = Constants.CLASS_TYPES.GROUND_POUND;
    this.pierce = Constants.PROJ_PIERCE.GROUND_POUND;
    this.resourcePool = Constants.QUANTITIES.GROUND_POUND;
    this.maxResourcePool = this.resourcePool;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    return super.update(dt);
  }
  collide(dt, entity) {
    let x1 = this.x;
    let y1 = this.y;
    let x2 = entity.x;
    let y2 = entity.y;
    let direction = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
    let speed = Constants.SPEED_TYPES.GROUND_POUND_PULL;
    // console.log(x1,y1,x2,y2,direction,speed);
    entity.x += dt * speed * Math.sin(direction);
    entity.y -= dt * speed * Math.cos(direction);
    // console.log(entity);
    return super.collide(dt, entity);
  }
}

module.exports.Projectile = Projectile;
module.exports.DiscreteProjectile = DiscreteProjectile;
module.exports.ContinuousProjectile = ContinuousProjectile;

module.exports.EnergyBall = EnergyBall;
module.exports.HealingRing = HealingRing;

module.exports.KnifeThrow = KnifeThrow;
module.exports.RogueSwipe = RogueSwipe;

module.exports.WarriorSwipe = WarriorSwipe;
module.exports.SpearThrow = SpearThrow;

module.exports.BruteSwipe = BruteSwipe;
module.exports.RagingBruteSwipe = RagingBruteSwipe;
module.exports.GroundPound = GroundPound;