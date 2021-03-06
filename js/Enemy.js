define([
  "Actor",
  "helpers"
], function (Actor, helpers) {
  "use strict";
  var Enemy = function Enemy(x, y, stats, map, spriteName, game) {
    Enemy.parentConstructor.call(this, x, y, stats, map, spriteName, game);
  };

  helpers.extend(Enemy, Actor);

  Enemy.prototype.moveTowards = function (targetX, targetY) {
    var self = this;
    var potentialDestinations = self.map.moveLayer.getTiles(0, 0, self.map.moveLayer.width, self.map.moveLayer.height);
    var pathsChecked = 0;
    var bestPath = [];
    var closestDistance = Infinity;
    potentialDestinations.forEach(function (tile) {
      checkPathTo(tile.x, tile.y);
    });

    function checkPathTo(x, y) {
      self.map.easystar.findPath(self.x, self.y, x, y, function (path) {
        pathsChecked = pathsChecked + 1;
        if (path !== null && path.length <= self.stats.speed + 1) {
          var possibleX = path.length > 0 ? path[path.length - 1].x : self.x;
          var possibleY = path.length > 0 ? path[path.length - 1].y : self.y;
          var distanceToTarget = helpers.distanceBetween(possibleX, possibleY, targetX, targetY);
          if (distanceToTarget < closestDistance) {
            bestPath = path;
            closestDistance = distanceToTarget;
          }
        }
        if (pathsChecked === potentialDestinations.length - 1) {
          self.animateMoveOnPath(bestPath);
        }
      });
    }
    self.map.easystar.calculate();
  };

  Enemy.prototype.kill = function () {
    this.map.destroyEnemyAt(this.x, this.y);
    this.map.moveGrid[this.y][this.x] = 1;
  };

  return Enemy;
});