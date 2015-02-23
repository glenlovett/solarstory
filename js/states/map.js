define([
  "globals",
  "helpers",
  "Enemy",
  "Player",
  "underscore"
], function (globals, helpers, Enemy, Player, _) {
  "use strict";
  return function (game) {
    this.easystar = new EasyStar.js();
    this.moveLayer = undefined;
    this.sceneryLayer = undefined;
    this.highSceneryLayer = undefined;
    this.moveGrid = undefined;

    var self = this;
    var player;
    var enemies = [];

    this.create = function () {
      initMap();
      initPlayer();
      initEnemies();
      this.easystar.setGrid(this.moveGrid);
    };

    this.update = function () {};

    this.getEnemyAt = function (x, y) {
      var returnEnemy;
      enemies.forEach(function (enemy) {
        if (enemy.isAtPos(x, y)) {
          returnEnemy = enemy;
        }
      });
      return returnEnemy;
    };

    this.destroyEnemyAt = function (x, y) {
      var enemy = this.getEnemyAt(x, y);
      var enemyIndex = 0;
      enemy.sprite.destroy();
      enemies.forEach(function (enemy) {
        if (enemy.isAtPos(x, y)) {
          enemies.splice(enemyIndex, 1);
        }
        enemyIndex = enemyIndex + 1;
      });
    };

    this.moveEnemies = function () {
      enemies.forEach(function (enemy) {
        enemy.moveTowards(player.x, player.y);
      });
    };

    function initMap() {
      var map = game.add.tilemap("test-map");
      self.moveLayer = map.createLayer("move");
      self.sceneryLayer = map.createLayer("scenery");
      self.highSceneryLayer = map.createLayer("high-scenery");
      self.moveLayer.inputEnabled = true;
      map.addTilesetImage("grassland");
      self.moveGrid = helpers.generateGridAndIndices(self.moveLayer);
      self.easystar.setGrid(self.moveGrid);
      self.easystar.setAcceptableTiles([1]);
      self.moveLayer.events.onInputUp.add(handleClick);
    }

    function initPlayer() {
      player = new Player(4, 2, {
        speed: 5,
        attack: 1
      }, self, "player", game);
    }

    function initEnemies() {
      var enemy = new Enemy(5, 3, {
        speed: 2,
        maxHp: 2,
        currentHp: 2
      }, self, "enemy-ghost", game);
      var enemy2 = new Enemy(3, 6, {
        speed: 2,
        maxHp: 2,
        currentHp: 2
      }, self, "enemy-ghost", game);
      enemies.push(enemy);
      enemies.push(enemy2);
    }

    function enemyAt(x, y) {
      return _.some(enemies, function (enemy) {
        return enemy.isAtPos(x, y);
      });
    }

    function handleClick() {
      var x = Math.floor(helpers.toTile(game.input.x));
      var y = Math.floor(helpers.toTile(game.input.y));

      if (closeEnemyClicked(x, y)) {
        if (attackConfirmed(x, y)) {
          player.attack(x, y);
        } else {
          player.presentPotentialAttack(x, y);
        }
      } else if (moveGridVisible()) {
        if (moveConfirmed(x, y)) {
          player.move(player.potentialMove.path);
        } else {
          handlePresentMove(x, y);
        }
      } else {
        player.removePotentialAttack();
      }
    }

    function closeEnemyClicked(x, y) {
      return !player.moving && enemyAt(x, y) && player.withinAttackRange(x, y);
    }

    function moveGridVisible() {
      return player.moveGridGraphics && player.moveGridGraphics.visible;
    }

    function attackConfirmed(x, y) {
      return player.potentialAttack && x === player.potentialAttack.x && y === player.potentialAttack.y;
    }

    function moveConfirmed(x, y) {
      return player.potentialMove && x === player.potentialMove.x && y === player.potentialMove.y;
    }

    function handlePresentMove(x, y) {
      // determine if we have a legal move to present
      self.easystar.findPath(player.x, player.y, x, y,
        function (path) {
          if (path !== null && path.length <= player.stats.speed + 1 && path.length > 0) {
            player.presentPotentialMove(path);
          } else {
            player.removePotentialMove();
          }
        });
      self.easystar.calculate();
    }

  };
});