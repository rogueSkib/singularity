exports = Class(function() {
	this.init = function() {
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.ax = 0;
		this.ay = 0;
		this.lastX = 0;
		this.lastY = 0;
		this.hitX = 0;
		this.hitY = 0;
		this.hitEndX = 0;
		this.hitEndY = 0;
		this.vyJump = 0;
		this.config = null;
	};

	this.reset = function(config) {
		this.x = 0;
		this.y = 0;
		this.vx = config.vx;
		this.vy = 0;
		this.ax = 0;
		this.ay = config.gravity;
		this.lastX = 0;
		this.lastY = 0;
		this.hitX = config.hitX;
		this.hitY = config.hitY;
		this.hitEndX = config.hitX + config.hitWidth;
		this.hitEndY = config.hitY + config.hitHeight;
		this.vyJump = config.vyJump;
		this.config = config;
	};

	this.step = function(dt) {
		// horizontal movements
		this.lastX = this.x;
		this.x += dt * this.vx / 2;
		this.vx += dt * this.ax;
		this.x += dt * this.vx / 2;
		// vertical movement
		this.lastY = this.y;
		this.y += dt * this.vy / 2;
		this.vy += dt * this.ay;
		this.y += dt * this.vy / 2;

		return this.x;
	};

	this.jump = function() {
		this.vy = this.vyJump;
	};
});
