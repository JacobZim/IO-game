// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { updateDirection, updateKeys, updateMouse } from './networking';
// Get the canvas graphics context
const canvas = document.getElementById('game-canvas');

function onMouseInput(e) {
  handleInput(e.clientX, e.clientY);
}

function onTouchInput(e) {
  const touch = e.touches[0];
  
  handleInput(touch.clientX, touch.clientY);
}

// FORMULA const canvasX = canvas.width / 2 + x - me.x;
function handleInput(canvasx, canvasy) {
  const dir = Math.atan2(canvasx - window.innerWidth / 2, window.innerHeight / 2 - canvasy);
  let x = canvasx - (canvas.width / 2);
  let y = canvasy - (canvas.height / 2);
  updateDirection(dir, x, y);
}

function onKeyDown(x) {
  let pressed = [];
  switch (x.key) {
    case 'w':
      pressed.push('w');
      break;
    case 'a':
      pressed.push('a');
      break;
    case 's':
      pressed.push('s');
      break;
    case 'd':
      pressed.push('d');
      break;
    case 'e':
      pressed.push('e');
      break;
    case 'q':
      pressed.push('q');
      break;
    case ' ':
      pressed.push('space');
      break;
    default:
  }
  updateKeys(pressed, []);
}

function onKeyUp(x) {
  let released = [];
  switch (x.key) {
    case 'w':
      released.push('w');
      break;
    case 'a':
      released.push('a');
      break;
    case 's':
      released.push('s');
      break;
    case 'd':
      released.push('d');
      break;
    case 'e':
      released.push('e');
      break;
    case 'q':
      released.push('q');
      break;
    case ' ':
      released.push('space');
      break;
    default:
  }
  updateKeys([], released);
}

function onMouseDown(e) {
  updateMouse(true);
}
function onMouseUp(e) {
  updateMouse(false);
}

export function startCapturingInput() {
  window.addEventListener('mousemove', onMouseInput);
  window.addEventListener('click', onMouseInput);
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
}

export function stopCapturingInput() {
  window.removeEventListener('mousemove', onMouseInput);
  window.removeEventListener('click', onMouseInput);
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  window.removeEventListener('mousedown', onMouseDown);
  window.removeEventListener('mouseup', onMouseUp);
}
