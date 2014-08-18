import src.conf.platformConfig as platformConfig;
import src.models.PlatformModels as PlatformModels;

exports = Class(function() {
	this.init = function(opts) {
		this.platforms = new PlatformModels();
	};

	this.reset = function() {
		this.offsetX = 0;
		this.platforms.reset(this._getPlatformConfig());
	};

	this._getPlatformConfig = function() {
		return platformConfig.base;
	};

	this.step = function(dt) {
		this.offsetX += dt;
		this.platforms.step(dt, this.offsetX);
		return this.offsetX;
	};

	this.getPlatformModels = function() {
		return this.platforms.getModels();
	};
});
