import ui.View as View;
import ui.ImageView as ImageView;

import src.conf.parallaxConfig as parallaxConfig;
import src.views.components.PlayerView as PlayerView;
import src.views.components.ParallaxViews as ParallaxViews;
import src.views.components.PlatformViews as PlatformViews;

exports = Class(View, function(supr) {
	var controller;
	var model;

	var BG_WIDTH = G_BG_WIDTH;
	var BG_HEIGHT = G_BG_HEIGHT;
	var Z_PLAYER = 110;
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

		this.player = new PlayerView({
			parent: this.rootView,
			zIndex: Z_PLAYER
		});

		this.parallax = new ParallaxViews({
			rootView: this.rootView
		});

		this.platforms = new PlatformViews({
			parent: this.rootView,
			zIndex: Z_PLATFORMS
		});
	};

	this.resetView = function() {
		model.reset();
		this.player.reset(model.player);
		this.parallax.reset(this._getParallaxConfig());
		this.platforms.reset();

		this.gameOver = false;
	};

	this._getParallaxConfig = function() {
		return parallaxConfig.base;
	};

	this.constructView = function() {};
	this.deconstructView = function(cb) { cb && cb(); };

	this.onInputSelect = function() {
		model.player.jump();
	};

	this.onGameOver = function() {
		this.gameOver = true;
		setTimeout(bind(this, 'resetView'), 1000);
	};

	this.tick = function(dt) {
		var offsetX = model.step(dt);
		this.player.update(dt, offsetX, model.player);
		this.parallax.update(dt, offsetX);
		this.platforms.update(dt, offsetX, model.getPlatformModels());
		// game over check
		if (model.gameOver && !this.gameOver) {
			this.onGameOver();
		}
	};
});
