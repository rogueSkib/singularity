import ui.View as View;
import ui.ImageView as ImageView;

import src.conf.parallaxConfig as parallaxConfig;
import src.views.components.Parallax as Parallax;
import src.views.components.PlatformViews as PlatformViews;

exports = Class(View, function(supr) {
	var controller;
	var model;

	var BG_WIDTH = G_BG_WIDTH;
	var BG_HEIGHT = G_BG_HEIGHT;
	var Z_PLATFORMS = 100;

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

		this.platforms = new PlatformViews({
			parent: this.rootView,
			zIndex: Z_PLATFORMS,
			width: 1,
			height: 1,
			canHandleEvents: false,
			blockEvents: true
		});
	};

	this.resetView = function() {
		model.reset();
		this.parallax.reset(this._getParallaxConfig());
		this.platforms.reset();
	};

	this._getParallaxConfig = function() {
		return parallaxConfig.base;
	};

	this.constructView = function() {};
	this.deconstructView = function(cb) { cb && cb(); };

	this.tick = function(dt) {
		var offsetX = model.step(dt);
		this.parallax.update(dt, offsetX);
		this.platforms.update(dt, offsetX, model.getPlatformModels());
	};
});
