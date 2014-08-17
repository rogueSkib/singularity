import ui.View as View;
import ui.ImageView as ImageView;

import src.conf.parallaxConfig as parallaxConfig;
import src.views.components.Parallax as Parallax;

exports = Class(View, function(supr) {
	var controller;
	var model;
	var BG_WIDTH = G_BG_WIDTH;
	var BG_HEIGHT = G_BG_HEIGHT;

	this.init = function(opts) {
		supr(this, 'init', arguments);

		controller = G_CONTROLLER;
		model = controller.gameModel;

		this.designView();
	};

	this.designView = function() {
		var s = this.style;
		this.rootView = new View({
			parent: this,
			x: (s.width - BG_WIDTH) / 2,
			y: (s.height - BG_HEIGHT) / 2,
			width: BG_WIDTH,
			height: BG_HEIGHT,
			canHandleEvents: false,
			blockEvents: true
		});

		this.parallax = new Parallax({
			rootView: this.rootView
		});
	};

	this.resetView = function() {
		model.reset();

		var parallaxConfig = this._getParallaxConfig();
		this.parallax.reset(parallaxConfig);
	};

	this._getParallaxConfig = function() {
		return parallaxConfig.base;
	};

	this.constructView = function() {};
	this.deconstructView = function(cb) { cb && cb(); };

	this.tick = function(dt) {
		model.step(dt);

		this.parallax.step(model.offsetX);
	};
});
