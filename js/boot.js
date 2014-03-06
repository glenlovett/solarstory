var Game = {};

Game.TILE_SIZE = 32;
Game.PLAYER_SPEED = 150;
Game.PLAYER_MOVES = 5;
Game.PLAYER_OFFSET = 22;
Game.DIR_MAP = {
	left: {string: "left",number: 1,xy: "x",playerVelocity: -1*Game.PLAYER_SPEED},
	right: {string: "right",number: 2,xy: "x",playerVelocity: 1*Game.PLAYER_SPEED},
	up: {string: "up",number: 4,xy: "y",playerVelocity: -1*Game.PLAYER_SPEED},
	down: {string: "down",number: 3,xy: "y",playerVelocity: 1*Game.PLAYER_SPEED}
};

Game.Boot = function(game) {
  "use strict";
  this.preload = function() {
    game.load.image("bg-preloader", "assets/img/loading-bg.png");
    game.load.image("loadingbar-background",
      "assets/img/loadingbar-background.png");
    game.load.image("loadingbar-foreground",
      "assets/img/loadingbar-foreground.png");
  };
  this.create = function() {
    game.state.start("preloader");
  };
};