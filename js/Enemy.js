var Enemy = function (_x, _y, _sprite) {
  "use strict";
  var x = _x;
  var y = _y;
  var sprite = _sprite;

  this.setX = function (num) {
    x = num;
  };

  this.getX = function () {
    return x;
  };

  this.setY = function (num) {
    y = num;
  };

  this.getY = function () {
    return y;
  };

  this.setX = function (sprite) {
    sprite = sprite;
  };

  this.getX = function () {
    return sprite;
  };
};