define([
  "globals",
  "helpers",
  "Enemy",
  "Player",
  "underscore"
], function (globals, helpers, Enemy, Player, _) {
  "use strict";
  return function(game) {
    var self = this;
    var easystar = new EasyStar.js();
    var map;
    var moveLayer;
    this.sceneryLayer = undefined;
    this.highSceneryLayer = undefined;
    var player;
    var enemies = [];
    var moveGrid;
    var potentialMove;

    this.create = function() {
      initMap();
      initPlayer();
      initEnemies();
      easystar.setGrid(moveGrid);
    };
    this.update = function() {};

    function initMap() {
      map = game.add.tilemap("test-map");
      moveLayer = map.createLayer("move");
      self.sceneryLayer = map.createLayer("scenery");
      self.highSceneryLayer = map.createLayer("high-scenery");
      moveLayer.inputEnabled = true;
      map.addTilesetImage("grassland");
      moveGrid = helpers.generateGridAndIndices(moveLayer);
      easystar.setGrid(moveGrid);
      easystar.setAcceptableTiles([1]);
      moveLayer.events.onInputUp.add(handleMapClick);
    }

    function initPlayer() {
      var x = 4;
      var y = 2;
      player = new Player(x, y, self, "player", game);
      moveGrid[y][x] = 0;
    }

    function initEnemies() {
      var x = 5;
      var y = 3;
      moveGrid[y][x] = 0;
      var enemy = new Enemy(x, y, self, "enemy-ghost", game);
      enemies.push(enemy);
    }

    //TODO: move to player
    this.createMoveGrid = function() {
      var g = game.add.graphics(0, 0);
      //TODO: look at tiles within player speed, not whole map
      moveLayer.getTiles(0, 0, moveLayer.width, moveLayer.height).forEach(function(tile) {
        var tileX = helpers.toTile(tile.x);
        var tileY = helpers.toTile(tile.y);
        if (!player.isAtPos(tileX, tileY) && !occupiedByEnemy(tileX, tileY)) {
          drawGoToShade(tileX, tileY, g);
        }
      });
      easystar.calculate();
      return g;
    };

    //TODO: move to helpers
    function drawGoToShade(x, y, graphics) {
      easystar.findPath(player.x, player.y, x, y, function(path) {
        if (path !== null && path.length <= globals.PLAYER_MOVES + 1) {
          graphics.lineStyle(2, 0x66A3C2, 0.4);
          graphics.beginFill(0x66A3C2, 0.3);
          graphics.drawRect(
            helpers.toPixels(x),
            helpers.toPixels(y),
            globals.TILE_SIZE,
            globals.TILE_SIZE);
          graphics.endFill();
        }
      });
    }

    function moveEnemies(){
      enemies[0].animateMoveOnPath(
      [
        {x:5, y:3},
        {x:6, y:3},
        {x:6, y:4}
      ]);
    }

    function handleMapClick() {
      var mapClickValid = (
        globals.moveGridGraphics !== undefined &&
        globals.moveGridGraphics.visible &&
        globals.moving === false);
      if (mapClickValid) {
        var tileX = Math.floor(helpers.toTile(game.input.x));
        var tileY = Math.floor(helpers.toTile(game.input.y));
        if (potentialMove !== undefined) {
          if (tileX === potentialMove.x && tileY === potentialMove.y) {
            //legal move selected. move along path and return true
            player.animateMoveOnPath(potentialMove.path, moveEnemies, self);
            potentialMove.graphics.destroy();
            potentialMove = undefined;
            return true;
          }
        }
        // otherwise determine if we have a legal move to present
        easystar.findPath(player.x, player.y, tileX, tileY,
          function(path) {
            if (path !== null && path.length <= globals.PLAYER_MOVES + 1 && !
              player.isAtPos(tileX, tileY) && !occupiedByEnemy(tileX, tileY)) {
              presentLegalMove(path);
            }
          });
        easystar.calculate();
      }
    }
    //TODO: move to player. make potentialMove a member of player.
    //show a move to the user for confirmation
    function presentLegalMove(path) {
      var destX = path[path.length - 1].x;
      var destY = path[path.length - 1].y;
      var g = game.add.graphics(0, 0);
      if (potentialMove !== undefined) {
        potentialMove.graphics.destroy();
      }
      g.lineStyle(2, 0xE68A00, 0.5);
      g.beginFill(0xE68A00, 1);
      g.drawCircle(
        helpers.toPixels(destX) + globals.TILE_SIZE / 2,
        helpers.toPixels(destY) + globals.TILE_SIZE / 2,
        globals.TILE_SIZE / 8);
      g.endFill();
      drawPath(g, path);
      potentialMove = {
        x: destX,
        y: destY,
        graphics: g,
        path: path
      };
    }

    //TODO: move to helpers
    function drawPath(g, path) {
      g.lineStyle(2, 0xE68A00, 0.9);
      g.x = helpers.toPixels(path[0].x) + globals.TILE_SIZE / 2;
      g.y = helpers.toPixels(path[0].y) + globals.TILE_SIZE / 2;
      path.forEach(function(point) {
        g.lineTo(
          helpers.toPixels(point.x) + globals.TILE_SIZE / 2,
          helpers.toPixels(point.y) + globals.TILE_SIZE / 2);
      });
      g.x = 0;
      g.y = 0;
    }

    function occupiedByEnemy(x, y) {
      return _.some(enemies, function(enemy){return enemy.isAtPos(x, y);});
    }
  };
});