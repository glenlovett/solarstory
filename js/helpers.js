define([
  "globals"
], function(globals) {
  "use strict";
  var helpers = {};

  helpers.extend = function(child, parent) {
    function Temp() {}
    Temp.prototype = parent.prototype;

    child.prototype = new Temp();
    child.prototype.constructor = child;
    child.super = parent.prototype;
    child.parentConstructor = parent;
  };
  
  helpers.toPixels = function(x) {
    return x * globals.TILE_SIZE;
  };

  helpers.toTile = function(x) {
    return x / globals.TILE_SIZE;
  };
  
  helpers.generateGridAndIndices = function(layer) {
      var grid = [];
      var rowIndex = 0;
      var columnIndex = 0;
      layer.layer.data.forEach(function(row) {
        grid.push([]);
        row.forEach(function(tileOrNull) {
          if (tileOrNull === null) {
            grid[rowIndex][columnIndex] = 0;
          } else {
            grid[rowIndex][columnIndex] = 1;
          }
          columnIndex = columnIndex + 1;
        });
        columnIndex = 0;
        rowIndex = rowIndex + 1;
      });
      return grid;
    };

  helpers.drawPath = function(g, path) {
    g.lineStyle(2, 0xE68A00, 0.9);
    g.x = helpers.toPixels(path[0].x) + globals.TILE_SIZE / 2;
    g.y = helpers.toPixels(path[0].y) + globals.TILE_SIZE / 2;
    path.forEach(function(point) {
      g.lineTo(
        helpers.toPixels(point.x) + globals.TILE_SIZE / 2,
        helpers.toPixels(point.y) + globals.TILE_SIZE / 2);
    });
    g.x = 0;
    g.y = 0;
  };
  
  return helpers;
});