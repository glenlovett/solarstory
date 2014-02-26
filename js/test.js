Game.Test = function (game) {
  "use strict";
  var easystar = new EasyStar.js();
  var playerLoc = {
    x: 4,
    y: 2
  };
  var freeMoveEnabled = false;
  var moving = false;
  var map;
  var moveLayer;
  var sceneryLayer;
  var highSceneryLayer;
  var player;
  var moveGrid;
  var moveGridGraphics;
  var potentialMove;

  this.create = function () {
    initMap();
    initPlayer();
  };
  this.update = function () {
  };
  function initMap() {
    map = game.add.tilemap("test-map");
    moveLayer = map.createLayer("move");
    sceneryLayer = map.createLayer("scenery");
    highSceneryLayer = map.createLayer("high-scenery");
    moveLayer.inputEnabled = true;
    map.addTilesetImage("grassland");
    map.setCollision([2,3], true, "scenery");
    var gridAndIndices = getGridAndIndices(moveLayer);
    easystar.setGrid(gridAndIndices.grid);
    easystar.setAcceptableTiles(gridAndIndices.indices);
    moveLayer.events.onInputUp.add(handleMapClick);
  }
  function initPlayer() {
    player = game.add.sprite(playerLoc.x*Game.TILE_SIZE, playerLoc.y*Game.TILE_SIZE + Game.PLAYER_OFFSET, "player");
    player.inputEnabled = true;
    player.anchor.setTo(0, 1);
    player.animations.add("walk-down", [1,3]);
    player.animations.add("walk-up", [13,15]);
    player.animations.add("walk-left", [5,7]);
    player.animations.add("walk-right", [9,11]);
    player.body.setRectangle(28, 16, 2, 32);
    player.body.collideWorldBounds = true;
    player.events.onInputUp.add(handlePlayerClick);
  }
  function getGridAndIndices(layer) {
    var grid = [];
    var indices = [];
    var rowIndex = 0;
    var columnIndex = 0;
    layer.layer.data.forEach(function (row) {
      grid.push([]);
      row.forEach(function (tileOrNull) {
        var i;
        var addedToAcceptable = false;
        if (tileOrNull === null) {
          grid[rowIndex][columnIndex] = 0;
        } else {
          grid[rowIndex][columnIndex] = tileOrNull.index;
          for (i = 0 ; indices.length > i ; i++) {
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
      moveGridGraphics.destroy();
      animateMoveStep(path[0].x, path[0].y, path);
    } else { // we're done moving..
      player.body.facing = 0;
      player.animations.stop();
      moveGridGraphics = createMoveGrid(map, moveLayer, highSceneryLayer);
      moveGridGraphics.visible = false;
      relayer();
      moving = false;
      return undefined;
    }
  }
  function animateMoveStep(tileX, tileY, path) {
    var dirObj;
    if (player.x > tileX*Game.TILE_SIZE) {
      dirObj = Game.DIR_MAP.left;
      player.x -= 2;
    } else if (player.x < tileX*Game.TILE_SIZE) {
      dirObj = Game.DIR_MAP.right;
      player.x += 2;
    } else if (player.y - Game.PLAYER_OFFSET > tileY*Game.TILE_SIZE) {
      dirObj = Game.DIR_MAP.up;
      player.y -= 2;
    } else if (player.y - Game.PLAYER_OFFSET < tileY*Game.TILE_SIZE) {
      dirObj = Game.DIR_MAP.down;
      player.y += 2;
    } else { //We got to our destination
      path.shift();
      playerLoc.x = tileX;
      playerLoc.y = tileY;
      animateMoveOnPath(path);
      return undefined;
    }
    if (player.body.facing !== dirObj.number) {
      player.animations.play("walk-"+dirObj.string, 4, true);
      player.body.facing = dirObj.number;
    }
    setTimeout(function() {
      animateMoveStep(tileX, tileY, path);
    }, 30);
  }
  function createMoveGrid(map, layer, layer2) {
    var g = game.add.graphics(0, 0);
    //TODO: possibly optimize this to look at tiles within player speed, not whole map
    layer.getTiles(0, 0, layer.width, layer.height).forEach(function(tile) {
      var tileX = tile.x/Game.TILE_SIZE;
      var tileY = tile.y/Game.TILE_SIZE;
      var isPlayerPos = (tileX === playerLoc.x && tileY === playerLoc.y);
      if (!isPlayerPos) {
        if (map.getTile(tileX,tileY,layer2) === null) {
          drawGoToShade(tileX, tileY, g, false);
        } else {
          drawGoToShade(tileX, tileY, g, true);
        }
      }
    });
    easystar.calculate();
    moveGrid = g;
    return g;
  }
  function drawGoToShade(x, y, graphics, obscured) {
    easystar.findPath(playerLoc.x, playerLoc.y, x, y, function(path) {
      if (path !== null && path.length <= Game.PLAYER_MOVES+1) {
        if (obscured) {
          graphics.lineStyle(2, 0x66A3C2, 0.4);
          graphics.beginFill(0x66A3C2, 0.3);
        } else {
          graphics.lineStyle(2, 0x66A3C2, 0.6);
          graphics.beginFill(0x66A3C2, 0.5);
        }
        graphics.drawRect(
          x*Game.TILE_SIZE,
          y*Game.TILE_SIZE,
          Game.TILE_SIZE,
          Game.TILE_SIZE);
        graphics.endFill();
      }
    });
  }
  function handleMapClick(){
    if (moveGridGraphics !== undefined && moveGridGraphics.visible && moving === false) {
      var tileX = Math.floor(game.input.x / Game.TILE_SIZE);
      var tileY = Math.floor(game.input.y / Game.TILE_SIZE);
      if (potentialMove !== undefined) {
        if (tileX === potentialMove.x && tileY === potentialMove.y) {
          //legal move selected. move along path and return true
          animateMoveOnPath(potentialMove.path);
          potentialMove.graphics.destroy();
          potentialMove = undefined;
          return true;
        }
      }
      // otherwise determine if we have a legal move to present. if so, present it
      easystar.findPath(playerLoc.x, playerLoc.y, tileX, tileY,
        function(path) {
          var isPlayerPos = (tileX === playerLoc.x && tileY === playerLoc.y);
          if (path !== null && path.length <= Game.PLAYER_MOVES + 1 && !isPlayerPos) {
            presentLegalMoveTo(tileX, tileY, path);
          }
        });
      easystar.calculate();
    }
  }
  //show a move to the user for confirmation
  function presentLegalMoveTo(tileX, tileY, path) {
    if (potentialMove !== undefined) {
      potentialMove.graphics.destroy();
    }
    var g = game.add.graphics(0, 0);
    g.lineStyle(2, 0xE68A00, 0.5);
    g.beginFill(0xE68A00, 1);
    g.drawCircle(tileX*Game.TILE_SIZE + Game.TILE_SIZE/2,
      tileY*Game.TILE_SIZE + Game.TILE_SIZE/2,
      Game.TILE_SIZE / 8);
    g.endFill();
    drawPath(g, path);
    potentialMove = {
      x: tileX,
      y: tileY,
      graphics: g,
      path: path
    };
  }
  function drawPath(g, path) {
    g.lineStyle(2, 0xE68A00, 0.9);
    g.x = path[0].x*Game.TILE_SIZE + Game.TILE_SIZE/2;
    g.y = path[0].y*Game.TILE_SIZE + Game.TILE_SIZE/2;
    path.forEach(function(point) {
      g.lineTo(point.x*Game.TILE_SIZE + Game.TILE_SIZE/2, point.y*Game.TILE_SIZE + Game.TILE_SIZE/2);
    });
    g.x = 0;
    g.y = 0;
  }
  function handlePlayerClick() {
    if (moving === false) {
      if (moveGridGraphics === undefined) {
        moveGridGraphics = createMoveGrid(map, moveLayer, highSceneryLayer);
      } else {
        moveGridGraphics.visible = !moveGridGraphics.visible;
      }
      relayer();
    }
  }
  function relayer() {
    //TODO: make this not have to be called. it obscures the
    //hidden parts of the moveGridGraphics
    sceneryLayer.bringToTop();
    player.bringToTop();
    highSceneryLayer.bringToTop();
  }
};