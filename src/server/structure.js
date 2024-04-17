const Object = require('./object');
const shortid = require('shortid');
const Constants = require('../shared/constants');

C_ATTRIBUTES = ['PROJ_LIFESPAN','RADIUS_TYPES','DAMAGE_TYPES',
  'CLASS_TYPES','SPEED_TYPES','MASS_TYPES','MAX_HEALTH_TYPES',
  'MAX_HEALTH_TYPES','ARMOR_TYPES']
ATTRIBUTES = ['lifespan','radius','damage',
  'classType','speed','mass','hp',
  'maxhp','armor']

// Structures are Objects that have more persistence
// i.e. walls, shields, and they generally stop 
// projectiles and players from moving through
class Structure extends Object.Object {
  constructor(parentID, x, y, dir, team) {
    super(shortid(), x, y, dir, team);
    this.parentID = parentID;
    this.currenttime = 0;
    for (let i = 0; i < ATTRIBUTES.length; i++) {
      this[ATTRIBUTES[i]] = Constants[C_ATTRIBUTES[i]].STRUCTURE;
    }
  }
    // Returns true if the structure should be destroyed
  update(dt) {
    super.update(dt);
    this.currenttime += dt;
    if (this.currenttime >= this.lifespan) return true;
    if (this.hp <= 0) return true;
    return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE;
  }
  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      hp: this.hp,
      maxhp: this.maxhp,
    };
  }
  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp < 0) {
      this.hp = 0;
    }
  }
}

class StructureRect extends Object.Rectangle {
  constructor(parentID, x, y, dir, team, w, h) {
    super(shortid(), x, y, dir, team, w, h);
    this.parentID = parentID;
    this.currenttime = 0;
    for (let i = 0; i < ATTRIBUTES.length; i++) {
      this[ATTRIBUTES[i]] = Constants[C_ATTRIBUTES[i]].STRUCTURE;
    }
  }
    // Returns true if the structure should be destroyed
  update(dt) {
    super.update(dt);
    this.currenttime += dt;
    if (this.currenttime >= this.lifespan) return true;
    if (this.hp <= 0) return true;
    return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE;
  }
  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      hp: this.hp,
      maxhp: this.maxhp,
    };
  }
  takeDamage(damage) {
    this.hp -= damage;
  }
}

class MagicWall extends StructureRect {
    constructor(parentID, x, y, dir, team, w, h, finX, finY) {
        super(parentID, x, y, dir, team, w, h);
        this.startX = x;
        this.startY = y;
        this.distance = this.distanceTo2(finX, finY);
        for (let i = 0; i < ATTRIBUTES.length; i++) {
          this[ATTRIBUTES[i]] = Constants[C_ATTRIBUTES[i]].MAGIC_WALL;
        }
    }
    // Returns true if the projectile should be destroyed
    update(dt) {
        if (super.update(dt)) return true;
        if (this.distanceTo2(this.startX, this.startY) >= this.distance) this.speed = 0;
        return false;
    }
}

class Shield extends StructureRect {
    constructor(parentID, x, y, dir, team, w, h, parent) {
        super(parentID, x, y, dir, team, w, h);
        this.startX = x;
        this.startY = y;
        this.speed = 0;
        this.parent = parent;
        for (let i = 0; i < ATTRIBUTES.length; i++) {
          this[ATTRIBUTES[i]] = Constants[C_ATTRIBUTES[i]].SHIELD;
        }
    }
    // Returns true if the projectile should be destroyed
    update(dt) {
        this.currenttime -= dt;
        return super.update(dt);
    }
    shieldupdate(x, y, direction) {
        direction -= Math.PI / 2;
        let shielddist = 50;
        this.x = x + Math.cos(direction) * shielddist ;
        this.y = y + Math.sin(direction) * shielddist;
        this.direction = direction + Math.PI / 2;
    }
    // regen(dt) {
    //     this.hp += Constants.REGEN_TYPES.SHIELD * dt;
    //     if (this.hp < 0 ) this.hp = 0;
    //     if (this.hp > Constants.MAX_HEALTH_TYPES.SHIELD) this.hp = Constants.MAX_HEALTH_TYPES.SHIELD;
    // }
}

// class WarriorSwipe extends Structure {
//   constructor(parentID, x, y, dir, team) {
//       super(parentID, x, y, dir, team);
//       this.startX = x;
//       this.startY = y;
//       this.lifespan = Constants.PROJ_LIFESPAN.SWORD_SWIPE;
//       this.hp = Constants.MAX_HEALTH_TYPES.SWORD_SWIPE;
//       this.maxhp = Constants.MAX_HEALTH_TYPES.SWORD_SWIPE;
//       this.radius = Constants.RADIUS_TYPES.SWORD_SWIPE;
//       this.damage = Constants.DAMAGE_TYPES.SWORD_SWIPE;
//       this.classType = Constants.CLASS_TYPES.SWORD_SWIPE;
//       this.mass = Constants.MASS_TYPES.SWORD_SWIPE;
//       this.speed = 0;
//   }
//   // Returns true if the projectile should be destroyed
//   update(dt) {
//       if (super.update(dt)) return true;
//       return false;
//   }
// }

  module.exports.Structure = Structure;
  module.exports.MagicWall = MagicWall;
  module.exports.Shield = Shield;
  // module.exports.WarriorSwipe = WarriorSwipe;