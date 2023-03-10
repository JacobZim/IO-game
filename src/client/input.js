// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#6-client-input-%EF%B8%8F
import { updateDirection, updateKeys, updateMouse } from './networking';

function onMouseInput(e) {
  handleInput(e.clientX, e.clientY);
}

function onTouchInput(e) {
  const touch = e.touches[0];
  
  handleInput(touch.clientX, touch.clientY);
}

function handleInput(x, y) {
  const dir = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
  updateDirection(dir);
}

function onKeyDown(e) {
  let pressed = [];
  switch (e.key) {
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
    default:
  }
  updateKeys(pressed, []);
}

function onKeyUp(e) {
  let released = [];
  switch (e.key) {
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
}
