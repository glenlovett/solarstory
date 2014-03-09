define(["globals"], function(globals) {
  "use strict";
  var Actor = function(_x, _y, spriteName, game) {
    this.x = _x;
    this.y = _y;
    this.sprite = game.add.sprite(
      _x * globals.TILE_SIZE,
      _y * globals.TILE_SIZE,
      spriteName);
  };

  Actor.prototype.setPos = function(_x, _y) {
    this.x = _x;
    this.y = _y;
    this.sprite.x = _x * globals.TILE_SIZE;
    this.sprite.y = _y * globals.TILE_SIZE;
  };
  return Actor;
});