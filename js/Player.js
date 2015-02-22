define([
  "Actor",
  "helpers",
  "globals"
], function (Actor, helpers, globals) {
  "use strict";
  var Player = function Player(_x, _y, _stats, _map, spriteName, game) {
    Player.parentConstructor.call(this, _x, _y, _stats, _map, spriteName, game);
    var self = this;
    this.potentialMove = undefined;
    this.moveGridGraphics = undefined;
    this.sprite.inputEnabled = true;
    this.sprite.anchor.setTo(0, 0.5);
    this.sprite.animations.add("walk-down", [1, 3]);
    this.sprite.animations.add("walk-up", [13, 15]);
    this.sprite.animations.add("walk-left", [5, 7]);
    this.sprite.animations.add("walk-right", [9, 11]);

    this.handlePlayerClick = function () {
      if (this.moving) return;
      if (this.moveGridVisible()) {
        this.removePotentialMove();
      } else {
        relayer();
        this.moveGridGraphics = createMoveGrid();
      }
    };

    this.sprite.events.onInputUp.add(this.handlePlayerClick, this);

    this.presentPotentialMove = function (path) {
      var destX = path[path.length - 1].x;
      var destY = path[path.length - 1].y;
      var g = game.add.graphics(0, 0);
      if (this.potentialMove !== undefined) {
        this.potentialMove.graphics.destroy();
      }
      g.lineStyle(2, 0xE68A00, 0.5);
      g.beginFill(0xE68A00, 1);
      g.drawCircle(
        helpers.toPixels(destX) + globals.TILE_SIZE / 2,
        helpers.toPixels(destY) + globals.TILE_SIZE / 2,
        globals.TILE_SIZE / 8);
      g.endFill();
      helpers.drawPath(g, path);
      this.potentialMove = {
        x: destX,
        y: destY,
        graphics: g,
        path: path
      };
    };

    this.presentPotentialAttack = function (x, y) {
      var graphics = game.add.graphics(0, 0);
      this.removePotentialMove();
      this.removePotentialAttack();
      helpers.drawShadedSquare(x, y, 0xC63333, graphics);
      this.potentialAttack = {
        x: x,
        y: y,
        graphics: graphics
      };
    };

    this.moveGridVisible = function () {
      return this.moveGridGraphics && this.moveGridGraphics.visible;
    }

    this.removePotentialMove = function () {
      if (this.moveGridVisible()) {
        this.moveGridGraphics.visible = false;
      }
      if (this.potentialMove !== undefined) {
        this.potentialMove.graphics.destroy();
        this.potentialMove = undefined;
      }
    };

    this.removePotentialAttack = function () {
      if (this.potentialAttack !== undefined) {
        this.potentialAttack.graphics.destroy();
        this.potentialAttack = undefined;
      }
    };

    this.attack = function (x, y) {
      this.removePotentialAttack();
      var actor = this.map.getEnemyAt(x, y);
      //TODO: turn self to face actor
      //TODO: update UI to show damage
      //TODO: apply damage from actor1 to actor
      //TODO: destroy actor only if damage dealt reduces HP to 0
      actor.kill();
    };

    function createMoveGrid() {
      var graphics = game.add.graphics(0, 0);
      var speedInPixels = helpers.toPixels(self.stats.speed + 1);
      var xInPixels = helpers.toPixels(self.x);
      var yInPixels = helpers.toPixels(self.y);
      var x1 = Math.max(0, xInPixels - speedInPixels);
      var y1 = Math.max(0, yInPixels - speedInPixels);
      var x2 = Math.min(self.map.moveLayer.width, xInPixels + speedInPixels);
      var y2 = Math.min(self.map.moveLayer.width, yInPixels + speedInPixels);
      self.removePotentialAttack();
      self.map.moveLayer.getTiles(x1, y1, x2, y2).forEach(function (tile) {
        if (!self.isAtPos(tile.x, tile.y)) {
          drawGoToShade(tile.x, tile.y, graphics);
        }
      });
      self.map.easystar.calculate();
      return graphics;
    }

    function drawGoToShade(x, y, graphics) {
      self.map.easystar.findPath(self.x, self.y, x, y, function (path) {
        if (path !== null && path.length <= self.stats.speed + 1) {
          helpers.drawShadedSquare(x, y, 0x66A3C2, graphics);
        }
      });
    }

    function relayer() {
      //TODO: order this so that the player appears above the movegrid
      // but below the highSceneryLayer
      self.map.sceneryLayer.bringToTop();
      self.sprite.bringToTop();
      self.map.highSceneryLayer.bringToTop();
    }

  };

  helpers.extend(Player, Actor);

  return Player;
});