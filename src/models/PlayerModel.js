import src.models.PhysicalModel as PhysicalModel;

exports = Class(PhysicalModel, function(supr) {
	var pow = Math.pow;

	var GRAVITY_ACCEL = G_GRAVITY_ACCEL;

	this.init = function() {
		supr(this, 'init', arguments);

		this.fxRun = 0;
		this.fxDrag = 0;
		this.fyJump = 0;
		this.fyJumpDuration = 0;
		this.fyJump2 = 0;
		this.fyJump2Duration = 0;
		this.fyGravity = 0;
		this.jumpCount = 0;
		this.image = "";
	};

	this.reset = function(config) {
		supr(this, 'reset', arguments);

		// apply config
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
		this.fyJump = config.fyJump;
		this.fyJumpDuration = config.fyJumpDuration;
		this.fyJump2 = config.fyJump2;
		this.fyJump2Duration = config.fyJump2Duration;
		this.fyGravity = this.mass * GRAVITY_ACCEL;
		this.image = config.image;

		// apply gravitational force
		this.applyForceY(this.fyGravity, 0);
	};

	this.step = function(dt) {
		this.fx = this.fxRun - this.fxDrag * pow(this.vx, 2);

		supr(this, 'step', arguments);
	};

	this.jump = function() {
		if (this.jumpCount === 0) {
			this.applyForceY(this.fyJump, 0);
			this.applyForceY(-this.fyJump, this.fyJumpDuration);
		} else if (this.jumpCount === 1) {
			this.applyForceY(this.fyJump2, 0);
			this.applyForceY(-this.fyJump2, this.fyJump2Duration);
		}
		this.jumpCount++;
	};
});
