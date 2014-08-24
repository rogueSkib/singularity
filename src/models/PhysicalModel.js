exports = Class(function() {
	this.init = function() {
		this.x = 0;
		this.y = 0;
		this.w = 0;
		this.h = 0;
		this.hx = 0;
		this.hy = 0;
		this.hw = 0;
		this.hh = 0;
		this.lx = 0;
		this.ly = 0;
		this.vx = 0;
		this.vy = 0;
		this.ax = 0;
		this.ay = 0;
		this.fx = 0;
		this.fy = 0;
		this.mass = 0;
		this._fxQueue = [];
		this._txQueue = [];
		this._fyQueue = [];
		this._tyQueue = [];
	};

	this.reset = this.init;

	this.applyForceX = function(fx, tx) {
		if (tx > 0) {
			this._fxQueue.push(fx);
			this._txQueue.push(tx);
		} else {
			this.fx += fx;
		}
	};

	this.applyForceY = function(fy, ty) {
		if (ty > 0) {
			this._fyQueue.push(fy);
			this._tyQueue.push(ty);
		} else {
			this.fy += fy;
		}
	};

	this.step = function(dt) {
		// update last x, y
		this.lx = this.x;
		this.ly = this.y;
		// update forces
		this._stepForceQueues(dt);
		// horizontal physics
		this.x += dt * this.vx / 2;
		this.vx += dt * this.ax / 2;
		this.ax = this.fx / this.mass;
		this.vx += dt * this.ax / 2;
		this.x += dt * this.vx / 2;
		// vertical physics
		this.y += dt * this.vy / 2;
		this.vy += dt * this.ay / 2;
		this.ay = this.fy / this.mass;
		this.vy += dt * this.ay / 2;
		this.y += dt * this.vy / 2;
	};

	this._stepForceQueues = function(dt) {
		var i = 0;
		var j = 0;
		var fxq = this._fxQueue;
		var fyq = this._fyQueue;
		var txq = this._txQueue;
		var tyq = this._tyQueue;
		// step x force and time queues
		while (i < txq.length) {
			txq[i] -= dt;
			if (txq[i] <= 0) {
				this.fx += fxq[i];
				fxq.splice(i, 1);
				txq.splice(i, 1);
			} else {
				i++;
			}
		}
		// step y force and time queues
		while (j < tyq.length) {
			tyq[j] -= dt;
			if (tyq[j] <= 0) {
				this.fy += fyq[j];
				fyq.splice(j, 1);
				tyq.splice(j, 1);
			} else {
				j++;
			}
		}
	};
});
