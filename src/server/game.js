const Constants = require('../shared/constants');
const Player = require('./player');
const Collisions = require('./collisions');
const ObjectClass  = require('./object')

class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.projectiles = [];
    this.teams = [0,0]; // number of players on team 0, 1
    this.kills = [0,0]; // Team death match score tracking
    this.structures = [];
    //this.addRectangle(100, 100, 100, 100, 0);
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    setInterval(this.update.bind(this), 1000 / 60);
  }

  addPlayer(socket, username, classType) {
    this.sockets[socket.id] = socket;
    let team = -1;
    if (this.teams[0] <= this.teams[1]) {team = 0; this.teams[0]++}
    else {team = 1; this.teams[1]++}
    // Generate a position to start this player at.
    let a;
    if (team == 0) a = 0.05;
    else if (team = 1) a = 0.75;
    //const x = Constants.MAP_SIZE * (a + Math.random() * 0.2);
    //const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    const x = Constants.MAP_SIZE * (.4 + Math.random() * 0.2);
    const y = Constants.MAP_SIZE * (0.25 + Math.random() * 0.5);
    if(classType == Constants.CLASS_TYPES.MAGE)
      this.players[socket.id] = new Player.Mage(socket.id, username, x, y, team);
    else if(classType == Constants.CLASS_TYPES.ROGUE)
      this.players[socket.id] = new Player.Rogue(socket.id, username, x, y, team);
    else if(classType == Constants.CLASS_TYPES.WARRIOR)
      this.players[socket.id] = new Player.Warrior(socket.id, username, x, y, team);
    else if(classType == Constants.CLASS_TYPES.BRUTE)
      this.players[socket.id] = new Player.Brute(socket.id, username, x, y, team);
    else 
      this.players[socket.id] = new Player.Player(socket.id, username, x, y, team);
  }

  addRectangle(x, y, width, height, dir) {
    let id = this.structures.length;
    this.structures.push(new ObjectClass.Rectangle(id, x, y, width, height, dir, 0));
  }

  removePlayer(socket) {
    if (this.players[socket.id]) {
      let team = this.players[socket.id].team;
      this.teams[team] -= 1;
      if (team == 0) this.kills[1] += 1;
      else this.kills[0] += 1;
      if (this.players[socket.id].classType == Constants.CLASS_TYPES.WARRIOR) {
        for (let i = 0; i < Constants.QUANTITIES.WARRIOR_SHIELDS; i++ ) {
          this.players[socket.id].shields[i].hp = 0;
          delete this.players[socket.id].shields[i];// this line doesn't seem to have any effect
        }
      }
    }
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  handleInputMouse(socket, dir, mousex, mousey) {
    if (this.players[socket.id]) {
      this.players[socket.id].setDirection(dir);
      this.players[socket.id].updateMouse(mousex, mousey);
    }
  }
  handleInputKeys(socket, keysDown, keysUp) {
    let player = this.players[socket.id];
    if (player) {
      if (keysDown.includes('w')) {
        player.moveU = true;
      }
      if (keysDown.includes('a')) {
        player.moveL = true;
      }
      if (keysDown.includes('s')) {
        player.moveD = true;
      }
      if (keysDown.includes('d')) {
        player.moveR = true;
      }
      if (keysDown.includes('q')) {
        player.qFiring = true;
      }
      if (keysDown.includes('e')) {
        player.eFiring = true;
      }
      if (keysDown.includes('space')) {
        player.spaceFiring = true;
      }

      if (keysUp.includes('w')) {
        player.moveU = false;
      }
      if (keysUp.includes('a')) {
        player.moveL = false;
      }
      if (keysUp.includes('s')) {
        player.moveD = false;
      }
      if (keysUp.includes('d')) {
        player.moveR = false;
      }
      if (keysUp.includes('q')) {
        player.qFiring = false;
      }
      if (keysUp.includes('e')) {
        player.eFiring = false;
      }
      if (keysUp.includes('space')) {
        player.spaceFiring = false;
      }
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

    // Update each projectile
    const projectilesToRemove = [];
    this.projectiles.forEach(projectile => {
      if (projectile.update(dt)) {
        // Destroy this projectile
        projectilesToRemove.push(projectile);
      }
    });
    this.projectiles = this.projectiles.filter(projectile => !projectilesToRemove.includes(projectile));
    // Update each structure
    const structuresToRemove = [];
    this.structures.forEach(structure => {
      if (structure.update(dt)) {
        // Destroy this structure
        structuresToRemove.push(structure);
      }
    });
    this.structures = this.structures.filter(structure => !structuresToRemove.includes(structure));
    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      const [newProjectiles, newStructures] = player.update(dt);
      if (newProjectiles) {
        newProjectiles.forEach(proj => {
          if (proj) this.projectiles.push(proj);
        })
      }
      if (newStructures) {
        newStructures.forEach(struct => {
          if (struct) this.structures.push(struct);
        })
      }
    });
    

    // Apply collisions, give players score for hitting projectiles
    const destroyedProjectiles = Collisions.applyProjectileCollisions(Object.values(this.players), this.projectiles, dt);
    destroyedProjectiles.forEach(b => {
      if (this.players[b.parentID]) {
        this.players[b.parentID].onDealtDamage();
      }
    });
    this.projectiles = this.projectiles.filter(projectile => !destroyedProjectiles.includes(projectile));
    Collisions.applyPhysicalCollisions(Object.values(this.players), Object.values(this.players), dt);
    Collisions.applyPhysicalCollisions(Object.values(this.players), this.structures, dt);
    Collisions.applyPhysicalCollisions(this.structures, this.structures, dt);
    const destroyedProjectiles2 = Collisions.applyProjectileCollisions(this.structures, this.projectiles, dt);
    this.projectiles = this.projectiles.filter(projectile => !destroyedProjectiles2.includes(projectile));
    // Check if structures are dead
    
    this.structures.forEach(structure => {
      if (structure.hp <= 0) {
        // Destroy this structure
        structuresToRemove.push(structure);
      }
    });
    this.structures = this.structures.filter(structure => !structuresToRemove.includes(structure));

    // Check if any players are dead
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      if (player.hp <= 0) {
        socket.emit(Constants.MSG_TYPES.GAME_OVER);
        this.removePlayer(socket);
      }
    });
    //this.checkGameOver();
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

  // checkGameOver() {
  //   let win = 5;
  //   if (this.kills[0] >= win) {
  //     this = new Game();
  //   } else if (this.kills[1] >= win) {
  //     this = new Game();
  //   }
  // }

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
    const nearbyProjectiles = this.projectiles.filter(
      b => b.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );
    const nearbyStructures = this.structures.filter(
      b => b.distanceTo(player) <= Constants.MAP_SIZE / 2,
    );

    return {
      t: Date.now(),
      me: player.serializeForUpdate(),
      others: nearbyPlayers.map(p => p.serializeForUpdate()),
      projectiles: nearbyProjectiles.map(b => b.serializeForUpdate()),
      structures: nearbyStructures.map(b => b.serializeForUpdate()),
      leaderboard,
      kills: this.kills,
    };
  }
}

module.exports = Game;
