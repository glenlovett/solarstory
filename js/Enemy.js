define(function () {
  "use strict";
  return function (_x, _y, _sprite) {
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

    this.setSprite = function (sprite) {
      sprite = sprite;
    };

    this.getSprite = function () {
      return sprite;
    };
  };
});