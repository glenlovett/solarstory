define([
  "Phaser"
], function(Phaser) {
  "use strict";
  return function(game) {
    this.preload = function() {
      game.add.sprite(0, 0, "bg-preloader");

      //load title
      game.load.image("title", "assets/img/title/title.png");
      game.load.spritesheet("title-buttons",
        "assets/img/title/title-buttons.png",
        136, 29);

      //load player
      game.load.spritesheet("player",
        "assets/img/characters/player-thief.png",
        32, 48);
      game.load.image("player-shadow", "assets/img/title/title.png");

      //load ememies
      game.load.image("enemy-ghost",
        "assets/img/monsters/ghost.png");

      //load test map
      game.load.tilemap("test-map", "assets/maps/grassland.json", null,
        Phaser.Tilemap
        .TILED_JSON);
      game.load.image("grassland", "assets/img/tiles/grassland.png");

      //show loading bar
      game.add.sprite(game.world.width / 2 - 100, game.world.height / 2,
        "loadingbar-background");
      var loadBar = game.add.sprite(game.world.width / 2 - 100, game.world.height /
        2, "loadingbar-foreground");
      game.load.setPreloadSprite(loadBar);
    };
    this.create = function() {
      game.state.start("title");
    };
  };
});