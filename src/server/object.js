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
    this.healing = 0;
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
  constructor(id, x, y, dir, team, w, h) {
    super(id, x, y, dir, team) //x and y are center of rectangle
    this.width = w; //ids need to be different otherwise interpolates weird
    this.height = h;
    this.radius = Math.sqrt(w * w + h * h); // distance from center to corner point
    this.direction = this.radiansCorrectRange(this.direction);
  }
  // Makes sure angle stays in range of [pi, -pi]
  radiansCorrectRange(angle) {
    while (angle >= Math.PI) {
      angle -= 2 * Math.PI;
    }
    while (angle <= -Math.PI) {
      angle += 2 * Math.PI;
    }
    return angle;
  }
  //https://gamedev.stackexchange.com/questions/86755/how-to-calculate-corner-positions-marks-of-a-rotated-tilted-rectangle#:~:text=(1)%20If%20c%20is%20the,via%20the%20trig%20formulas%20cited.
  getCornerPoints() {
    let centerX = this.x; 
    let centerY = this.y; 
    let width = this.width; 
    let height = this.height; 
    let angle = this.direction;
    // Calculate half-width and half-height
    var halfWidth = width / 2;
    var halfHeight = height / 2;

    let angleRad = this.radiansCorrectRange(angle);

    // Calculate the cos and sin of the angle
    var cosAngle = Math.cos(angleRad);
    var sinAngle = Math.sin(angleRad);

    // Calculate the coordinates of the corners
    var x1 = centerX + halfWidth * cosAngle - halfHeight * sinAngle; // Top left x
    var y1 = centerY + halfWidth * sinAngle + halfHeight * cosAngle; // Top left y

    var x2 = centerX - halfWidth * cosAngle - halfHeight * sinAngle; // Top right x
    var y2 = centerY - halfWidth * sinAngle + halfHeight * cosAngle; // Top right y

    var x3 = centerX - halfWidth * cosAngle + halfHeight * sinAngle; // Bottom right x
    var y3 = centerY - halfWidth * sinAngle - halfHeight * cosAngle; // Bottom right y

    var x4 = centerX + halfWidth * cosAngle + halfHeight * sinAngle; // Bottom left x
    var y4 = centerY + halfWidth * sinAngle - halfHeight * cosAngle; // Bottom left y

    // Return the coordinates of the corners as an array of dicts
    return [
        {x: x1, y: y1}, // Top left
        {x: x2, y: y2}, // Top right
        {x: x3, y: y3}, // Bottom right
        {x: x4, y: y4}  // Bottom left
    ];
}
  update(dt) {
    this.direction = this.radiansCorrectRange(this.direction);
    super.update(dt);
  }
  serializeForUpdate() {
    return {
      ...(super.serializeForUpdate()),
      width: this.width,
      height: this.height
    };
  }
}

module.exports.Object = Object;
module.exports.Rectangle = Rectangle;
