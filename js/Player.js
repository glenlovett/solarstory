define([
  "Actor",
  "helpers",
  "globals"
], function(Actor, helpers, globals) {
  "use strict";
  var Player = function(_x, _y, _map, spriteName, game) {
    Player.parentConstructor.call(this, _x, _y, _map, spriteName, game);
    this.sprite.inputEnabled = true;
    this.sprite.anchor.setTo(0, 0.5);
    this.sprite.animations.add("walk-down", [1, 3]);
    this.sprite.animations.add("walk-up", [13, 15]);
    this.sprite.animations.add("walk-left", [5, 7]);
    this.sprite.animations.add("walk-right", [9, 11]);
    this.sprite.body.setRectangle(28, 16, 2, 32);
    this.sprite.body.collideWorldBounds = true;

    this.handlePlayerClick = function() {
      if (globals.moving === false) {
        if (globals.moveGridGraphics === undefined) {
          globals.moveGridGraphics = this.map.createMoveGrid();
        } else {
          globals.moveGridGraphics.visible = !globals.moveGridGraphics.visible;
          if (this.map.potentialMove !== undefined) {
            this.map.potentialMove.graphics.destroy();
            this.map.potentialMove = undefined;
          }
        }
        this.relayer();
      }
    };

    this.sprite.events.onInputUp.add(this.handlePlayerClick, this);

    this.relayer = function() {
      //TODO: make this not have to be called. it obscures the
      //hidden parts of the globals.moveGridGraphics
      this.map.sceneryLayer.bringToTop();
      this.sprite.bringToTop();
      this.map.highSceneryLayer.bringToTop();
    };
  };

  helpers.extend(Player, Actor);

  return Player;
});