// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#4-client-networking
import io from 'socket.io-client';
import { throttle } from 'throttle-debounce';
import { processGameUpdate } from './state';

const Constants = require('../shared/constants');

const socketProtocol = (window.location.protocol.includes('https')) ? 'wss' : 'ws';
const socket = io(`${socketProtocol}://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

export const connect = onGameOver => (
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      document.getElementById('disconnect-modal').classList.remove('hidden');
      document.getElementById('reconnect-button').onclick = () => {
        window.location.reload();
      };
    });
  })
);

export const play = (username, classType) => {
  socket.emit(Constants.MSG_TYPES.JOIN_GAME, username, classType);
};

export const updateDirection = throttle(20, (dir) => {
  socket.emit(Constants.MSG_TYPES.MOUSE_INPUT, dir);
});

export const updateKeys = throttle(20, (pressed, released) => {
  socket.emit(Constants.MSG_TYPES.KEYBOARD_INPUT, pressed, released);
});
export const updateMouse = throttle(20, (pressed) => {
  socket.emit(Constants.MSG_TYPES.MOUSE_CLICK, pressed);
});