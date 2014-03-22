define([
  "Actor",
  "helpers"
], function(Actor, helpers) {
  "use strict";
  var Enemy = function(_x, _y, _map, spriteName, game) {
    Enemy.parentConstructor.call(this, _x, _y, _map, spriteName, game);
  };

  helpers.extend(Enemy, Actor);

  return Enemy;
});