define([
  "globals",
  "Enemy",
  "Player"
], function (globals, Enemy, Player) {
  "use strict";
  return function(game) {
    var easystar = new EasyStar.js();
    var moving = false;
    var map;
    var moveLayer;
    var sceneryLayer;
    var highSceneryLayer;
    var player;
    var enemies = [];
    var moveGrid;
    var moveGridGraphics;
    var potentialMove;

    this.create = function(mapData) {
      initMap(mapData);
      initPlayer();
      initEnemies();
    };
    this.update = function() {};

    function initMap() {
      map = game.add.tilemap(mapData.tileMapName);
      moveLayer = map.createLayer("move");
      sceneryLayer = map.createLayer("scenery");
      highSceneryLayer = map.createLayer("high-scenery");
      moveLayer.inputEnabled = true;
      map.addTilesetImage("grassland");
      map.setCollision([2, 3], true, "scenery");
      var gridAndIndices = getGridAndIndices(moveLayer);
      easystar.setGrid(gridAndIndices.grid);
      easystar.setAcceptableTiles(gridAndIndices.indices);
      moveLayer.events.onInputUp.add(handleMapClick);
    }

    function initPlayer() {
      //TODO: abstract
      player = new Player(4, 2, "player", game);
      player.sprite.events.onInputUp.add(handlePlayerClick);
    }

    function initEnemies() {
      var x = 5;
      var y = 3;
      easystar.avoidAdditionalPoint(x, y);
      var enemy = new Enemy(x, y, "enemy-ghost", game);
      enemies.push(enemy);
    }

    function getGridAndIndices(layer) {
      var grid = [];
      var indices = [];
      var rowIndex = 0;
      var columnIndex = 0;
      layer.layer.data.forEach(function(row) {
        grid.push([]);
        row.forEach(function(tileOrNull) {
          var i;
          var addedToAcceptable = false;
          if (tileOrNull === null) {
            grid[rowIndex][columnIndex] = 0;
          } else {
            grid[rowIndex][columnIndex] = tileOrNull.index;
            for (i = 0; indices.length > i; i++) {
              if (indices[i] === tileOrNull.index) {
                addedToAcceptable = true;
                break;
              }
            }
            if (!addedToAcceptable) {
              indices.push(tileOrNull.index);
            }
          }
          columnIndex = columnIndex + 1;
        });
        columnIndex = 0;
        rowIndex = rowIndex + 1;
      });
      return {
        grid: grid,
        indices: indices
      };
    }

    function animateMoveOnPath(path) {
      if (path.length > 0) {
        moving = true;
        if (moveGridGraphics !== undefined) {
          moveGridGraphics.destroy();
          moveGridGraphics = undefined;
        }
        animateMoveStep(path[0].x, path[0].y, path);
      } else { // we're done moving..
        player.sprite.body.facing = 0;
        player.sprite.animations.stop();
        moving = false;
        return undefined;
      }
    }

    function animateMoveStep(tileX, tileY, path) {
      var dirObj;
      if (player.sprite.x > toPixels(tileX)) {
        dirObj = globals.DIR_MAP.left;
        player.sprite.x -= 2;
      } else if (player.sprite.x < toPixels(tileX)) {
        dirObj = globals.DIR_MAP.right;
        player.sprite.x += 2;
      } else if (player.sprite.y > toPixels(tileY)) {
        dirObj = globals.DIR_MAP.up;
        player.sprite.y -= 2;
      } else if (player.sprite.y < toPixels(tileY)) {
        dirObj = globals.DIR_MAP.down;
        player.sprite.y += 2;
      } else { //We got to our destination
        path.shift();
        player.setPos(tileX, tileY);
        animateMoveOnPath(path);
        return undefined;
      }
      if (player.sprite.body.facing !== dirObj.number) {
        player.sprite.animations.play("walk-" + dirObj.string, 4, true);
        player.sprite.body.facing = dirObj.number;
      }
      setTimeout(function() {
        animateMoveStep(tileX, tileY, path);
      }, 30);
    }

    function createMoveGrid(layer) {
      var g = game.add.graphics(0, 0);
      //TODO: look at tiles within player speed, not whole map
      layer.getTiles(0, 0, layer.width, layer.height).forEach(function(tile) {
        var tileX = toTile(tile.x);
        var tileY = toTile(tile.y);
        if (!isPlayerPos(tileX, tileY) && !isEnemy(tileX, tileY)) {
          drawGoToShade(tileX, tileY, g);
        }
      });
      easystar.calculate();
      moveGrid = g;
      return g;
    }

    function drawGoToShade(x, y, graphics) {
      easystar.findPath(player.x, player.y, x, y, function(path) {
        if (path !== null && path.length <= globals.PLAYER_MOVES + 1) {
          graphics.lineStyle(2, 0x66A3C2, 0.4);
          graphics.beginFill(0x66A3C2, 0.3);
          graphics.drawRect(
            toPixels(x),
            toPixels(y),
            globals.TILE_SIZE,
            globals.TILE_SIZE);
          graphics.endFill();
        }
      });
    }

    function handleMapClick() {
      var mapClickValid = (
        moveGridGraphics !== undefined &&
        moveGridGraphics.visible &&
        moving === false);
      if (mapClickValid) {
        var tileX = Math.floor(toTile(game.input.x));
        var tileY = Math.floor(toTile(game.input.y));
        if (potentialMove !== undefined) {
          if (tileX === potentialMove.x && tileY === potentialMove.y) {
            //legal move selected. move along path and return true
            animateMoveOnPath(potentialMove.path);
            potentialMove.graphics.destroy();
            potentialMove = undefined;
            return true;
          }
        }
        // otherwise determine if we have a legal move to present
        easystar.findPath(player.x, player.y, tileX, tileY,
          function(path) {
            if (path !== null && path.length <= globals.PLAYER_MOVES + 1 && !
              isPlayerPos(tileX, tileY) && !isEnemy(tileX, tileY)) {
              presentLegalMove(path);
            }
          });
        easystar.calculate();
      }
    }
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
        toPixels(destX) + globals.TILE_SIZE / 2,
        toPixels(destY) + globals.TILE_SIZE / 2,
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

    function drawPath(g, path) {
      g.lineStyle(2, 0xE68A00, 0.9);
      g.x = toPixels(path[0].x) + globals.TILE_SIZE / 2;
      g.y = toPixels(path[0].y) + globals.TILE_SIZE / 2;
      path.forEach(function(point) {
        g.lineTo(
          toPixels(point.x) + globals.TILE_SIZE / 2,
          toPixels(point.y) + globals.TILE_SIZE / 2);
      });
      g.x = 0;
      g.y = 0;
    }

    function handlePlayerClick() {
      if (moving === false) {
        if (moveGridGraphics === undefined) {
          moveGridGraphics = createMoveGrid(moveLayer, highSceneryLayer);
        } else {
          moveGridGraphics.visible = !moveGridGraphics.visible;
          if (potentialMove !== undefined) {
            potentialMove.graphics.destroy();
            potentialMove = undefined;
          }
        }
        relayer();
      }
    }

    function isEnemy(x, y) {
      var result = false;
      enemies.forEach(function(enemy){
        if (x === enemy.x && y === enemy.y) {
          result = true;
        }
      });
      return result;
    }

    function isPlayerPos(x, y) {
      return x === player.x && y === player.y;
    }

    function toPixels(x) {
      return x * globals.TILE_SIZE;
    }

    function toTile(x) {
      return x / globals.TILE_SIZE;
    }

    function relayer() {
      //TODO: make this not have to be called. it obscures the
      //hidden parts of the moveGridGraphics
      sceneryLayer.bringToTop();
      player.sprite.bringToTop();
      highSceneryLayer.bringToTop();
    }
  };
});