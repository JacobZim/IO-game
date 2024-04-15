// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';
import { getAsset } from './assets';
import { getCurrentState } from './state';

const Constants = require('../shared/constants');

//const { PLAYER_RADIUS, PLAYER_MAX_HP, BULLET_RADIUS, MAP_SIZE } = Constants;

// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');
setCanvasDimensions();

function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
}

window.addEventListener('resize', debounce(40, setCanvasDimensions));

let animationFrameRequestId;

function render() {
  const { me, others, projectiles, structures } = getCurrentState();
  if (me) {
    // Draw background
    renderBackground(me.x, me.y);

    // Draw boundaries
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    context.strokeRect(canvas.width / 2 - me.x, canvas.height / 2 - me.y, Constants.MAP_SIZE, Constants.MAP_SIZE);


    // Draw all projectiles
    projectiles.forEach(renderProjectile.bind(null, me));

    // Draw all structures 
    //console.log("structures : ", structures);
    structures.forEach(renderStructure.bind(null, me));

    // Draw all players
    renderPlayer(me, me);
    others.forEach(renderPlayer.bind(null, me));
    renderAbilities(me);
    renderResourceBar(me);
  }

  // Rerun this render function on the next frame
  animationFrameRequestId = requestAnimationFrame(render);
}

function renderBackground(x, y) {
  const backgroundX = Constants.MAP_SIZE / 2 - x + canvas.width / 2;
  const backgroundY = Constants.MAP_SIZE / 2 - y + canvas.height / 2;
  const backgroundGradient = context.createRadialGradient(
    backgroundX,
    backgroundY,
    Constants.MAP_SIZE / 10,
    backgroundX,
    backgroundY,
    Constants.MAP_SIZE / 2,
  );
  backgroundGradient.addColorStop(0, 'black');
  backgroundGradient.addColorStop(1, 'gray');
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

// Renders a ship at the given coordinates
function renderPlayer(me, player) {
  const { x, y, team, radius, direction, classType, hp, maxhp } = player;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;
  
  // Draw ship
  context.save();
  context.translate(canvasX, canvasY);
  context.rotate(direction);
  // Choose class asset
  var asset;
  if (team == 0) {
    if(classType == Constants.CLASS_TYPES.MAGE) {
      asset = getAsset('mageBlue.svg');
    } else if (classType == Constants.CLASS_TYPES.ROGUE) {
      asset = getAsset('rogueBlue.svg');
    } else if (classType == Constants.CLASS_TYPES.WARRIOR) {
      asset = getAsset('warriorBlue.svg');
    } else if (classType == Constants.CLASS_TYPES.BRUTE) {
      asset = getAsset('bruteBlue.svg');
    } else asset = getAsset('playerBlue.svg');
  } else if (team == 1) {
    if(classType == Constants.CLASS_TYPES.MAGE) {
      asset = getAsset('mageRed.svg');
    } else if (classType == Constants.CLASS_TYPES.ROGUE) {
      asset = getAsset('rogueRed.svg');
    } else if (classType == Constants.CLASS_TYPES.WARRIOR) {
      asset = getAsset('warriorRed.svg');
    } else if (classType == Constants.CLASS_TYPES.BRUTE) {
      asset = getAsset('bruteRed.svg');
    } else asset = getAsset('playerRed.svg');
  }
  // Establish team color
  //if (team == 0) context.fillStyle = Constants.TEAM_COLOR[0];
  //else if (team == 1) context.fillStyle = Constants.TEAM_COLOR[1];
  // Draw team color base
  //context.beginPath();
  //context.arc(0, 0, radius, 0, 2 * Math.PI);
  //context.fill();
  if (player.invisible) {
    context.globalAlpha = 1.0 - player.invisible;
      if (me == player) {
        if (player.invisible > 0.9) {
          context.globalAlpha = 0.1;
        }
      }
  }
  // Draw class asset
  context.drawImage(
    asset,
    -radius,
    -radius,
    radius * 2,
    radius * 2,
  );
  context.restore();
  if (player.invisible) {
    context.globalAlpha = 1.0 - player.invisible;
      if (me == player) {
        context.globalAlpha = 0.5;
      }
  }
  // Draw health bar
  context.fillStyle = 'white';
  context.fillRect(
    canvasX - radius,
    canvasY + radius + 8,
    radius * 2,
    2,
  );
  context.fillStyle = 'red';
  context.fillRect(
    canvasX - radius + radius * 2 * hp / maxhp,
    canvasY + radius + 8,
    radius * 2 * (1 - hp / maxhp),
    2,
  );
  context.globalAlpha = 1.0;
}

function renderAbilities(me) {
  let { x, y, team, radius, direction, classType, hp, maxhp, spaceCooldown, eCooldown } = me;
  if (spaceCooldown == 0) spaceCooldown = "_";
  else spaceCooldown = Math.floor(spaceCooldown).toString();
  if (eCooldown == 0) eCooldown = "E";
  else eCooldown = Math.floor(eCooldown).toString();
  let text = eCooldown + " " + spaceCooldown;
  let X = text.length * 30;
  let Y = 20;
  const canvasX = canvas.width - X;
  const canvasY = canvas.height - Y;
  // Draw abilities
  context.fillStyle = 'white';
  context.font = "48px serif";
  context.fillText(text, canvasX, canvasY);
}

function renderResourceBar(me) {
  const canvasX = canvas.width / 2;
  const canvasY = canvas.height / 2;
  let radius = me.radius;
  if (me.rage) {
    // Draw rage bar
    context.fillStyle = 'orange';
    context.fillRect(
      canvasX - radius * me.rage,
      canvasY + radius + 12,
      radius * 2 * me.rage,
      2,
    );
  }
  if (me.shields && !me.shieldsActive) {
    // Draw shields' health bars
    let s1 = me.shields[0] / Constants.MAX_HEALTH_TYPES.SHIELD;
    let s2 = me.shields[1] / Constants.MAX_HEALTH_TYPES.SHIELD;
    let s3 = me.shields[2] / Constants.MAX_HEALTH_TYPES.SHIELD;
    context.fillStyle = 'lightblue';
    context.fillRect(
      canvasX - radius - 1,
      canvasY + radius + 12,
      radius * 2 / 3 * s1,
      2,
    );
    context.fillRect(
      canvasX - radius * 1/3,
      canvasY + radius + 12,
      radius * 2 / 3 * s2,
      2,
    );
    context.fillRect(
      canvasX + radius * 1/3 + 1,
      canvasY + radius + 12,
      radius * 2 / 3 * s2,
      2,
    );
  }
}

function renderProjectile(me, projectile) {
  const { id, x, y, team, radius, direction, classType, width, height } = projectile;
  
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;
  
  // Rotate projectile
  context.save();
  context.translate(canvasX, canvasY);
  context.rotate(direction);

  // Choose class asset
  var asset;
  if (team == 0) {
    if (classType == Constants.CLASS_TYPES.ENERGY_BALL ||
      classType == Constants.CLASS_TYPES.KNIFE_THROW ||
      classType == Constants.CLASS_TYPES.FIST_SMASH) {
        asset = getAsset('blueProjectile.svg');
    } else if(classType == Constants.CLASS_TYPES.MAGIC_WALL) {
      asset = getAsset('blueMagicWall.svg');
    } else if(classType == Constants.CLASS_TYPES.HEALING_RING) {
      asset = getAsset('blueHealingRing.svg');
    } else if(classType == Constants.CLASS_TYPES.SWORD_SWIPE) {
      asset = getAsset('rectangle.svg');
    }  else asset = getAsset('bullet.svg');
  } else if (team == 1) {
    if (classType == Constants.CLASS_TYPES.ENERGY_BALL ||
      classType == Constants.CLASS_TYPES.KNIFE_THROW ||
      classType == Constants.CLASS_TYPES.FIST_SMASH) {
        asset = getAsset('redProjectile.svg');
    } else if(classType == Constants.CLASS_TYPES.MAGIC_WALL) {
      asset = getAsset('redMagicWall.svg');
    } else if(classType == Constants.CLASS_TYPES.HEALING_RING) {
      asset = getAsset('redHealingRing.svg')
    } else if(classType == Constants.CLASS_TYPES.SWORD_SWIPE) {
      asset = getAsset('rectangle.svg');
    } else asset = getAsset('bullet.svg');
  } else {
    asset = getAsset('bullet.svg');
  }
  

  // Establish team color
  if (team == 0) context.fillStyle = Constants.TEAM_COLOR[0];
  else if (team == 1) context.fillStyle = Constants.TEAM_COLOR[1];

  // Draw team color base
  //context.beginPath();
  //context.arc(0, 0, radius, 0, 2 * Math.PI);
  //context.fill();
  // Draw class asset
  if (width) {
    // console.log("w/h:",width,height)
    // Rectangle images
    context.drawImage(
      asset,
      -width / 2,
      (-height / 2),
      width,
      height,
    )
  } else {
    context.drawImage(
      asset,
      -radius,
      -radius,
      radius * 2,
      radius * 2,
    )
  }
  context.restore();
}

function renderStructure(me, structure) {
  const { x, y, team, radius, direction, classType, hp, maxhp, width, height } = structure;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;
  
  // Draw ship
  context.save();
  context.translate(canvasX, canvasY);
  context.rotate(direction);
  // Choose class asset
  var asset;
  if (team == 0) {
    if(classType == Constants.CLASS_TYPES.MAGIC_WALL) {
      asset = getAsset('blueMagicWall.svg');
    } else if (classType == Constants.CLASS_TYPES.SHIELD) {
      asset = getAsset('blueMagicWall.svg');
    } else if (classType == Constants.CLASS_TYPES.WARRIOR) {
      asset = getAsset('warriorBlue.svg');
    } else if (classType == Constants.CLASS_TYPES.BRUTE) {
      asset = getAsset('bruteBlue.svg');
    } else asset = getAsset('rectangle.svg');
  } else if (team == 1) {
    if(classType == Constants.CLASS_TYPES.MAGIC_WALL) {
      asset = getAsset('redMagicWall.svg');
    } else if (classType == Constants.CLASS_TYPES.SHIELD) {
      asset = getAsset('redMagicWall.svg');
    } else if (classType == Constants.CLASS_TYPES.WARRIOR) {
      asset = getAsset('warriorRed.svg');
    } else if (classType == Constants.CLASS_TYPES.BRUTE) {
      asset = getAsset('bruteRed.svg');
    } else asset = getAsset('rectangle.svg');
  }
  if (structure.invisible) {
    context.globalAlpha = 1.0 - player.invisble;
  }
  // Draw class asset
  if (width) {
    if ([Constants.CLASS_TYPES.SHIELD, Constants.CLASS_TYPES.MAGIC_WALL].includes(classType)) {
      var h = height * (hp / maxhp) + 2;
    } else {
      var h = height;
    }
    // Rectangle images
    context.drawImage(
      asset,
      -width / 2,
      (-height / 2),
      width,
      h,
    )
  } else {
    context.drawImage(
      asset,
      -radius,
      -radius,
      radius * 2,
      radius * 2,
    )
    // Draw health bar
    context.fillStyle = 'white';
    context.fillRect(
      - radius / 2,
      + radius ,
      radius ,
      2,
    );
    context.fillStyle = 'red';
    context.fillRect(
        - radius / 2 + radius * hp / maxhp,
      + radius ,
      radius * (1 - hp / maxhp),
      2,
    );
  }

  context.restore();
  context.globalAlpha = 1.0;
}

function renderMainMenu() {
  const t = Date.now() / 7500;
  const x = Constants.MAP_SIZE / 2 + 800 * Math.cos(t);
  const y = Constants.MAP_SIZE / 2 + 800 * Math.sin(t);
  renderBackground(x, y);

  // Rerun this render function on the next frame
  animationFrameRequestId = requestAnimationFrame(renderMainMenu);
}

animationFrameRequestId = requestAnimationFrame(renderMainMenu);

// Replaces main menu rendering with game rendering.
export function startRendering() {
  cancelAnimationFrame(animationFrameRequestId);
  animationFrameRequestId = requestAnimationFrame(render);
}

// Replaces game rendering with main menu rendering.
export function stopRendering() {
  cancelAnimationFrame(animationFrameRequestId);
  animationFrameRequestId = requestAnimationFrame(renderMainMenu);
}
