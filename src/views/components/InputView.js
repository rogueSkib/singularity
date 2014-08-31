import ui.View as View;

exports = Class(View, function(supr) {
	var model;

	var SWIPE_PX_PER_MS = 1;
	var SWIPE_PX_MIN = 50;

	this.init = function(opts) {
		supr(this, 'init', arguments);

		model = opts.model;

		this.startEvt = null;
		this.startPt = null;
	};

	this.onInputStart = function(evt, pt) {
		if (this.startEvt === null) {
			this.startEvt = evt;
			this.startPt = pt;
		}
	};

	this.onInputMove = function(evt, pt) {
		var startEvt = this.startEvt;
		if (startEvt === null || evt.id !== startEvt.id) {
			return;
		}

		var startPt = this.startPt;
		var dx = pt.x - startPt.x;
		var dy = pt.y - startPt.y;
		var elapsed = evt.when - startEvt.when;
		if (elapsed <= 0) {
			return;
		}

		if (dy > SWIPE_PX_MIN && dy / elapsed >= SWIPE_PX_PER_MS) {
			model.player.dive();
			this.finishEvent();
		} else if (dx >= SWIPE_PX_MIN && dx / elapsed >= SWIPE_PX_PER_MS) {
			model.player.rush();
			this.finishEvent();
		}
	};

	this.onInputSelect = function(evt, pt) {
		var startEvt = this.startEvt;
		if (startEvt === null || evt.id !== startEvt.id) {
			return;
		}

		model.player.jump();
		this.finishEvent();
	};

	this.finishEvent = function() {
		this.startEvt = null;
		this.startPt = null;
	};
});
