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

function renderProjectile(me, projectile) {
  const { id, x, y, team, radius, direction, classType } = projectile;
  
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
      classType == Constants.CLASS_TYPES.SWORD_SWIPE ||
      classType == Constants.CLASS_TYPES.FIST_SMASH) {
        asset = getAsset('blueProjectile.svg');
    } else if(classType == Constants.CLASS_TYPES.MAGIC_WALL) {
      asset = getAsset('blueMagicWall.svg');
    } else if(classType == Constants.CLASS_TYPES.HEALING_RING) {
      asset = getAsset('blueHealingRing.svg')
    } else asset = getAsset('bullet.svg');
  } else if (team == 1) {
    if (classType == Constants.CLASS_TYPES.ENERGY_BALL ||
      classType == Constants.CLASS_TYPES.KNIFE_THROW || 
      classType == Constants.CLASS_TYPES.SWORD_SWIPE ||
      classType == Constants.CLASS_TYPES.FIST_SMASH) {
        asset = getAsset('redProjectile.svg');
    } else if(classType == Constants.CLASS_TYPES.MAGIC_WALL) {
      asset = getAsset('redMagicWall.svg');
    } else if(classType == Constants.CLASS_TYPES.HEALING_RING) {
      asset = getAsset('redHealingRing.svg')
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
  context.drawImage(
    asset,
    -radius,//canvas.width / 2 + x - me.x - Constants.RADIUS_TYPES.BULLET,
    -radius,//canvas.height / 2 + y - me.y - Constants.RADIUS_TYPES.BULLET,
    radius * 2,//Constants.RADIUS_TYPES.BULLET * 2,
    radius * 2,//Constants.RADIUS_TYPES.BULLET * 2,
  );
  context.restore();
}

function renderStructure(me, structure) {
  const { x, y, team, radius, direction, classType, hp, maxhp } = structure;
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
    } else asset = getAsset('playerBlue.svg');
  } else if (team == 1) {
    if(classType == Constants.CLASS_TYPES.MAGIC_WALL) {
      asset = getAsset('redMagicWall.svg');
    } else if (classType == Constants.CLASS_TYPES.SHIELD) {
      asset = getAsset('redMagicWall.svg');
    } else if (classType == Constants.CLASS_TYPES.WARRIOR) {
      asset = getAsset('warriorRed.svg');
    } else if (classType == Constants.CLASS_TYPES.BRUTE) {
      asset = getAsset('bruteRed.svg');
    } else asset = getAsset('playerRed.svg');
  }
  if (structure.invisible) {
    context.globalAlpha = 1.0 - player.invisble;
  }
  // Draw class asset
  context.drawImage(
    asset,
    -radius,
    -radius,
    radius * 2,
    radius * 2,
  );

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
  context.restore();
  context.globalAlpha = 1.0;
}
/*
function renderRectangle(me, structure) {
  const { x, y, direction, width, height, tl} = structure;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;
  //console.log("renderStructure x, y, tl, width, height: ", x, " ",y," ",tl," ",width," ",height," ",direction);
  console.log("tl[0], tl[1]: ", tl[0]," ",tl[1]);
  // Draw structure
  context.save();
  context.translate(canvasX, canvasY);
  context.rotate(direction);
  var asset;
  asset = getAsset('rectangle.svg');
  context.drawImage(
    asset,
    -width / 2,//bl[0],
    -height / 2,//bl[1],
    width,//tr[0],
    height//tr[1],
  );
  context.restore();
  //test tl calculation
  context.save();
  context.translate(canvasX - x, canvasY + y);
  context.fillStyle = 'white';
  context.fillRect(
    tl[0],//-width/2,
    -tl[1],//-height/2,
    4,
    4,
  );
  context.restore();
}*/

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
