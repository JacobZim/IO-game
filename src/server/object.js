class Object {
  constructor(id, x, y, dir, team) {
    this.id = id;
    this.radius = 0;
    this.x = x;
    this.y = y;
    //this.dx = 0;
    //this.dy = 0;
    this.direction = dir; //radians (-pi, pi)
    this.speed = 0;
    this.team = team;
    this.damage = 0;
    this.classType = -1;
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
  distanceTo2(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
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
      team: this.team,
      radius: this.radius,
      direction: this.direction,
      classType: this.classType,
    };
  }
  /*setDxDy() {
    //let rad = this.direction * 3.1415 / 180;
    this.dx = cos(this.direction) * this.speed;
    this.dy = sin(this.direction) * this.speed;
  }*/
  getNextX() {
    return this.x + this.getDX();
  }
  getNextY() {
    return this.y + this.getDY();
  }
  //getDY() { return this.dy; }
  //getDX() { return this.dx; }
}

class Rectangle extends Object {
  constructor(id, x, y, w, h, dir, speed) {
    super(id, x, y, dir, speed) //x and y are center of rectangle
    this.width = w; //ids need to be different otherwise interpolates weird
    this.height = h;
    this.radius = Math.sqrt(w * w + h * h);
    this.hwratio = Math.atan(h/w); //Hieght/width ratio
    this.direction = this.radiansCorrectRange(this.direction);
  }
  radiansCorrectRange(angle) {
    while (angle >= Math.PI) {
      angle -= 2 * Math.PI;
    }
    while (angle <= -Math.PI) {
      angle += 2 * Math.PI;
    }
    return angle;
  }
  getPointFromAngle(angle) {
    let x = (Math.cos(angle) * this.radius);// + this.x;
    let y = (Math.sin(angle) * this.radius);// + this.y;
    return [x, y];
  }
  //https://gamedev.stackexchange.com/questions/86755/how-to-calculate-corner-positions-marks-of-a-rotated-tilted-rectangle#:~:text=(1)%20If%20c%20is%20the,via%20the%20trig%20formulas%20cited.
  getTR() {
    let dir = this.direction;
    let tempX = this.width / 2;
    let tempY = this.height / 2;

    let rotatedX = tempX*Math.cos(dir) - tempY*Math.sin(dir);
    let rotatedY = tempX*Math.sin(dir) + tempY*Math.cos(dir);

    return [this.x + rotatedX, this.y + rotatedY];
  }
  getBR() {
    let dir = this.direction;
    let tempX = this.width / 2;
    let tempY = -this.height / 2;

    let rotatedX = tempX*Math.cos(dir) - tempY*Math.sin(dir);
    let rotatedY = tempX*Math.sin(dir) + tempY*Math.cos(dir);

    return [this.x + rotatedX, this.y + rotatedY];
  }
  getBL() {
    let dir = this.direction;
    let tempX = -this.width / 2;
    let tempY = -this.height / 2;

    let rotatedX = tempX*Math.cos(dir) - tempY*Math.sin(dir);
    let rotatedY = tempX*Math.sin(dir) + tempY*Math.cos(dir);

    return [this.x + rotatedX, this.y + rotatedY];
  }
  getTL() {
    let dir = this.direction;
    let tempX = -this.width / 2;
    let tempY = this.height / 2;

    let rotatedX = tempX*Math.cos(dir) - tempY*Math.sin(dir);
    let rotatedY = tempX*Math.sin(dir) + tempY*Math.cos(dir);

    return [this.x + rotatedX, this.y - rotatedY];
  }
  update(dt) {
    this.direction += .01;
    this.direction = this.radiansCorrectRange(this.direction);
    super.update(dt);
    //this.dir = this.radiansCorrectRange(this.dir + .01);
  }
  serializeForUpdate() {
    console.log("this.getTL(), type", this.getTL(), " ", typeof(this.getTL()[0]));
    return {
      ...(super.serializeForUpdate()),
      direction: this.direction,
      width: this.width,
      height: this.height,
      tl: this.getTL()
    };
  }

  /*
  getX() { return self.x; }
  getY() { return self.y; }
  getWidth() { return self.width; }
  getHeight() { return self.height; }
  getDirection() { return self.direction; }

  setX(nx) {self.x = nx; }
  setY(ny) { self.y = ny; }
  setWidth(nw) { self.width = nw; }
  setHeight(nh) { self.height = nh; }
  setDirection(nd) { self.direction = nd; }*/
}

module.exports.Object = Object;
module.exports.Rectangle = Rectangle;
