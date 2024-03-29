const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../shared/constants');
const Game = require('./game');
const webpackConfig = require('../../webpack.dev.js');


// Setup an Express server
const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.MOUSE_INPUT, handleInputMouse);
  socket.on(Constants.MSG_TYPES.KEYBOARD_INPUT, handleInputKeyboard);
  socket.on(Constants.MSG_TYPES.MOUSE_CLICK, handleInputMouseClick);
  socket.on('disconnect', onDisconnect);
});

// Setup the Game
const game = new Game();

function joinGame(username, classType) {
  game.addPlayer(this, username, classType);
}

function handleInputMouse(dir, mousex, mousey) {
  game.handleInputMouse(this, dir, mousex, mousey);
}

function handleInputKeyboard(keydown, keyup) {
  game.handleInputKeys(this, keydown, keyup);
}

function handleInputMouseClick(pressed) {
  game.handleInputMouseClick(this, pressed);
}

function onDisconnect() {
  game.removePlayer(this);
}
