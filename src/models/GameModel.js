exports = Class(function() {
	this.init = function(opts) {};

	this.reset = function() {
		this.offsetX = 0;
	};

	this.step = function(dt) {
		this.offsetX += dt;
	};
});
