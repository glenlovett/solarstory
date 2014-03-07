define(function() {
  "use strict";
  return function(game) {
    this.preload = function() {
      game.add.sprite(0, 0, "bg-preloader");
    };
    this.create = function() {
      game.add.sprite(game.world.centerX - 138, 20, "title");
      game.add.button(game.world.centerX - 68, 160, "title-buttons",
        startGame,
        this, 1, 0, 1);
      //TODO: implement saving and loading
      //game.add.button(game.world.centerX - 68, 200, "title-buttons", null, this, 3, 2, 3);
    };

    function startGame() {
      game.state.start("test");
    }
  };
});