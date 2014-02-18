Game.Preloader = function (game) {
	this.game = game;
};

Game.Preloader.prototype = {
	preload: function () {
		this.add.sprite(0, 0, "bg-preloader");
		
		//load title
		this.game.load.image("title", "assets/img/title/title.png");
		this.game.load.spritesheet("title-buttons", "assets/img/title/title-buttons.png", 136, 29);

        //load player
		this.game.load.spritesheet("player", "assets/img/characters/player-thief.png", 32, 48);
		this.game.load.image("player-shadow", "assets/img/title/title.png");

		//load test map
        this.game.load.tilemap("test-map", "assets/maps/grassland.json", null, Phaser.Tilemap.TILED_JSON);
		this.game.load.image("grassland", "assets/img/tiles/grassland.png");

		//show loading bar
		this.game.add.sprite(this.game.world.width/2-100, this.game.world.height/2, "loadingbar-background");
		var loadBar = this.game.add.sprite(this.game.world.width/2-100, this.game.world.height/2, "loadingbar-foreground");
		this.load.setPreloadSprite(loadBar);
	},
	create: function () {
		this.game.state.start("title");
	}
};