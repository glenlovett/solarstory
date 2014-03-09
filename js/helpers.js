define(function() {
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
  
  return helpers;
});