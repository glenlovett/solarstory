define([
  "globals",
  "helpers",
  "Enemy",
  "Player"
], function (globals, helpers, Enemy, Player) {
  "use strict";
  return function(game) {
    this.easystar = new EasyStar.js();
    this.moveLayer = undefined;
    this.sceneryLayer = undefined;
    this.highSceneryLayer = undefined;
    this.moveGrid = undefined;

    var self = this;
    var player;
    var enemies = [];

    this.create = function() {
      initMap();
      initPlayer();
      initEnemies();
      this.easystar.setGrid(this.moveGrid);
    };

    this.update = function() {};

    function initMap() {
      var map = game.add.tilemap("test-map");
      self.moveLayer = map.createLayer("move");
      self.sceneryLayer = map.createLayer("scenery");
      self.highSceneryLayer = map.createLayer("high-scenery");
      self.moveLayer.inputEnabled = true;
      map.addTilesetImage("grassland");
      self.moveGrid = helpers.generateGridAndIndices(self.moveLayer);
      self.easystar.setGrid(self.moveGrid);
      self.easystar.setAcceptableTiles([1]);
      self.moveLayer.events.onInputUp.add(handleMapClick);
    }

    function initPlayer() {
      player = new Player(4, 2, {speed:5}, self, "player", game);
    }

    function initEnemies() {
      var enemy = new Enemy(5, 3, {speed:2}, self, "enemy-ghost", game);
      var enemy2 = new Enemy(3, 6, {speed:2}, self, "enemy-ghost", game);
      enemies.push(enemy);
      enemies.push(enemy2);
    }

    //TODO: block player movement while enemies move
    function moveEnemies(){
      enemies.forEach(function(enemy){
        enemy.moveTowards(player.x, player.y);
      });
    }

    function handleMapClick() {
      var mapClickValid = (
        player.moveGridGraphics !== undefined &&
        player.moveGridGraphics.visible &&
        player.moving === false);
      if (mapClickValid) {
        var tileX = Math.floor(helpers.toTile(game.input.x));
        var tileY = Math.floor(helpers.toTile(game.input.y));
        if (player.potentialMove !== undefined) {
          if (tileX === player.potentialMove.x && tileY === player.potentialMove.y) {
            //legal move selected. move along path and return true
            player.animateMoveOnPath(player.potentialMove.path, moveEnemies, self);
            player.moveGridGraphics.destroy();
            player.potentialMove.graphics.destroy();
            player.moveGridGraphics = player.potentialMove = undefined;
            return;
          }
        }
        // determine if we have a legal move to present
        self.easystar.findPath(player.x, player.y, tileX, tileY,
          function(path) {
            if (path !== null && path.length <= player.stats.speed + 1 && path.length > 0) {
              player.presentLegalMove(path);
            }
          });
        self.easystar.calculate();
      }
    }
  };
});