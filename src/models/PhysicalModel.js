// PhysicalEvents are applied to PhysicalModels as deltas
var PhysicalEvent = Class(function() {
	this.init = function() {
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
	};

	this.load = function(values) {
		for (var v in values) {
			this[v] = values[v];
		}
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
		this.events = {};
		this._eventsLoaded = false;
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

		if (!config || !config.events) {
			this.events = {};
		} else if (!this._eventsLoaded || config.reloadEvents) {
			this._parseConfigEvents(config.events);
		}

		this._evtQueue = [];
	};

	this._parseConfigEvents = function(evtData) {
		// reset and load new events from config
		var events = this.events = {};
		for (var id in evtData) {
			var data = evtData[id];
			var evtList = events[id] = [];
			var evtListConf = data.events;
			// each event is actually an array of timed events
			for (var i = 0, len = evtListConf.length; i < len; i++) {
				var evt = new PhysicalEvent();
				evt.load(evtListConf[i]);
				evtList.push(evt);
			}
		}
		this._eventsLoaded = true;
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

	this.applyEvent = function(evtList) {
		for (var i = 0, len = evtList.length; i < len; i++) {
			var evt = evtList[i];
			if (evt.delay > 0) {
				evt.elapsed = 0;
				this._evtQueue.push(evt);
			} else {
				this._applyEvent(evt);
			}
		}
	};

	this._applyEvent = function(evt) {
		this.x += evt.x;
		this.y += evt.y;
		this.vx += evt.vx;
		this.vy += evt.vy;
		this.ax += evt.ax;
		this.ay += evt.ay;
		this.fx += evt.fx;
		this.fy += evt.fy;
		this.mass += evt.mass;
	};

	this.getEvent = function() {
		return new PhysicalEvent();
	};
});
