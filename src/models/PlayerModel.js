import src.models.PhysicalModel as PhysicalModel;

exports = Class(PhysicalModel, function(supr) {
	var pow = Math.pow;
	var min = Math.min;

	var GRAVITY_ACCEL = G_GRAVITY_ACCEL;

	this.init = function() {
		supr(this, 'init', arguments);

		this.fxRun = 0;
		this.dragRun = 0;
		this.health = 0;
		this.healthMax = 0;
		this.healthRegen = 0;
		this.energy = 0;
		this.energyMax = 0;
		this.energyRegen = 0;
		this.deJump = 0;
		this.deDive = 0;
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
		this.dragRun = config.dragRun;
		this.health = config.health;
		this.healthMax = config.health;
		this.healthRegen = config.healthRegen;
		this.energy = config.energy;
		this.energyMax = config.energy;
		this.energyRegen = config.energyRegen;
		this.deJump = config.deJump;
		this.deDive = config.deDive;
		this.deRush = config.deRush;
		this.image = config.image;

		// apply gravitational force
		this.fyGravity = this.mass * GRAVITY_ACCEL;
		this.fy = this.fyGravity;
	};

	this.step = function(dt) {
		this._updateStatus(dt);

		// run force varies each tick, so remove it before next tick
		var fxRun = this.fxRun - this.dragRun * pow(this.vx, 2);
		this.fx += fxRun;
		supr(this, 'step', arguments);
		this.fx -= fxRun;
	};

	this._updateStatus = function(dt) {
		this.health = min(this.healthMax, this.health + dt * this.healthRegen);
		this.energy = min(this.energyMax, this.energy + dt * this.energyRegen);
	};

	this.jump = function() {
		if (this.energy + this.deJump >= 0) {
			if (this.applyAction('jump' + (this.jumpCount + 1))) {
				this.energy += this.deJump;
				this.jumpCount++;
			}
		}
	};

	this.dive = function() {
		if (this.energy + this.deDive >= 0) {
			if (this.applyAction('dive')) {
				this.energy += this.deDive;
			}
		}
	};

	this.rush = function() {
		if (this.energy + this.deRush >= 0) {
			if (this.applyAction('rush')) {
				this.energy += this.deRush;
			}
		}
	};
});
