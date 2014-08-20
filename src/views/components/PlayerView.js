import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;

exports = Class(View, function(supr) {
	this.init = function(opts) {
		opts.width = opts.height = 1;
		supr(this, 'init', arguments);

		this.config = null;

		this.designView();
	};

	this.designView = function() {
		this.image = new ImageView({ parent: this, width: 1, height: 1 });
	};

	this.reset = function(config) {
		this.config = config;
		var s = this.style;
		s.x = 0;
		s.y = 0;
		var img = this.image;
		var is = img.style;
		is.width = config.viewWidth;
		is.height = config.viewHeight;
		img.setImage(config.image);
	};

	this.update = function(dt, offsetX, model) {
		var s = this.style;
		s.y = model.y;
	};
});
