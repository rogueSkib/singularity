import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import ui.ViewPool as ViewPool;

exports = Class(View, function(supr) {
	var random = Math.random;

	var platformPool = new ViewPool({
		ctor: ImageView,
		initCount: 20
	});

	this.init = function(opts) {
		opts.width = opts.height = 1;
		supr(this, 'init', arguments);
	};

	this.reset = function() {
		platformPool.releaseAllViews();
	};

	this.update = function(dt, x, models) {
		this.style.x = -x;
		for (var i = 0, ilen = models.length; i < ilen; i++) {
			var model = models[i];
			if (model.active && model.view === null) {
				this._attachPlatformView(model);
			} else if (!model.active && model.view !== null) {
				this._removePlatformView(model);
			}
		}
	};

	this._attachPlatformView = function(model) {
		var view = platformPool.obtainView({
			parent: this,
			x: model.x,
			y: model.y,
			width: model.w,
			height: model.h
		});
		view.setImage(model.imgData.image);
		model.view = view;
	};

	this._removePlatformView = function(model) {
		platformPool.releaseView(model.view);
		model.view = null;
	};
});
