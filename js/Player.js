define([
  "Actor",
  "helpers"
], function(Actor, helpers) {
  "use strict";
  var Player = function(_x, _y, spriteName, game) {
    Player.parentConstructor.call(this, _x, _y, spriteName, game);
    this.sprite.inputEnabled = true;
    this.sprite.anchor.setTo(0, 0.5);
    this.sprite.animations.add("walk-down", [1, 3]);
    this.sprite.animations.add("walk-up", [13, 15]);
    this.sprite.animations.add("walk-left", [5, 7]);
    this.sprite.animations.add("walk-right", [9, 11]);
    this.sprite.body.setRectangle(28, 16, 2, 32);
    this.sprite.body.collideWorldBounds = true;
  };

  helpers.extend(Player, Actor);

  return Player;
});