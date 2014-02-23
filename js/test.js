Game.Test = function (game) {
  this.playerLoc = {
    x: 4,
    y: 1
  };
};

Game.Test.prototype = {
	create: function () {
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.initMap();
		this.initPlayer();
	},
	update: function () {
    //this.handleArrowKeys();
	},
	initMap: function () {
		this.map = this.game.add.tilemap("test-map");
		this.map.addTilesetImage("grassland");
		this.moveLayer = this.map.createLayer("move");
		this.sceneryLayer = this.map.createLayer("scenery");
		//TODO: make this work as the grid does???
    //this.map.setCollision([2,3], true, "scenery");
	},
	initPlayer: function () {
    var startingPos = this.getXY(this.playerLoc.x, this.playerLoc.y);
		this.player = this.game.add.sprite(startingPos.x, startingPos.y, "player");
    this.player.inputEnabled = true;
		this.player.animations.add("walk-down", [1,3]);
		this.player.animations.add("walk-up", [13,15]);
		this.player.animations.add("walk-left", [5,7]);
		this.player.animations.add("walk-right", [9,11]);
		this.player.body.setRectangle(28, 16, 2, 32);
		this.player.body.collideWorldBounds = true;
    this.player.events.onInputUp.add(this.toggleGrid, this);
	},
	getXY: function (tileX, tileY) {
		return {
			x: tileX*Game.TILE_SIZE,
			y: tileY*Game.TILE_SIZE
		};
  },
  getTilePos: function (x, y) {
    return {
      x: x/Game.TILE_SIZE,
      y: y/Game.TILE_SIZE
    };
  },
	movePlayer: function (dirObj) {
		this.player.body.velocity[dirObj.xy] = dirObj.playerVelocity;
		this.player.animations.play("walk-"+dirObj.string, 4, false);
		if (this.player.body.facing !== dirObj.number) {
			this.player.body.facing = dirObj.number;
		}
	},
	applyGraphicsToLayer: function (map, layer, layer2, normalFun, overlapFun) {
    var g = this.game.add.graphics(0, 0);
    var player = this.player;
    var isWithin = this.isWithin;
    var playerLoc = this.playerLoc;
    var getTilePos = this.getTilePos;
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
	},
  isWithin: function (x1, y1, x2, y2, moves) {
    var stepX = x1;
    var stepY = y1;
    for (var movesLeft = moves ; movesLeft >= 0 ; movesLeft--) {
      if (stepX === x2 && stepY === y2) {
        return true;
      }
      if (Math.abs(stepX - x2) > Math.abs(stepY - y2)) {
        if (stepX < x2) {
          stepX = stepX + 1;
        } else {
          stepX = stepX - 1;
        }
      } else {
        if (stepY < y2) {
          stepY = stepY + 1;
        } else {
          stepY = stepY - 1;
        }
      }
    }
    return false;
  },
  drawGoToShade: function (x, y, graphics) {
    graphics.lineStyle(2, 0x8641E0, 0.4);
    graphics.beginFill(0x8641E0, 0.5);
    graphics.drawRect(x, y, Game.TILE_SIZE, Game.TILE_SIZE);
    graphics.endFill();
  },
  drawGoToShadeOverlap: function (x, y, graphics) {
    graphics.lineStyle(2, 0x8641E0, 0.3);
    graphics.beginFill(0x8641E0, 0.2);
    graphics.drawRect(x, y, Game.TILE_SIZE, Game.TILE_SIZE);
    graphics.endFill();
  },
  handleArrowKeys: function () {
    this.player.body.velocity.y = 0;
		this.player.body.velocity.x = 0;
		this.game.physics.collide(this.player, this.sceneryLayer);
		if (this.cursors.up.isDown) {
			this.movePlayer(Game.DIR_MAP.up);
		} else if (this.cursors.down.isDown) {
			this.movePlayer(Game.DIR_MAP.down);
		} else if (this.cursors.left.isDown) {
			this.movePlayer(Game.DIR_MAP.left);
		} else if (this.cursors.right.isDown) {
			this.movePlayer(Game.DIR_MAP.right);
		} else {
			this.player.body.facing = 0;
			this.player.animations.stop();
		}
  },
  toggleGrid: function (grid) {
    if (this.moveGrid === undefined) {
      this.moveGrid = this.applyGraphicsToLayer(this.map, this.moveLayer, this.sceneryLayer, this.drawGoToShade, this.drawGoToShadeOverlap);
    } else {
      this.moveGrid.visible = !this.moveGrid.visible;
    }
    this.player.bringToTop();
  }
};