import src.conf.playerConfig as playerConfig;
import src.conf.platformConfig as platformConfig;
import src.conf.enemyConfig as enemyConfig;
import src.models.PlayerModel as PlayerModel;
import src.models.PlatformModels as PlatformModels;
import src.models.EnemyModels as EnemyModels;

exports = Class(function() {
	var MODEL_WIDTH = G_BG_WIDTH;
	var MODEL_HEIGHT = G_BG_HEIGHT;

	this.init = function(opts) {
		this.player = new PlayerModel();
		this.platforms = new PlatformModels();
		this.enemies = new EnemyModels();
	};

	this.reset = function() {
		this.player.reset(this._getPlayerConfig());
		this.platforms.reset(this._getPlatformConfig());
		this.enemies.reset(enemyConfig);

		this.gameOver = false;
	};

	this.step = function(dt) {
		var player = this.player;
		// update models
		player.step(dt);
		var offsetX = player.x;
		this.platforms.step(dt, offsetX);
		this.enemies.step(dt, offsetX);
		// models interact with each other
		this.doVertCollisions(player);
		this.doEnemyInteractions(player);
		// game over check
		if (player.y > MODEL_HEIGHT || player.health <= 0) {
			this.gameOver = true;
		}
		return offsetX;
	};

	this.doVertCollisions = function(model) {
		if (model.vy === 0) { return; }

		var x = model.x;
		var y = model.y;
		var hx = model.hx;
		var hy = model.hy;
		var hex = hx + model.hw;
		var hey = hy + model.hh;
		var lastY = model.ly;

		var x1 = x + hx;
		var x2 = x + hex;
		var y1 = lastY + hey;
		var y2 = y + hey;

		var platforms = this.getPlatformModels();
		for (var i = 0, len = platforms.length; i < len; i++) {
			var plat = platforms[i];
			var px = plat.x + plat.hx;
			var py = plat.y + plat.hy;
			var pex = px + plat.hw;
			if (y1 <= py && y2 >= py && x2 >= px && x1 <= pex) {
				model.y = py - hey;
				model.vy = 0;
				model.ay = 0;
				model.jumpCount = 0;
				break;
			}
		}
	};

	this.doEnemyInteractions = function(player) {
		var enemyModels = this.enemies.getAllModels();
		for (var i = 0, ilen = enemyModels.length; i < ilen; i++) {
			var enemyModel = enemyModels[i];
			enemyModel.active && this.doVertCollisions(enemyModel);
		}
		// TODO: horz collisions w player
	};

	this._getPlayerConfig = function() {
		return playerConfig.rogue;
	};

	this._getPlatformConfig = function() {
		return platformConfig.base;
	};

	this.getPlatformModels = function() {
		return this.platforms.getModels();
	};
});
