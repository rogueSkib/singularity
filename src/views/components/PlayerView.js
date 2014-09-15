import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;

exports = Class(View, function(supr) {
	this.init = function(opts) {
		opts.width = opts.height = 1;
		supr(this, 'init', arguments);

		this.designView();
	};

	this.designView = function() {
		this.sprite = new SpriteView({
			parent: this,
			width: 1,
			height: 1,
			url: 'resources/images/game/players/rogue/char1',
			defaultAnimation: 'run',
			autoStart: true,
			loop: true,
			frameRate: 24
		})
		// this.image = new ImageView({ parent: this, width: 1, height: 1 });
	};

	this.reset = function(model) {
		var s = this.style;
		s.x = 0;
		s.y = 0;
		var ss = this.sprite.style;
		ss.width = model.w;
		ss.height = model.h;
		// var is = this.image.style;
		// is.width = model.w;
		// is.height = model.h;
		// this.image.setImage(model.image);
	};

	this.update = function(dt, offsetX, model) {
		var s = this.style;
		s.y = model.y;
	};
});
