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
  }
  
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
      return grid
    }
  
  return helpers;
});