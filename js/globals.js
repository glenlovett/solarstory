define(function () {
  "use strict";
  return {
    TILE_SIZE: 32,
    PLAYER_SPEED: 150,
    PLAYER_MOVES: 5,
    DIR_MAP:{
      left: {string: "left",number: 1,xy: "x",playerVelocity: -1*150},
      right: {string: "right",number: 2,xy: "x",playerVelocity: 1*150},
      up: {string: "up",number: 4,xy: "y",playerVelocity: -1*150},
      down: {string: "down",number: 3,xy: "y",playerVelocity: 1*150}
    }
  };
});