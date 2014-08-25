// PhysicalEvents are applied to PhysicalModels as deltas
var PhysicalEvent = Class(function() {
	this.init = function(opts) {
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.ax = 0;
		this.ay = 0;
		this.fx = 0;
		this.fy = 0;
		this.mass = 0;
		this.delay = 0;
		this.elapsed = 0;
		this.force = false;
		this.forceValues = null;
		this.isLoaded = false;
		this.load(opts);
	};

	this.load = function(values) {
		if (values.force) {
			this.force = true;
			values = merge({}, values);
			delete values.force;
			this.forceValues = values;
		} else {
			for (var v in values) {
				this[v] = values[v];
			}
		}
		this.isLoaded = true;
	};
});

// PhysicalModel serves as a base Class for many game models
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
		this.actions = {};
		this._history = {};
		this._blockers = {};
		this._evtQueue = [];
	};

	this.reset = function(config) {
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
		this.actions = {};
		this._history = {};
		this._blockers = {};
		this._evtQueue = [];

		if (config) {
			this._parseActions(config.actions);
		}
	};

	this._parseActions = function(actionList) {
		var actions = this.actions;
		for (var i = 0, ilen = actionList.length; i < ilen; i++) {
			var action = actionList[i];
			actions[action.id] = action;
			var events = action.events;
			for (var j = 0, jlen = events.length; j < jlen; j++) {
				var evt = events[j];
				if (!evt.isLoaded) {
					events[j] = this.getEvent(evt);
				}
			}
		}
	};

	this.step = function(dt) {
		this.lx = this.x;
		this.ly = this.y;
		this._stepEventQueue(dt);
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

	this._stepEventQueue = function(dt) {
		var i = 0;
		var evtQueue = this._evtQueue;
		while (i < evtQueue.length) {
			var evt = evtQueue[i];
			evt.elapsed += dt;
			if (evt.elapsed >= evt.delay) {
				this._applyEvent(evt);
				evtQueue.splice(i, 1);
			} else {
				i++;
			}
		}
	};

	this.applyAction = function(name) {
		var now = Date.now();
		var action = this.actions[name];
		if (!action || this.isActionBlocked(name, now)) {
			return false;
		}

		var blocks = action.blocks;
		for (var i = 0, ilen = blocks.length; i < ilen; i++) {
			var block = blocks[i];
			var id = block.id;
			var duration = block.duration;
			if (id) {
				this._blockers[id] = duration;
			} else {
				this._blockers[block.type] = duration;
			}
		}

		var events = action.events;
		for (var j = 0, jlen = events.length; j < jlen; j++) {
			this.applyEvent(events[j]);
		}

		this._history[action.id] = now;
		this._history[action.type] = now;
		return true;
	};

	this.isActionBlocked = function(name, time) {
		var last = this._history[name];
		var duration = this._blockers[name];
		return last && duration && time <= last + duration;
	};

	this.applyEvent = function(evt) {
		if (evt.delay > 0) {
			evt.elapsed = 0;
			this._evtQueue.push(evt);
		} else {
			this._applyEvent(evt);
		}
	};

	this._applyEvent = function(evt) {
		if (evt.force) {
			var values = evt.forceValues;
			for (var v in values) {
				this[v] = values[v];
			}
		} else {
			this.x += evt.x;
			this.y += evt.y;
			this.vx += evt.vx;
			this.vy += evt.vy;
			this.ax += evt.ax;
			this.ay += evt.ay;
			this.fx += evt.fx;
			this.fy += evt.fy;
			this.mass += evt.mass;
		}
	};

	this.getEvent = function(opts) {
		return new PhysicalEvent(opts);
	};
});
