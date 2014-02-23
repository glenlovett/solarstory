Game.Test = function (game) {
  var playerLoc = {
    x: 4,
    y: 1
  };
  var cursors;
  var map;
  var moveLayer;
  var sceneryLayer;
  var player;
  var moveGrid;

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
    map.addTilesetImage("grassland");
    moveLayer = map.createLayer("move");
    sceneryLayer = map.createLayer("scenery");
    //TODO: make this work as the grid does???
    map.setCollision([2,3], true, "scenery");
  }
  function initPlayer() {
    var startingPos = getXY(playerLoc.x, playerLoc.y);
    player = game.add.sprite(startingPos.x, startingPos.y, "player");
    player.inputEnabled = true;
    player.animations.add("walk-down", [1,3]);
    player.animations.add("walk-up", [13,15]);
    player.animations.add("walk-left", [5,7]);
    player.animations.add("walk-right", [9,11]);
    player.body.setRectangle(28, 16, 2, 32);
    player.body.collideWorldBounds = true;
    player.events.onInputUp.add(toggleGrid, this);
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
    player.body.velocity[dirObj.xy] = dirObj.playerVelocity;
    player.animations.play("walk-"+dirObj.string, 4, false);
    if (player.body.facing !== dirObj.number) {
      player.body.facing = dirObj.number;
    }
  }
  function applyGraphicsToLayer(map, layer, layer2, normalFun, overlapFun) {
    var g = game.add.graphics(0, 0);
    //TODO optimize this to look at tiles within player speed, not whole map
    layer.getTiles(0, 0, layer.width, layer.height).forEach(function(tile) {
      var tileX = getTilePos(tile.x, tile.y).x;
      var tileY = getTilePos(tile.x, tile.y).y;
      if (map.getTile(tileX,tileY,layer2) === null) {
        if (isWithin(playerLoc.x, playerLoc.y, tileX, tileY, 6)) {
          normalFun(tile.x, tile.y, g);
        }
      } else {
        if (isWithin(playerLoc.x, playerLoc.y, tileX, tileY, 6)) {
          overlapFun(tile.x, tile.y, g);
        }
      }
    });
    return g;
  }
  function isWithin(x1, y1, x2, y2, moves) {
    return true;
  }
  function drawGoToShade(x, y, graphics) {
    graphics.lineStyle(2, 0x8641E0, 0.4);
    graphics.beginFill(0x8641E0, 0.5);
    graphics.drawRect(x, y, Game.TILE_SIZE, Game.TILE_SIZE);
    graphics.endFill();
  }
  function drawGoToShadeOverlap(x, y, graphics) {
    graphics.lineStyle(2, 0x8641E0, 0.3);
    graphics.beginFill(0x8641E0, 0.2);
    graphics.drawRect(x, y, Game.TILE_SIZE, Game.TILE_SIZE);
    graphics.endFill();
  }
  function handleArrowKeys() {
    player.body.velocity.y = 0;
    player.body.velocity.x = 0;
    game.physics.collide(player, sceneryLayer);
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
  function toggleGrid(grid) {
    if (moveGrid === undefined) {
      moveGrid = applyGraphicsToLayer(map, moveLayer, sceneryLayer, drawGoToShade, drawGoToShadeOverlap);
    } else {
      moveGrid.visible = !moveGrid.visible;
    }
    player.bringToTop();
  }
};