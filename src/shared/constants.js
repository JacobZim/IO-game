module.exports = Object.freeze({
  PLAYER_RADIUS: 20,
  PLAYER_MAX_HP: 100,
  PLAYER_SPEED: 400,
  PLAYER_FIRE_COOLDOWN: 0.25,

  BULLET_RADIUS: 3,
  BULLET_SPEED: 800,
  BULLET_DAMAGE: 10,
  DAMAGE_TYPES: {
    BULLET: 10,
    COLLISION_PLAYER: 1,
  },

  SCORE_BULLET_HIT: 20,
  SCORE_PER_SECOND: 1,

  MAP_SIZE: 3000,
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    GAME_UPDATE: 'update',
    MOUSE_INPUT: 'mouse-input',
    MOUSE_CLICK: 'mouse-click',
    KEYBOARD_INPUT: 'keyboard-input',
    GAME_OVER: 'dead',
  },
  CLASS_TYPES: {
    PLAYER: 0,
    MAGE: 1,
    WARRIOR: 5,
    BRUTE: 9,
    ROGUE: 13,
  }
});
