const Object = require('./object');
const shortid = require('shortid');
const Constants = require('../shared/constants');



class Structure extends Object.Object {
  constructor(parentID, x, y, dir, team) {
    super(shortid(), x, y, dir, team);
    this.parentID = parentID;
    this.lifespan = Constants.PROJ_LIFESPAN.STRUCTURE;
    this.currenttime = 0;
    this.radius = Constants.RADIUS_TYPES.STRUCTURE;
    this.damage = Constants.DAMAGE_TYPES.STRUCTURE;
    this.classType = Constants.CLASS_TYPES.STRUCTURE;
    this.speed = Constants.SPEED_TYPES.STRUCTURE;
    this.mass = Constants.MASS_TYPES.STRUCTURE;
    this.hp = Constants.MAX_HEALTH_TYPES.STRUCTURE;
    this.maxhp = Constants.MAX_HEALTH_TYPES.STRUCTURE;
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
    if (this.hp > this.maxhp) this.hp = this.maxhp;
  }
}

class MagicWall extends Structure {
    constructor(parentID, x, y, dir, team, finX, finY) {
        super(parentID, x, y, dir, team);
        this.speed = Constants.SPEED_TYPES.MAGIC_WALL;
        this.startX = x;
        this.startY = y;
        this.distance = this.distanceTo2(finX, finY);
        this.lifespan = Constants.PROJ_LIFESPAN.MAGIC_WALL;
        this.hp = Constants.MAX_HEALTH_TYPES.MAGIC_WALL;
        this.maxhp = Constants.MAX_HEALTH_TYPES.MAGIC_WALL;
        this.radius = Constants.RADIUS_TYPES.MAGIC_WALL;
        this.damage = Constants.DAMAGE_TYPES.MAGIC_WALL;
        this.classType = Constants.CLASS_TYPES.MAGIC_WALL;
        this.mass = Constants.MASS_TYPES.MAGIC_WALL;
    }
    // Returns true if the projectile should be destroyed
    update(dt) {
        if (super.update(dt)) return true;
        if (this.distanceTo2(this.startX, this.startY) >= this.distance) this.speed = 0;
        return false;
    }
}

class Shield extends Structure {
    constructor(parentID, x, y, dir, team, parent) {
        super(parentID, x, y, dir, team);
        this.startX = x;
        this.startY = y;
        this.hp = Constants.MAX_HEALTH_TYPES.SHIELD;
        this.maxhp = Constants.MAX_HEALTH_TYPES.SHIELD;
        this.radius = Constants.RADIUS_TYPES.SHIELD;
        this.damage = Constants.DAMAGE_TYPES.SHIELD;
        this.classType = Constants.CLASS_TYPES.SHIELD;
        this.mass = Constants.MASS_TYPES.SHIELD;
        this.speed = 0;
        this.parent = parent;
    }
    // Returns true if the projectile should be destroyed
    update(dt) {
        this.currenttime -= dt;
        if (super.update(dt)) return true;
        return false;
    }
    shieldupdate(x, y, direction) {
        direction -= Math.PI / 2;
        let shielddist = 50;
        this.x = x + Math.cos(direction) * shielddist ;
        this.y = y + Math.sin(direction) * shielddist;
        this.direction = direction + Math.PI / 2;
    }
    regen(dt) {
        this.hp += Constants.REGEN_TYPES.SHIELD * dt;
        if (this.hp < 0 ) this.hp = 0;
        if (this.hp > Constants.MAX_HEALTH_TYPES.SHIELD) this.hp = Constants.MAX_HEALTH_TYPES.SHIELD;
    }
}

  module.exports.Structure = Structure;
  module.exports.MagicWall = MagicWall;
  module.exports.Shield = Shield;