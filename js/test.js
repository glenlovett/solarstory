Game.Test = function (game) {
	this.game = game;
	this.cursors = null;
	this.graphics = null;
	this.player = null;
	this.startingPos = this.getTileXY(4, 1);
};

Game.Test.prototype = {
	create: function () {
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.graphics = this.game.add.graphics();
		this.initMap();
		this.initPlayer();
	},
	update: function () {
		this.player.body.velocity.y = 0;
		this.player.body.velocity.x = 0;
		this.game.physics.collide(this.player, collisionLayer);
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
	initMap: function () {
		var map = this.game.add.tilemap("test-map");
		map.addTilesetImage("grassland");
		moveLayer = map.createLayer("Tile Layer 1");
		moveLayer.resizeWorld();
		collisionLayer = map.createLayer("collision");
		map.setCollision([2,3], true, "collision");
	},
	initPlayer: function () {
		this.player = this.game.add.sprite(this.startingPos.x, this.startingPos.y, "player");
		this.player.animations.add("walk-down", [1,3]);
		this.player.animations.add("walk-up", [13,15]);
		this.player.animations.add("walk-left", [5,7]);
		this.player.animations.add("walk-right", [9,11]);
		this.player.body.setRectangle(28, 16, 2, 32);
		this.player.body.collideWorldBounds = true;
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
	}
};