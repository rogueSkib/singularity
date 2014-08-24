import src.models.PhysicalModel as PhysicalModel;

exports = Class(PhysicalModel, function(supr) {
	var pow = Math.pow;

	var GRAVITY_ACCEL = G_GRAVITY_ACCEL;

	this.init = function() {
		supr(this, 'init', arguments);

		// config properties
		this.fxRun = 0;
		this.fxDrag = 0;
		this.image = "";
		// everything else
		this.fyGravity = 0;
		this.jumpCount = 0;
	};

	this.reset = function(config) {
		supr(this, 'reset', arguments);

		// apply config
		this.x = config.x;
		this.y = config.y;
		this.w = config.w;
		this.h = config.h;
		this.hx = config.hx;
		this.hy = config.hy;
		this.hw = config.hw;
		this.hh = config.hh;
		this.vx = config.vx;
		this.mass = config.mass;
		this.fxRun = config.fxRun;
		this.fxDrag = config.fxDrag;
		this.image = config.image;
		this.fyGravity = this.mass * GRAVITY_ACCEL;

		// apply gravitational force
		this.fy = this.fyGravity;
	};

	this.step = function(dt) {
		this.fx = this.fxRun - this.fxDrag * pow(this.vx, 2);

		supr(this, 'step', arguments);
	};

	this.jump = function() {
		var action = this.actions['jump' + (this.jumpCount + 1)];
		action && this.applyAction(action);
		this.jumpCount++;
	};
});
