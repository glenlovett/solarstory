require.config({
  paths: {
    "EasyStar": "lib/easystar.min",
    "underscore": "lib/underscore.min",
    "Phaser": "lib/phaser",
    "boot": "states/boot",
    "preloader": "states/preloader",
    "title": "states/title",
    "map": "states/map",
  }
});
require([
  "boot",
  "preloader",
  "title",
  "map",
  "Phaser",
  "globals",
  "EasyStar"
], function(boot, preloader, title, map, Phaser, globals) {
  "use strict";
  var game = new Phaser.Game(320, 320, Phaser.AUTO, "gameDiv");
  game.state.add("boot", boot, true);
  game.state.add("preloader", preloader);
  game.state.add("title", title);
  game.state.add("map", map);
  
  window.app = {
    globals: globals
  };
});