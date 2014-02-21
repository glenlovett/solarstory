Game.Test = function (game) {
	this.startingPos = this.getTileXY(4, 1);
};

Game.Test.prototype = {
	create: function () {
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.initMap();
		this.initPlayer();
	},
	update: function () {
    this.handleArrowKeys();
	},
	initMap: function () {
		this.map = this.game.add.tilemap("test-map");
		this.map.addTilesetImage("grassland");
		this.moveLayer = this.map.createLayer("move");
		this.sceneryLayer = this.map.createLayer("scenery");
		//TODO: make this work as the grid does???
    this.map.setCollision([2,3], true, "scenery");
	},
	initPlayer: function () {
		this.player = this.game.add.sprite(this.startingPos.x, this.startingPos.y, "player");
    this.player.inputEnabled = true;
		this.player.animations.add("walk-down", [1,3]);
		this.player.animations.add("walk-up", [13,15]);
		this.player.animations.add("walk-left", [5,7]);
		this.player.animations.add("walk-right", [9,11]);
		this.player.body.setRectangle(28, 16, 2, 32);
		this.player.body.collideWorldBounds = true;
    this.player.events.onInputUp.add(this.toggleGrid, this);
	},
	getTileXY: function (tileX, tileY) {
		return {
			x: tileX*Game.TILE_SIZE,
			y: tileY*Game.TILE_SIZE
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
    var game = this.game;
    layer.getTiles(0, 0, layer.width, layer.height).forEach(function(tile) {
      if (map.getTile(tile.x/Game.TILE_SIZE,tile.y/Game.TILE_SIZE,layer2) === null) {
        normalFun(tile.x, tile.y, g);
      } else {
        overlapFun(tile.x, tile.y, g);
      }
    });
    return g
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