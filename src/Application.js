import src.conf.globals;

exports = Class(GC.Application, function(supr) {
	var controller = G_CONTROLLER;

	this._settings = {
		alwaysRepaint: true,
		logsEnabled: true,
		showFPS: false
	};

	this.initUI = function() {
		window.addEventListener('pageshow', bind(this, 'onAppShow'), false);
		window.addEventListener('pagehide', bind(this, 'onAppHide'), false);
		window.addEventListener('onfocus', bind(this, 'onAppFocus'), false);
		window.addEventListener('onblur', bind(this, 'onAppBlur'), false);
	};

	this.launchUI = function() {
		controller.setRootView(this.view);
		controller.transitionToGame();
	};

	this.onAppShow = function() {};
	this.onAppHide = function() {};
	this.onAppFocus = function() {};
	this.onAppBlur = function() {};
});
