import animate;
import device;
import AudioManager;
import ui.resource.loader as loader;

import src.models.GameModel as GameModel;
import src.views.screens.GameView as GameView;
import src.conf.soundConfig as soundConfig;

var Controller = Class(function() {
	this.init = function(opts) {
		this.rootView = null;
		this.activeView = null;
		this.screenViews = {};
		this.setScreenDimensions(BG_WIDTH > BG_HEIGHT);

		this.gameModel = new GameModel();
		this.initAudio();
	};

	this.setScreenDimensions = function(horz) {
		var ds = device.screen;
		this.baseWidth = horz ? ds.width * (BG_HEIGHT / ds.height) : BG_WIDTH;
		this.baseHeight = horz ? BG_HEIGHT : ds.height * (BG_WIDTH / ds.width);
		this.scale = horz ? ds.height / BG_HEIGHT : ds.width / BG_WIDTH;
	};

	this.setRootView = function(rootView) {
		this.rootView = rootView;
	};

	this.transitionToScreen = function(name, ctor, preloads) {
		this.blockInput();
		var currView = this.activeView;
		this.activeView = this.getScreenView(name, ctor);
		var transition = bind(this, function() {
			this.activeView.resetView();
			if (currView) {
				currView.style.zIndex = 2;
				animate(currView).now({ opacity: 0 }, 500, animate.linear)
				.then(function() { currView.style.visible = false; })
				.then(bind(this, 'finishTransition'));
			} else {
				this.finishTransition();
			}
		});
		(preloads && loader.preload(preloads, transition)) || transition();
	};

	this.finishTransition = function() {
		this.unblockInput();
		this.activeView.constructView();
	};

	this.getScreenView = function(name, ctor) {
		var view = this.screenViews[name];
		if (!view) {
			view = this.screenViews[name] = new ctor({
				parent: this.rootView,
				width: this.baseWidth,
				height: this.baseHeight,
				scale: this.scale
			});
		}
		var vs = view.style;
		vs.zIndex = 1;
		vs.opacity = 1;
		vs.visible = true;
		return view;
	};

	this.transitionToGame = function() {
		this.transitionToScreen('GameView', GameView);
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
		this.playingSong = '';
		this.music = new AudioManager({
			path: soundConfig.musicPath,
			files: soundConfig.music
		});
		this.sfx = new AudioManager({
			path: soundConfig.sfxPath,
			files: soundConfig.sfx
		});
	};

	this.playSound = function(name) {
		if (this.getData('sfxEnabled')) {
			this.sfx.play(name);
		}
	};

	this.playSong = function(name) {
		if (this.getData('musicEnabled')) {
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
