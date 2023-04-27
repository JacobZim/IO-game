/*
const gTypes = Object.freeze({
  //CLASSES
  PLAYER: Symbol("PLAYER"),
  MAGE: Symbol("MAGE"),
  ROGUE: Symbol("ROGUE"),
  WARRIOR: Symbol("WARRIOR"),
  BRUTE: Symbol("BRUTE"),
  //PROJECTILES/ABILITIES
  BULLET: Symbol("BULLET"),
  //--MAGE
  ENERGY_BALL: Symbol("ENERGY_BALL"),
  HEALING_RING: Symbol("HEALING_RING"),
  MAGIC_WALL: Symbol("MAGIC_WALL"),
  //--ROGUE
  KNIFE_THROW: Symbol("KNIFE_THROW"),
  KNIFE_FAN: Symbol("KNIFE_FAN"),
  DASH: Symbol("DASH"),
  //--WARRIOR
  SWORD_SWIPE: Symbol("SWORD_SWIPE"),
  SHIELD_BASH: Symbol("SHIELD_BASH"),
  SHIELD: Symbol("SHIELD"),
  //--BRUTE
  FIST_SMASH: Symbol("FIST_SMASH"),
  GROUND_POUND: Symbol("GROUND_POUND"),
  RAGE: Symbol("RAGE"),
})*/
// npm init, same set up with railway
// needs equivalent of requirements.txt, which npm init should generate


module.exports = Object.freeze({
  TEAM_COLOR: {
    0: "blue",
    1: "red",
  },
  CLASS_TYPES: {
    PLAYER: 0,
    MAGE: 1,
    ROGUE: 5,
    WARRIOR: 9,
    BRUTE: 13,
    //Mage
    ENERGY_BALL: 17,
    HEALING_RING: 18,
    MAGIC_WALL: 19,
    //Rogue
    KNIFE_THROW: 20,
    INVISIBILITY: 21,
    DASH: 22,
    //Warrior
    SWORD_SWIPE: 23,
    SHIELD_BASH: 24,
    SHIELD: 25,
    //Brute
    FIST_SMASH: 26,
    GROUND_POUND: 27,
    RAGE: 28,
    BULLET: 29,
    STRUCTURE: 30,
  },
  MAX_HEALTH_TYPES: {
    PLAYER: 100,
    MAGE: 100,
    ROGUE: 100,
    WARRIOR: 150,
    BRUTE: 200,
    STRUCTURE: 100,
    MAGIC_WALL: 100,
    SHIELD: 200,
  },
  REGEN_TYPES: {
    PLAYER: 10,
    MAGE: 10,
    ROGUE: 10,
    WARRIOR: 10,
    BRUTE: 10,
    STRUCTURE: 0,
    MAGIC_WALL: 0,
    SHIELD: 5,
  },
  REGEN_TIME: 5,
  COOLDOWN_TYPES: {
    PLAYER: 3.0,
    BULLET : 0.25,
    //Mage
    ENERGY_BALL: 0.2,
    HEALING_RING: 10.0,
    MAGIC_WALL: 6.0,
    //Rogue
    KNIFE_THROW: 0.25,
    INVISIBILITY: 10.0,
    DASH: 3.0,
    //Warrior
    SWORD_SWIPE: 0.5,
    SHIELD_BASH: 8.0,
    SHIELD: 1.0,
    //Brute
    FIST_SMASH: .6,
    GROUND_POUND: 8.0,
    RAGE: 8.0,
  },

  RADIUS_TYPES: {
    PLAYER: 20,
    BULLET: 10,
    //Mage
    MAGE: 20,
    ENERGY_BALL: 4,
    HEALING_RING: 75,
    MAGIC_WALL: 20,
    //Rogue
    ROGUE: 20,
    KNIFE_THROW: 5,
    INVISIBILITY: 20,
    DASH: 4,
    //Warrior
    WARRIOR: 25,
    SWORD_SWIPE: 5,
    SHIELD_BASH: 10,
    SHIELD: 20,
    //Brute
    BRUTE: 30,
    FIST_SMASH: 10,
    GROUND_POUND: 50,
    RAGE: 25,
    //Structures
    STRUCTURE: 25,
  },
  DAMAGE_TYPES: {
    PLAYER: 1,
    BULLET: 10,
    //Mage
    MAGE: 0,
    ENERGY_BALL: 7,
    HEALING_RING: -15,
    MAGIC_WALL: 10,
    //Rogue
    ROGUE: 5,
    KNIFE_THROW: 10,
    INVISIBILITY: 50,
    DASH: 0,
    //Warrior
    WARRIOR: 0,
    SWORD_SWIPE: 22,
    SHIELD_BASH: 30,
    SHIELD: 10,
    //Brute
    BRUTE: 0,
    FIST_SMASH: 30,
    GROUND_POUND: 24,
    RAGE: 200,
    //Structures
    STRUCTURE: 25,
  },
  SPEED_TYPES: {
    PLAYER: 400,
    MAGE: 300,
    ROGUE: 300,
    WARRIOR: 300,
    BRUTE: 300,
    BULLET: 800,
    //Mage
    ENERGY_BALL: 600,
    HEALING_RING: 0,
    MAGIC_WALL: 400,
    //Rogue
    KNIFE_THROW: 800,
    INVISIBILITY: 500,
    DASH: 1200,
    //Warrior
    SWORD_SWIPE: 400,
    SHIELD_BASH: 800,
    SHIELD: 0,
    //Brute
    FIST_SMASH: 400,
    GROUND_POUND: 400,
    RAGE: 500,
    //Structures
    STRUCTURE: 400,
  },
  PROJ_LIFESPAN: {
    PLAYER: null,
    BULLET: 0.5,
    //Mage
    ENERGY_BALL: 1.0,
    HEALING_RING: 5.0,
    MAGIC_WALL: 5.0,
    //Rogue
    KNIFE_THROW: 0.8,
    INVISIBILITY: 0.8,
    DASH: 0.3,
    //Warrior
    SWORD_SWIPE: 0.5,
    SHIELD_BASH: 4.0,
    SHIELD: 100.0,
    //Brute
    FIST_SMASH: 0.4,
    GROUND_POUND: 8.0,
    RAGE: 8.0,
    //Structures 
    STRUCTURE: 8.0,
  },
  MASS_TYPES: {
    PLAYER: 1.0,
    MAGE: 1.0,
    ROGUE: 1.0,
    WARRIOR: 1.5,
    BRUTE: 2.0,
    STRUCTURE: 4.0,
    MAGIC_WALL: 5.0,
    SHIELD: 2.0,
  },
  AoE_TYPES: {
    HEAL: 'heal',
    DAMAGE: 'damage',
  },
  INVISIBILITY: {
    FULL: 1.0,
    HALF: 0.5,
    NONE: 0.0,
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
});

/*
gConstants.CLASS_TYPES[gTypes.PLAYER] = 0;
gConstants.CLASS_TYPES[gTypes.MAGE] = 1;
gConstants.CLASS_TYPES[gTypes.ROGUE] = 5;
gConstants.CLASS_TYPES[gTypes.WARRIOR] = 9;
gConstants.CLASS_TYPES[gTypes.BRUTE] = 13;

gConstants.MAX_HEALTH_TYPES[gTypes.PLAYER] = 100;
gConstants.MAX_HEALTH_TYPES[gTypes.MAGE] = 100;
gConstants.MAX_HEALTH_TYPES[gTypes.ROGUE] = 100;
gConstants.MAX_HEALTH_TYPES[gTypes.WARRIOR] = 150;
gConstants.MAX_HEALTH_TYPES[gTypes.BRUTE] = 200;

gConstants.COOLDOWN_TYPES[gTypes.PLAYER] = 3.0;
gConstants.COOLDOWN_TYPES[gTypes.BULLET] = 0.25;
gConstants.COOLDOWN_TYPES[gTypes.ENERGY_BALL] = 0.2;
gConstants.COOLDOWN_TYPES[gTypes.HEALING_RING] = 10.0;
gConstants.COOLDOWN_TYPES[gTypes.MAGIC_WALL] = 6.0;
gConstants.COOLDOWN_TYPES[gTypes.KNIFE_THROW] = 0.25;
gConstants.COOLDOWN_TYPES[gTypes.KNIFE_FAN] = 8.0;
gConstants.COOLDOWN_TYPES[gTypes.DASH] = 3.0;
gConstants.COOLDOWN_TYPES[gTypes.SWORD_SWIPE] = 0.5;
gConstants.COOLDOWN_TYPES[gTypes.SHIELD_BASH] = 8.0;
gConstants.COOLDOWN_TYPES[gTypes.SHIELD] = 4.0;
gConstants.COOLDOWN_TYPES[gTypes.FIST_SMASH] = 0.8;
gConstants.COOLDOWN_TYPES[gTypes.GROUND_POUND] = 8.0;
gConstants.COOLDOWN_TYPES[gTypes.RAGE] = 8.0;

gConstants.RADIUS_TYPES[gTypes.PLAYER] = 20;
gConstants.RADIUS_TYPES[gTypes.BULLET] = 3;
gConstants.RADIUS_TYPES[gTypes.ENERGY_BALL] = 3;
gConstants.RADIUS_TYPES[gTypes.HEALING_RING] = 50;
gConstants.RADIUS_TYPES[gTypes.MAGIC_WALL] = 20;
gConstants.RADIUS_TYPES[gTypes.KNIFE_THROW] = 4;
gConstants.RADIUS_TYPES[gTypes.KNIFE_FAN] = 4;
gConstants.RADIUS_TYPES[gTypes.DASH] = 4;
gConstants.RADIUS_TYPES[gTypes.SWORD_SWIPE] = 10;
gConstants.RADIUS_TYPES[gTypes.SHIELD_BASH] = 22;
gConstants.RADIUS_TYPES[gTypes.SHIELD] = 22;
gConstants.RADIUS_TYPES[gTypes.FIST_SMASH] = 20;
gConstants.RADIUS_TYPES[gTypes.GROUND_POUND] = 50;
gConstants.RADIUS_TYPES[gTypes.RAGE] = 25;

gConstants.DAMAGE_TYPES[gTypes.PLAYER] = 0;
gConstants.DAMAGE_TYPES[gTypes.BULLET] = 10;
gConstants.DAMAGE_TYPES[gTypes.ENERGY_BALL] = 9;
gConstants.DAMAGE_TYPES[gTypes.HEALING_RING] = 5;
gConstants.DAMAGE_TYPES[gTypes.MAGIC_WALL] = 0;
gConstants.DAMAGE_TYPES[gTypes.KNIFE_THROW] = 11;
gConstants.DAMAGE_TYPES[gTypes.KNIFE_FAN] = 11;
gConstants.DAMAGE_TYPES[gTypes.DASH] = 0;
gConstants.DAMAGE_TYPES[gTypes.SWORD_SWIPE] = 22;
gConstants.DAMAGE_TYPES[gTypes.SHIELD_BASH] = 30;
gConstants.DAMAGE_TYPES[gTypes.SHIELD] = 0;
gConstants.DAMAGE_TYPES[gTypes.FIST_SMASH] = 30;
gConstants.DAMAGE_TYPES[gTypes.GROUND_POUND] = 25;
gConstants.DAMAGE_TYPES[gTypes.RAGE] = 0;

gConstants.SPEED_TYPES[gTypes.PLAYER] = 400;
gConstants.SPEED_TYPES[gTypes.BULLET] = 800;
gConstants.SPEED_TYPES[gTypes.ENERGY_BALL] = 600;
gConstants.SPEED_TYPES[gTypes.HEALING_RING] = 0;
gConstants.SPEED_TYPES[gTypes.MAGIC_WALL] = 600;
gConstants.SPEED_TYPES[gTypes.KNIFE_THROW] = 800;
gConstants.SPEED_TYPES[gTypes.KNIFE_FAN] = 800;
gConstants.SPEED_TYPES[gTypes.DASH] = 1200;
gConstants.SPEED_TYPES[gTypes.SWORD_SWIPE] = 400;
gConstants.SPEED_TYPES[gTypes.SHIELD_BASH] = 800;
gConstants.SPEED_TYPES[gTypes.SHIELD] = 0;
gConstants.SPEED_TYPES[gTypes.FIST_SMASH] = 400;
gConstants.SPEED_TYPES[gTypes.GROUND_POUND] = 0;
gConstants.SPEED_TYPES[gTypes.RAGE] = 0;

gConstants.PROJ_LIFESPAN[gTypes.PLAYER] = null;
gConstants.PROJ_LIFESPAN[gTypes.BULLET] = 0.5;
gConstants.PROJ_LIFESPAN[gTypes.ENERGY_BALL] = 1.0;
gConstants.PROJ_LIFESPAN[gTypes.HEALING_RING] = 5.0;
gConstants.PROJ_LIFESPAN[gTypes.MAGIC_WALL] = 3.0;
gConstants.PROJ_LIFESPAN[gTypes.KNIFE_THROW] = 0.8;
gConstants.PROJ_LIFESPAN[gTypes.KNIFE_FAN] = 0.8;
gConstants.PROJ_LIFESPAN[gTypes.DASH] = 0.3;
gConstants.PROJ_LIFESPAN[gTypes.SWORD_SWIPE] = 0.4;
gConstants.PROJ_LIFESPAN[gTypes.SHIELD_BASH] = 0.3;
gConstants.PROJ_LIFESPAN[gTypes.SHIELD] = 8.0;
gConstants.PROJ_LIFESPAN[gTypes.FIST_SMASH] = 0.5;
gConstants.PROJ_LIFESPAN[gTypes.GROUND_POUND] = 0.5;
gConstants.PROJ_LIFESPAN[gTypes.RAGE] = 8.0;
*/

//module.exports = Object.freeze(gConstants);