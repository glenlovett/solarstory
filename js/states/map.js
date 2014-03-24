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
      self.moveLayer.events.onInputUp.add(handleClick);
    }

    function initPlayer() {
      var x = 4;
      var y = 2;
      player = new Player(x, y, self, "player", game);
      self.moveGrid[y][x] = 0;
    }

    function initEnemies() {
      var x = 5;
      var y = 3;
      self.moveGrid[y][x] = 0;
      var enemy = new Enemy(x, y, self, "enemy-ghost", game);
      enemies.push(enemy);
    }

    function moveEnemies(){
      // enemies[0].animateMoveOnPath(
      // [
      //   {x:5, y:3},
      //   {x:6, y:3},
      //   {x:6, y:4}
      // ]);
    }

    function handleClick() {
      var mapClickValid = (
        globals.moveGridGraphics !== undefined &&
        globals.moveGridGraphics.visible &&
        globals.moving === false);
      if (mapClickValid) {
        var tileX = Math.floor(helpers.toTile(game.input.x));
        var tileY = Math.floor(helpers.toTile(game.input.y));
        if (player.potentialMove !== undefined) {
          if (tileX ===  player.potentialMove.x && tileY ===  player.potentialMove.y) {
            //legal move selected. move along path and return true
            player.animateMoveOnPath( player.potentialMove.path, moveEnemies, self);
            player.potentialMove.graphics.destroy();
            player.potentialMove = undefined;
            return true;
          }
        }
        // otherwise determine if we have a legal move to present
        self.easystar.findPath(player.x, player.y, tileX, tileY,
          function(path) {
            if (path !== null && path.length <= globals.PLAYER_MOVES + 1 && !
              player.isAtPos(tileX, tileY) && !self.hasEnemyAt(tileX, tileY)) {
              player.presentLegalMove(path);
            }
          });
        self.easystar.calculate();
      }
    }
  };
});