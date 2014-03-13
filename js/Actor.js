define([
  "globals",
  "helpers"
], function(globals, helpers) {
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
  
  Actor.prototype.animateMoveOnPath = function(path) {
      if (path.length > 0) {
        globals.moving = true;
        if (globals.moveGridGraphics !== undefined) {
          globals.moveGridGraphics.destroy();
          globals.moveGridGraphics = undefined;
        }
        this.animateMoveStep(path[0].x, path[0].y, path);
      } else { // we're done moving..
        this.sprite.body.facing = 0;
        this.sprite.animations.stop();
        globals.moving = false;
        return undefined;
      }
    };

    Actor.prototype.animateMoveStep = function(tileX, tileY, path) {
      var dirObj;
      var self = this;
      if (this.sprite.x > helpers.toPixels(tileX)) {
        dirObj = globals.DIR_MAP.left;
        this.sprite.x -= 2;
      } else if (this.sprite.x < helpers.toPixels(tileX)) {
        dirObj = globals.DIR_MAP.right;
        this.sprite.x += 2;
      } else if (this.sprite.y > helpers.toPixels(tileY)) {
        dirObj = globals.DIR_MAP.up;
        this.sprite.y -= 2;
      } else if (this.sprite.y < helpers.toPixels(tileY)) {
        dirObj = globals.DIR_MAP.down;
        this.sprite.y += 2;
      } else { //We got to our destination
        path.shift();
        this.setPos(tileX, tileY);
        this.animateMoveOnPath(path);
        return undefined;
      }
      if (this.sprite.body.facing !== dirObj.number) {
        this.sprite.animations.play("walk-" + dirObj.string, 4, true);
        this.sprite.body.facing = dirObj.number;
      }
      setTimeout(function() {
        self.animateMoveStep(tileX, tileY, path);
      }, 30);
    };
    
    Actor.prototype.isAtPos = function(tileX, tileY) {
      return tileX === this.x && tileY === this.y;
    }
  
  return Actor;
});