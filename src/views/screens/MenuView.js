import animate;
import ui.View as View;
import ui.ImageView as ImageView;

exports = Class(View, function(supr) {
	var FRAME_WIDTH = 128;
	var FRAME_HEIGHT = 576;
	var ANIM_TIME = 666;

	this.init = function(opts) {
		supr(this, 'init', arguments);
		this.designView();
	};

	// build the component subviews of the screen
	this.designView = function() {
		// center background horizontally, and support widest aspect ratio of 16:9
		var s = this.style;
		this.background = new ImageView({
			parent: this,
			x: (s.width - BG_WIDTH) / 2,
			y: (s.height - BG_HEIGHT) / 2,
			width: BG_WIDTH,
			height: BG_HEIGHT,
			image: "resources/images/menu/background.png"
		});
		// init UI frames off the edges of the screen
		this.leftFrame = new ImageView({
			parent: this,
			x: -FRAME_WIDTH,
			y: 0,
			width: FRAME_WIDTH,
			height: FRAME_HEIGHT,
			image: "resources/images/menu/frame.png"
		});
		// flip the frame image to make a right frame
		this.rightFrame = new ImageView({
			parent: this,
			x: s.width,
			y: 0,
			width: FRAME_WIDTH,
			height: FRAME_HEIGHT,
			image: "resources/images/menu/frame.png",
			flipX: true
		});
	};

	// called by screen transitions to ensure state reset each time the view becomes active
	this.resetView = function() {
		this.leftFrame.style.x = -FRAME_WIDTH;
		this.rightFrame.style.x = this.style.width;
	};

	// called after screen transition, animate the subviews of the screen into place, block input if necessary
	this.constructView = function() {
		animate(this.leftFrame).now({ x: 0 }, ANIM_TIME, animate.easeOut);
		animate(this.rightFrame).now({ x: this.style.width - FRAME_WIDTH }, ANIM_TIME, animate.easeOut);
	};

	// animate the component subviews of the screen out
	this.deconstructView = function(callback) {
		animate(this.leftFrame).now({ x: -FRAME_WIDTH }, ANIM_TIME, animate.easeIn);
		animate(this.rightFrame).now({ x: this.style.width }, ANIM_TIME, animate.easeIn)
		.then(function() {
			callback && callback();
		});
	};

	// dummy function to show how transitions between views can be implemented
	this.onInputStart = function() {
		this.deconstructView(bind(controller, 'transitionToGame'));
	};
});
