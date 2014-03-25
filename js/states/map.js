define([
  "globals",
  "helpers",
  "Enemy",
  "Player",
  "underscore"
], function (globals, helpers, Enemy, Player, _) {
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

    this.hasEnemyAt = function(x, y) {
      return _.some(enemies, function(enemy){return enemy.isAtPos(x, y);});
    };

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
      var x = 4;
      var y = 2;
      self.moveGrid[y][x] = 0;
      self.easystar.setGrid(self.moveGrid);
      player = new Player(x, y, {speed:5}, self, "player", game);
    }

    function initEnemies() {
      var x = 5;
      var y = 3;
      self.moveGrid[y][x] = 0;
      self.easystar.setGrid(self.moveGrid);
      var enemy = new Enemy(x, y, {speed:2}, self, "enemy-ghost", game);
      enemies.push(enemy);
    }

    function moveEnemies(){
      var enemyPath = enemies[0].getPartialPathTo(player.x, player.y);
      // enemies[0].animateMoveOnPath(
      // [
      //   {x:5, y:3},
      //   {x:6, y:3},
      //   {x:6, y:4}
      // ]);
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
            if (player.moveGridGraphics !== undefined) {
              player.moveGridGraphics.destroy();
              player.moveGridGraphics = undefined;
            }
            player.animateMoveOnPath( player.potentialMove.path, moveEnemies, self);
            player.potentialMove.graphics.destroy();
            player.potentialMove = undefined;
          }
        } else {
          // otherwise determine if we have a legal move to present
          self.easystar.findPath(player.x, player.y, tileX, tileY,
            function(path) {
              if (path !== null && path.length <= player.stats.speed + 1 && path.length > 0) {
                player.presentLegalMove(path);
              }
            });
          self.easystar.calculate();
        }
      }
    }
  };
});