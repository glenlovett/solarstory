define([
  "globals"
], function (globals) {
  "use strict";
  var helpers = {};

  helpers.extend = function (child, parent) {
    function Temp() {}
    Temp.prototype = parent.prototype;

    child.prototype = new Temp();
    child.prototype.constructor = child;
    child.super = parent.prototype;
    child.parentConstructor = parent;
  };

  helpers.toPixels = function (x) {
    return x * globals.TILE_SIZE;
  };

  helpers.toTile = function (x) {
    return x / globals.TILE_SIZE;
  };

  helpers.generateGridAndIndices = function (layer) {
    var grid = [];
    var rowIndex = 0;
    var columnIndex = 0;
    layer.layer.data.forEach(function (row) {
      grid.push([]);
      row.forEach(function (tile) {
        if (tile.properties.walk === "true") {
          grid[rowIndex][columnIndex] = 1;
        } else {
          grid[rowIndex][columnIndex] = 0;
        }
        columnIndex = columnIndex + 1;
      });
      columnIndex = 0;
      rowIndex = rowIndex + 1;
    });
    return grid;
  };

  helpers.drawPath = function (g, path) {
    g.lineStyle(2, 0xE68A00, 0.9);
    var startX = helpers.toPixels(path[0].x) + globals.TILE_SIZE / 2;
    var startY = helpers.toPixels(path[0].y) + globals.TILE_SIZE / 2;
    g.moveTo(startX, startY);
    path.forEach(function (point) {
      var x = helpers.toPixels(point.x) + globals.TILE_SIZE / 2;
      var y = helpers.toPixels(point.y) + globals.TILE_SIZE / 2;
      g.lineTo(x,y);
      g.moveTo(x,y);
    });
    g.moveTo(0, 0);
  };

  helpers.drawShadedSquare = function (x, y, color, graphics) {
    graphics.lineStyle(2, color, 0.4);
    graphics.beginFill(color, 0.3);
    graphics.drawRect(
      helpers.toPixels(x),
      helpers.toPixels(y),
      globals.TILE_SIZE,
      globals.TILE_SIZE);
    graphics.endFill();
  };

  return helpers;
});