import animate;
import device;
import AudioManager;
import ui.resource.loader as loader;

import src.models.AppModel as AppModel;
import src.views.screens.MenuView as MenuView;
import src.views.screens.GameView as GameView;
import src.conf.soundConfig as soundConfig;

var Controller = Class(function() {
	var ANIM_TIME = 500;
	var screenUID = 0;

	this.init = function(opts) {
		this.rootView = null;
		this.screenViews = {};

		if (BG_WIDTH > BG_HEIGHT) {
			// landscape screen normalization
			this.baseWidth = device.screen.width * (BG_HEIGHT / device.screen.height);
			this.baseHeight = BG_HEIGHT;
			this.scale = device.screen.height / BG_HEIGHT;
		} else {
			// portrait screen normalization
			this.baseWidth = BG_WIDTH;
			this.baseHeight = device.screen.height * (BG_WIDTH / device.screen.width);
			this.scale = device.screen.width / BG_WIDTH;
		}

		this.appModel = new AppModel();
		this.initAudio();
	};

	this.setRootView = function(rootView) {
		this.rootView = rootView;
	};

	this.transitionToScreen = function(name, ctor, preloads) {
		this.blockInput();

		var oldView = this.activeView;
		var nextView = this.screenViews[name];

		if (oldView) {
			var boundTransition = bind(this, function() {
				if (nextView) {
					this.activeView = nextView;
					this.activeView.style.visible = true;
				} else {
					this.screenViews[name] = this.activeView = new ctor({
						parent: this.rootView,
						x: 0,
						y: 0,
						width: this.baseWidth,
						height: this.baseHeight,
						scale: this.scale
					});
					this.activeView.screenUID = screenUID++;
				}

				this.activeView.resetView();

				if (oldView.screenUID > this.activeView.screenUID) {
					animate(oldView).now({ opacity: 0 }, ANIM_TIME, animate.linear)
					.then(bind(this, function() {
						oldView.style.visible = false;
						oldView.style.opacity = 1;
						this.unblockInput();
						this.activeView.constructView();
					}));
				} else {
					this.activeView.style.opacity = 0;
					animate(this.activeView).now({ opacity: 1 }, ANIM_TIME, animate.linear)
					.then(bind(this, function() {
						oldView.style.visible = false;
						this.unblockInput();
						this.activeView.constructView();
					}));
				}
			});
		} else {
			var boundTransition = bind(this, function() {
				this.screenViews[name] = this.activeView = new ctor({
					parent: this.rootView,
					x: 0,
					y: 0,
					width: this.baseWidth,
					height: this.baseHeight,
					scale: this.scale
				});
				this.activeView.screenUID = screenUID++;

				this.activeView.resetView();
				this.unblockInput();
				this.activeView.constructView();
			});
		}

		// preload what we need, and then transition
		if (preloads) {
			loader.preload(preloads, boundTransition);
		} else {
			boundTransition();
		}
	};

	this.transitionToMenu = function() {
		this.transitionToScreen("MenuView", MenuView);
	};

	this.transitionToGame = function() {
		this.transitionToScreen("GameView", GameView);
	};

	this.blockInput = function() {
		this.rootView.getInput().blockEvents = true;
	};

	this.unblockInput = function() {
		this.rootView.getInput().blockEvents = false;
	};

	this.isInputBlocked = function() {
		return this.rootView.getInput().blockEvents;
	};

	this.getData = function(key) {
		return this.appModel.getData(key);
	};

	this.setData = function(key, value) {
		this.appModel.setData(key, value);
	};

	this.saveData = function() {
		this.gameModel.save();
		this.appModel.saveData();
	};

	this.initAudio = function() {
		this.playingSong = "";
		this.music = new AudioManager({
			path: "resources/sounds/music",
			files: soundConfig.music
		});
		this.sfx = new AudioManager({
			path: "resources/sounds/sfx",
			files: soundConfig.sfx
		});
	};

	this.playSound = function(name) {
		if (this.getData("sfxEnabled")) {
			this.sfx.play(name);
		}
	};

	this.playSong = function(name) {
		if (this.getData("musicEnabled")) {
			this.playingSong = name;
			this.music.playBackgroundMusic(name);
		}
	};

	this.resumeSong = function() {
		if (this.playingSong) {
			this.playSong(this.playingSong);
		}
	};

	this.pauseSong = function() {
		this.music.pauseBackgroundMusic();
	};
});

// export singleton
exports = new Controller();
