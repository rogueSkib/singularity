import src.models.PhysicalModel as PhysicalModel;

exports = Class(PhysicalModel, function(supr) {
	var GRAVITY_ACCEL = G_GRAVITY_ACCEL;

	this.init = function() {
		supr(this, 'init', arguments);

		this.type = "";
		this.warn = false;
		this.imgData = null;
		this.active = false;
		this.view = null;
		this._poolIndex = -1;
	};

	this.reset = function(x, y, w, h, imgData, config) {
		supr(this, 'reset', config);

		// apply spawn
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		// apply config
		this.hx = config.hx;
		this.hy = config.hy;
		this.hw = config.hw;
		this.hh = config.hh;
		this.mass = config.mass;
		this.type = config.type;
		this.warn = config.warn;
		this.imgData = imgData;
		this.view = null;

		// apply gravitational force
		this.fyGravity = this.mass * GRAVITY_ACCEL;
		this.fy = this.fyGravity;
	};
});
