const Constants = require('../shared/constants');
const Player = require('./player');
const Collisions = require('./collisions');

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.bullets = [];
    this.structures = [];
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 60);
  }

  addPlayer(socket, username, classType) {
    this.sockets[socket.id] = socket;
    // Generate a position to start this player at.
    const x = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    if(classType == Constants.CLASS_TYPES.MAGE)
      this.players[socket.id] = new Player.Player(socket.id, username, x, y);
    else if(classType == Constants.CLASS_TYPES.WARRIOR)
      this.players[socket.id] = new Player.Player(socket.id, username, x, y);
    else if(classType == Constants.CLASS_TYPES.BRUTE)
      this.players[socket.id] = new Player.Player(socket.id, username, x, y);
    else if(classType == Constants.CLASS_TYPES.ROGUE)
      this.players[socket.id] = new Player.Rogue(socket.id, username, x, y);
    else 
      this.players[socket.id] = new Player.Player(socket.id, username, x, y);
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  handleInputMouse(socket, dir) {
    if (this.players[socket.id]) {
      this.players[socket.id].setDirection(dir);
    }
  }
  handleInputKeys(socket, keysDown, keysUp) {
    let player = this.players[socket.id];
    if (player) {
      if (keysDown.includes('w')) player.moveU = true;
      if (keysDown.includes('a')) player.moveL = true;
      if (keysDown.includes('s')) player.moveD = true;
      if (keysDown.includes('d')) player.moveR = true;
      if (keysDown.includes('q')) pass;
      if (keysDown.includes('e')) pass;

      if (keysUp.includes('w')) player.moveU = false;
      if (keysUp.includes('a')) player.moveL = false;
      if (keysUp.includes('s')) player.moveD = false;
      if (keysUp.includes('d')) player.moveR = false;
      if (keysUp.includes('q')) pass;
      if (keysUp.includes('e')) pass;
    }
  }
  handleInputMouseClick(socket, pressed) {
    let player = this.players[socket.id];
    if (player) {
      player.primary_firing = pressed;
    }
  }
  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    // Update each bullet
    const bulletsToRemove = [];
    this.bullets.forEach(bullet => {
      if (bullet.update(dt)) {
        // Destroy this bullet
        bulletsToRemove.push(bullet);
      }
    });
    this.bullets = this.bullets.filter(bullet => !bulletsToRemove.includes(bullet));

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      const newBullet = player.update(dt);
      if (newBullet) {
        this.bullets.push(newBullet);
      }
    });

    // Apply collisions, give players score for hitting bullets
    const destroyedBullets = Collisions.applyProjectileCollisions(Object.values(this.players), this.bullets);
    destroyedBullets.forEach(b => {
      if (this.players[b.parentID]) {
        this.players[b.parentID].onDealtDamage();
      }
    });
    this.bullets = this.bullets.filter(bullet => !destroyedBullets.includes(bullet));
    Collisions.applyPlayerCollisions(Object.values(this.players));

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);
      }
    });

    // Send a game update to each player every other time
    if (this.shouldSendUpdate) {
      const leaderboard = this.getLeaderboard();
      Object.keys(this.sockets).forEach(playerID => {
        const socket = this.sockets[playerID];
        const player = this.players[playerID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(player, leaderboard));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }
  }

  getLeaderboard() {
    return Object.values(this.players)
      .sort((p1, p2) => p2.score - p1.score)
      .slice(0, 5)
      .map(p => ({ username: p.username, score: Math.round(p.score) }));
  }

  createUpdate(player, leaderboard) {
    const nearbyPlayers = Object.values(this.players).filter(
      p => p !== player && p.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    const nearbyBullets = this.bullets.filter(
      b => b.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      bullets: nearbyBullets.map(b => b.serializeForUpdate()),
      leaderboard,
    };
  }
}

module.exports = Game;
