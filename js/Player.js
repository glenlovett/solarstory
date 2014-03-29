define([
  "Actor",
  "helpers",
  "globals"
], function(Actor, helpers, globals) {
  "use strict";
  var Player = function(_x, _y, _stats, _map, spriteName, game) {
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
    this.sprite.body.setRectangle(28, 16, 2, 32);
    this.sprite.body.collideWorldBounds = true;

    this.handlePlayerClick = function() {
      if (this.moving === false) {
        if (this.moveGridGraphics === undefined) {
          this.moveGridGraphics = createMoveGrid();
          this.removePotentialAttack();
        } else if (this.moveGridGraphics.visible) {
          this.moveGridGraphics.visible = false;
        } else {
          this.moveGridGraphics.visible = true;
          this.removePotentialAttack();
        }
        this.removePotentialMove();
        relayer();
      }
    };

    this.sprite.events.onInputUp.add(this.handlePlayerClick, this);

    this.presentLegalMove = function(path) {
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

    this.presentLegalAttack = function(x, y) {
      var graphics = game.add.graphics(0, 0);
      helpers.drawShadedSquare(x, y, 0xC63333, graphics);
      this.potentialAttack = {
        x: x,
        y: y,
        graphics: graphics
      };
    };

    this.removePotentialMove = function() {
      if (this.potentialMove !== undefined) {
        this.potentialMove.graphics.destroy();
        this.potentialMove = undefined;
      }
    };

    this.removePotentialAttack = function() {
      if (this.potentialAttack !== undefined) {
        this.potentialAttack.graphics.destroy();
        this.potentialAttack = undefined;
      }
    };

    function createMoveGrid() {
      var graphics = game.add.graphics(0, 0);
      //TODO: look at tiles within player speed, not whole map
      self.map.moveLayer.getTiles(0, 0, self.map.moveLayer.width, self.map.moveLayer.height).forEach(function(tile) {
        var tileX = helpers.toTile(tile.x);
        var tileY = helpers.toTile(tile.y);
        if (!self.isAtPos(tileX, tileY)) {
          drawGoToShade(tileX, tileY, graphics);
        }
      });
      self.map.easystar.calculate();
      return graphics;
    }

    function drawGoToShade(x, y, graphics) {
      self.map.easystar.findPath(self.x, self.y, x, y, function(path) {
        if (path !== null && path.length <= self.stats.speed + 1 && path.length > 0) {
          helpers.drawShadedSquare(x, y, 0x66A3C2, graphics);
        }
      });
    }

    function relayer() {
      //TODO: make this not have to be called. it obscures the
      //hidden parts of the moveGridGraphics :(
      self.map.sceneryLayer.bringToTop();
      self.sprite.bringToTop();
      self.map.highSceneryLayer.bringToTop();
    }

  };

  helpers.extend(Player, Actor);

  return Player;
});