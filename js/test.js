Game.Test = function (game) {
  "use strict";
  var easystar = new EasyStar.js();
  var playerLoc = {
    x: 4,
    y: 2
  };
  var freeMoveEnabled = false;
  var cursors;
  var map;
  var moveLayer;
  var sceneryLayer;
  var highSceneryLayer;
  var player;
  var moveGrid;
  var moveGridGraphics;
  var potentialMove;

  this.create = function () {
    cursors = game.input.keyboard.createCursorKeys();
    initMap();
    initPlayer();
  };
  this.update = function () {
    handleArrowKeys();
  };
  function initMap() {
    map = game.add.tilemap("test-map");
    moveLayer = map.createLayer("move");
    sceneryLayer = map.createLayer("scenery");
    highSceneryLayer = map.createLayer("high-scenery");
    moveLayer.inputEnabled = true;
    map.addTilesetImage("grassland");
    map.setCollision([2,3], true, "scenery");
    moveLayer.events.onInputUp.add(handleMapClick);
    var gridAndIndices = getGridAndIndices(moveLayer);
    easystar.setGrid(gridAndIndices.grid);
    easystar.setAcceptableTiles(gridAndIndices.indices);
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
  function initPlayer() {
    var startingPos = getXY(playerLoc.x, playerLoc.y);
    player = game.add.sprite(startingPos.x, startingPos.y + 20, "player");
    player.inputEnabled = true;
    player.anchor.setTo(0, 1);
    player.animations.add("walk-down", [1,3]);
    player.animations.add("walk-up", [13,15]);
    player.animations.add("walk-left", [5,7]);
    player.animations.add("walk-right", [9,11]);
    player.body.setRectangle(28, 16, 2, 32);
    player.body.collideWorldBounds = true;
    player.events.onInputUp.add(toggleMoveGrid);
  }
  function getXY(tileX, tileY) {
    return {
      x: tileX*Game.TILE_SIZE,
      y: tileY*Game.TILE_SIZE
    };
  }
  function getTilePos(x, y) {
    return {
      x: x/Game.TILE_SIZE,
      y: y/Game.TILE_SIZE
    };
  }
  function movePlayer(dirObj) {
    if (freeMoveEnabled) {
      player.body.velocity[dirObj.xy] = dirObj.playerVelocity;
      player.animations.play("walk-"+dirObj.string, 4, false);
      if (player.body.facing !== dirObj.number) {
        player.body.facing = dirObj.number;
      }
    }
  }
  function movePlayerAlongOnPath(tileX, tileY, path) {
    var newPlayerX = getXY(tileX, tileY).x;
    var newPlayerY = getXY(tileX, tileY).y + 20;
    player.x = newPlayerX;
    player.y = newPlayerY;
    playerLoc.x = tileX;
    playerLoc.y = tileY;
    moveGridGraphics.destroy();
    moveGridGraphics = createMoveGrid(map, moveLayer, highSceneryLayer);
    moveGridGraphics.visible = false;
    redisplay();
  }
  function createMoveGrid(map, layer, layer2) {
    var g = game.add.graphics(0, 0);
    //TODO optimize this to look at tiles within player speed, not whole map
    layer.getTiles(0, 0, layer.width, layer.height).forEach(function(tile) {
      var tileX = getTilePos(tile.x, tile.y).x;
      var tileY = getTilePos(tile.x, tile.y).y;
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
  function handleArrowKeys() {
    player.body.velocity.y = 0;
    player.body.velocity.x = 0;
    game.physics.collide(player, sceneryLayer);
    game.physics.collide(player, highSceneryLayer);
    if (cursors.up.isDown) {
      movePlayer(Game.DIR_MAP.up);
    } else if (cursors.down.isDown) {
      movePlayer(Game.DIR_MAP.down);
    } else if (cursors.left.isDown) {
      movePlayer(Game.DIR_MAP.left);
    } else if (cursors.right.isDown) {
      movePlayer(Game.DIR_MAP.right);
    } else {
      player.body.facing = 0;
      player.animations.stop();
    }
  }
  function handleMapClick(){
    if (moveGridGraphics !== undefined && moveGridGraphics.visible) {
      var tileX = Math.floor(getTilePos(game.input.x, game.input.y).x);
      var tileY = Math.floor(getTilePos(game.input.x, game.input.y).y);
      if (potentialMove !== undefined) {
        if (tileX === potentialMove.x && tileY === potentialMove.y) {
          if (potentialMove !== undefined) {
            potentialMove.graphics.destroy();
          }
          //legal move selected. move along path and return.
          movePlayerAlongOnPath(tileX, tileY, potentialMove.path);
          return true;
        }
      }
      //determine if we have a legal move to present. if so, present it
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
    g.lineStyle(2, 0xFF6600, 0.9);
    g.drawRect(
      tileX*Game.TILE_SIZE,
      tileY*Game.TILE_SIZE,
      Game.TILE_SIZE,
      Game.TILE_SIZE);
    g.endFill();
    potentialMove = {
      x: tileX,
      y: tileY,
      graphics: g,
      path: path
    };
  }
  function toggleMoveGrid() {
    if (moveGridGraphics === undefined) {
      moveGridGraphics = createMoveGrid(map, moveLayer, highSceneryLayer);
    } else {
      moveGridGraphics.visible = !moveGridGraphics.visible;
      if (potentialMove !== undefined) {
        potentialMove.graphics.destroy();
        potentialMove = undefined;
      }
    }
    redisplay();
  }
  function redisplay() {
    //TODO: make this not have to be called. it obscures the
    //hidden parts of the moveGridGraphics
    sceneryLayer.bringToTop();
    player.bringToTop();
    highSceneryLayer.bringToTop();
  }
};