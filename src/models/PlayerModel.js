import src.models.PhysicalModel as PhysicalModel;

exports = Class(PhysicalModel, function(supr) {
	var pow = Math.pow;
	var min = Math.min;
	var max = Math.max;

	var GRAVITY_ACCEL = G_GRAVITY_ACCEL;

	this.init = function() {
		supr(this, 'init', arguments);

		this.fxRun = 0;
		this.fxDrag = 0;
		this.health = 0;
		this.healthMax = 0;
		this.healthRegen = 0;
		this.energy = 0;
		this.energyMax = 0;
		this.energyRegen = 0;
		this.image = "";

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
		this.health = config.health;
		this.healthMax = config.health;
		this.healthRegen = config.healthRegen;
		this.energy = config.energy;
		this.energyMax = config.energy;
		this.energyRegen = config.energyRegen;
		this.image = config.image;

		// apply gravitational force
		this.fyGravity = this.mass * GRAVITY_ACCEL;
		this.fy = this.fyGravity;
	};

	this.step = function(dt) {
		this._updateRunPhysics(dt);
		this._updateStatus(dt);

		supr(this, 'step', arguments);
	};

	this._updateRunPhysics = function(dt) {
		this.fx = this.fxRun - this.fxDrag * pow(this.vx, 2);
	};

	this._updateStatus = function(dt) {
		this.health = min(this.healthMax, this.health + dt * this.healthRegen);
		this.energy = min(this.energyMax, this.energy + dt * this.energyRegen);
	};

	this.jump = function() {
		this.applyAction('jump' + (this.jumpCount + 1)) && this.jumpCount++;
	};
});
