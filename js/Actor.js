define([
  "globals",
  "helpers"
], function (globals, helpers) {
  "use strict";
  var Actor = function (_x, _y, _stats, _map, spriteName, game) {
    this.x = _x;
    this.y = _y;
    this.stats = _stats;
    this.map = _map;
    this.sprite = game.add.sprite(
      _x * globals.TILE_SIZE,
      _y * globals.TILE_SIZE,
      spriteName);
    this.map.moveGrid[_y][_x] = 0;
    this.map.easystar.setGrid(this.map.moveGrid);
    this.moving = false;
    this.hpText = undefined;

    this.showHpText = function () {
      var hpTextContent = this.stats.currentHp + "/" + this.stats.maxHp;
      var hpTextStyle = {
        font: "16px",
        width: 32,
        align: "center"
      };
      this.hpText = game.add.text(
        this.sprite.x + globals.TILE_SIZE / 2,
        this.sprite.y + globals.TILE_SIZE,
        hpTextContent,
        hpTextStyle);
      this.hpText.anchor.set(0.5);
    };

    this.hideHpText = function () {
      if (this.hpText) this.hpText.destroy();
    };
  };

  Actor.prototype.setPos = function (_x, _y) {
    this.x = _x;
    this.y = _y;
    this.sprite.x = _x * globals.TILE_SIZE;
    this.sprite.y = _y * globals.TILE_SIZE;
    this.map.moveGrid[_y][_x] = 0;
    this.map.easystar.setGrid(this.map.moveGrid);
  };

  Actor.prototype.animateMoveOnPath = function (path, callback, context) {
    if (path.length > 0) {
      this.map.moveGrid[this.y][this.x] = 1;
      this.map.moveGrid[path[path.length - 1].y][path[path.length - 1].x] = 0;
      this.moving = true;
      this.animateMoveStep(path[0].x, path[0].y, path, callback, context);
    } else {
      if (callback !== undefined) callback.call(context);
    }
  };

  Actor.prototype.animateMoveStep = function (tileX, tileY, path, callback, context) {
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
    } else {
      var destX = path[path.length - 1].x;
      var destY = path[path.length - 1].y;
      path.shift();
      if (path.length === 0) { //We got to our final destination
        this.sprite.facing = 0;
        this.sprite.animations.stop();
        this.setPos(destX, destY);
        this.moving = false;
        if (callback !== undefined) callback.call(context);
      } else { //We got to our partial destination
        this.animateMoveOnPath(path, callback, context);
      }
      return undefined;
    }
    if (this.sprite.facing !== dirObj.number) {
      this.sprite.animations.play("walk-" + dirObj.string, 4, true);
      this.sprite.facing = dirObj.number;
    }
    setTimeout(function () {
      self.animateMoveStep(tileX, tileY, path, callback, context);
    }, 30);
  };

  Actor.prototype.isAtPos = function (tileX, tileY) {
    return tileX === this.x && tileY === this.y;
  };

  Actor.prototype.withinAttackRange = function (x, y) {
    //is directly up down left or right of the actor
    return (this.x === x && (this.y === y - 1 || this.y === y + 1) ||
      this.y === y && (this.x === x - 1 || this.x === x + 1));
  };

  return Actor;
});