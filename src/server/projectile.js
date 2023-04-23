const shortid = require('shortid');
const Object = require('./object');
const Constants = require('../shared/constants');

class Projectile extends Object.Object {
  constructor(parentID, x, y, dir) {
    super(shortid(), x, y, dir, Constants.SPEED_TYPES.BULLET);
    this.parentID = parentID;
    this.lifespan = Constants.PROJ_LIFESPAN.BULLET;
    this.currenttime = 0;
  }

  // Returns true if the projectile should be destroyed
  update(dt) {
    super.update(dt);
    this.currenttime += dt;
    if (this.currenttime >= this.lifespan) return true;
    return this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE;
  }
}

class MagicWall extends Projectile {
  constructor(parentID, x, y, dir, finX, finY) {
    super(parentID, x, y, dir);
    this.speed = Constants.SPEED_TYPES.MAGIC_WALL;
    this.finalX = finX;
    this.finalY = finY;
    this.lifespan = Constants.PROJ_LIFESPAN.MAGIC_WALL;
    this.hp = Constants.MAX_HEALTH_TYPES.MAGE;
  }
  // Returns true if the projectile should be destroyed
  update(dt) {
    super.update(dt);
    if (this.x < 0 || this.x > Constants.MAP_SIZE || this.y < 0 || this.y > Constants.MAP_SIZE) return true;
    if (this.currenttime >= this.lifespan) return true;
    if (this.direction >= -Math.PI && this.direction <= -Math.PI / 2) {
      if (this.x <= this.finalX || this.y <= this.finalY) this.speed = 0;
    } else if (this.direction <= 0) {
      if (this.x <= this.finalX || this.y >= this.finalY) this.speed = 0;
    } else if (this.direction <= Math.PI / 2) {
      if (this.x >= this.finalX || this.y >= this.finalY) this.speed = 0;
    } else if (this.direction <= Math.PI) {
      if (this.x >= this.finalX || this.y <= this.finalY) this.speed = 0;
    }
    return false;
  }
}

module.exports = Projectile;
