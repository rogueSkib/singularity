import src.conf.playerConfig as playerConfig;
import src.conf.platformConfig as platformConfig;
import src.models.PlayerModel as PlayerModel;
import src.models.PlatformModels as PlatformModels;

exports = Class(function() {
	this.init = function(opts) {
		this.player = new PlayerModel();
		this.platforms = new PlatformModels();
	};

	this.reset = function() {
		this.offsetX = 0;
		this.player.reset(this._getPlayerConfig());
		this.platforms.reset(this._getPlatformConfig());
	};

	this.step = function(dt) {
		// update models
		this.offsetX = this.player.step(dt);
		this.platforms.step(dt, this.offsetX);
		// models interact with each other
		this.doVertCollisions(this.player);
		return this.offsetX;
	};

	this.doVertCollisions = function(model) {
		var x = model.x;
		var y = model.y;
		var hitX = model.hitX;
		var hitEndX = model.hitEndX;
		var hitEndY = model.hitEndY;
		var lastY = model.lastY;

		var x1 = x + hitX;
		var x2 = x + hitEndX;
		var y1 = lastY + hitEndY;
		var y2 = y + hitEndY;

		var platforms = this.getPlatformModels();
		for (var i = 0, len = platforms.length; i < len; i++) {
			var plat = platforms[i];
			var platX = plat.x + plat.hitX;
			var platY = plat.y + plat.hitY;
			var platEndX = platX + plat.hitWidth;
			if (y1 <= platY && y2 >= platY && x2 >= platX && x1 <= platEndX) {
				model.y = platY - hitEndY;
				model.vy = 0;
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
