import ui.View as View;
import ui.ImageView as ImageView;

exports = Class(View, function(supr) {
	var controller;
	var model;

	this.init = function(opts) {
		supr(this, 'init', arguments);

		controller = G_CONTROLLER;
		model = controller.gameModel;

		this.designView();
	};

	this.designView = function() {
		var s = this.style;
		this.background = new ImageView({
			parent: this,
			x: (s.width - BG_WIDTH) / 2,
			y: (s.height - BG_HEIGHT) / 2,
			width: BG_WIDTH,
			height: BG_HEIGHT,
			image: 'resources/images/game/background.png'
		});
	};

	this.resetView = function() {
		model.reset();
	};

	this.constructView = function() {};
	this.deconstructView = function(cb) { cb && cb(); };
	this.tick = function(dt) {};
});
