define(function () {
  return function(game) {
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
});