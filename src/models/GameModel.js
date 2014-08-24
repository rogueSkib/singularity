import src.conf.playerConfig as playerConfig;
import src.conf.platformConfig as platformConfig;
import src.models.PlayerModel as PlayerModel;
import src.models.PlatformModels as PlatformModels;

exports = Class(function() {
	var MODEL_WIDTH = G_BG_WIDTH;
	var MODEL_HEIGHT = G_BG_HEIGHT;

	this.init = function(opts) {
		this.player = new PlayerModel();
		this.platforms = new PlatformModels();
	};

	this.reset = function() {
		this.player.reset(this._getPlayerConfig());
		this.platforms.reset(this._getPlatformConfig());

		this.gameOver = false;
	};

	this.step = function(dt) {
		// update models
		this.player.step(dt);
		var offsetX = this.player.x;
		this.platforms.step(dt, offsetX);
		// models interact with each other
		this.doVertCollisions(this.player);
		// game over check
		if (this.player.y > MODEL_HEIGHT) {
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
