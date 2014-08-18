import src.models.PlatformModels as PlatformModels;

exports = Class(function() {
	this.init = function(opts) {
		this.platforms = new PlatformModels();
	};

	this.reset = function() {
		this.offsetX = 0;

		this.platforms.reset();
	};

	this.step = function(dt) {
		this.offsetX += dt;

		this.platforms.update(this.offsetX);

		return this.offsetX;
	};
});
