define([
  "Actor",
  "helpers"
], function(Actor, helpers) {
  "use strict";
  var Enemy = function(_x, _y, _stats, _map, spriteName, game) {
    Enemy.parentConstructor.call(this, _x, _y, _stats, _map, spriteName, game);
  };

  helpers.extend(Enemy, Actor);

  Enemy.prototype.getPartialPathTo = function(_x, _y) {
    console.log("todo");
  };

  return Enemy;
});