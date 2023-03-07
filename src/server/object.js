class Object {
  constructor(id, x, y, dir, speed) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.direction = dir;
    this.speed = speed;
  }


  update(dt) {
    this.x += dt * this.speed * Math.sin(this.direction);
    this.y -= dt * this.speed * Math.cos(this.direction);
  }

  distanceTo(object) {
    const dx = this.x - object.x;
    const dy = this.y - object.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setDirection(dir) {
    this.direction = dir;
  }

  serializeForUpdate() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }

  setDxDy() {
    //let rad = this.direction * 3.1415 / 180;
    this.dx = cos(this.direction) * this.speed;
    this.dy = sin(this.direction) * this.speed;
  }

  getNextX() {
    return this.x + this.getDX();
  }
  getNextY() {
    return this.y + this.getDY();
  }
  getDY() { return this.dy; }
  getDX() { return this.dx; }
}

module.exports = Object;
