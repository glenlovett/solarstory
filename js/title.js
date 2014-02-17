Game.Title = function (game) {
	this.game = game;
};

Game.Title.prototype = {
	preload: function () {
		this.add.sprite(0, 0, "bg-preloader");
	},
	create: function () {
		this.game.add.sprite(this.game.world.centerX - 138, 20, "title");
		this.game.add.button(this.game.world.centerX - 68, 160, "title-buttons", this.startGame, this, 1, 0, 1);
		//TODO: implement saving and loading
		//this.game.add.button(this.game.world.centerX - 68, 200, "title-buttons", null, this, 3, 2, 3);
	},
	startGame: function () {
		this.game.state.start("test");
	}
};