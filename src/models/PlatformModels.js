import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;

import src.lib.ModelPool as ModelPool;

var PlatformModel = Class(function() {
	this.init = function() {
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.config = null;
		// pooling info
		this._viewIndex = -1;
		this._poolIndex = -1;
		this.active = false;
	};

	this.reset = function(x, y, width, height, config) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.config = config;
		this._viewIndex = -1;
	};
});

exports = Class(function() {
	var random = Math.random;

	var imgCache = {};

	var platformPool = new ModelPool({
		ctor: PlatformModel
	});

	this.init = function() {
		this.lastX = 0;
		this.spawnX = 0;
	};

	this.reset = function(config) {
		platformPool.releaseAllModels();
		// initialize platforms based on config
		for (var i = 0, ilen = config.length; i < ilen; i++) {
			var conf = config[i];
			// automatically process platform image data
			if (imgCache[conf.image] === void 0) {
				var imgData = imgCache[conf.image] = {};
				var img = imgData.image = new Image({ url: conf.image });
				var b = img.getBounds();
				imgData.y = conf.y || 0;
				imgData.width = conf.width || b.width + (b.marginLeft || 0) + (b.marginRight || 0);
				imgData.height = conf.height || b.height + (b.marginTop || 0) + (b.marginBottom || 0);
			}
		}

		// track y offset for view recycling and spawning
		this.lastOffsetY = 0;
		this.spawnY = 0;
	};

	this.step = function(x) {
		if (this.lastOffsetY !== y) {
			this.lastOffsetY = y;
			this.style.y = -y;

			var random = Math.random;
			var i = 0;
			for (var p = 0, len = this.active.length; p < len; p++) {
				var platform = this.active[i];

				// release views that are more than a screen height above
				if (platform.style.y + platform.style.height <= y - BG_HEIGHT) {
					this.platformPool.releaseView(this.active.shift());
					continue;
				}

				i++;
			}

			// spawn views as they come onto the screen
			var z = 0;
			while (this.spawnY <= y + BG_HEIGHT) {
				var data = this.config[~~(random() * this.config.length)];
				var space = data.spaceBase + ~~(random() * data.spaceRange);
				var x = SPAWN_X + SPAWN_STEP * space;
				x = this.spawnPlatform(x, z++, data);

				// connected platform options
				if (this.connectables.length) {
					if (data.connectLeft !== undefined && x >= BG_WIDTH / 2) {
						var extraData = this.connectables[~~(random() * this.connectables.length)];
						x += data.connectLeft - extraData.width;
						this.spawnPlatform(x, z++, extraData);
					} else if (data.connectRight !== undefined && x + data.width <= BG_WIDTH / 2) {
						var extraData = this.connectables[~~(random() * this.connectables.length)];
						x += data.connectRight;
						this.spawnPlatform(x, z++, extraData);
					}
				}

				this.spawnY += data.height + SPAWN_GAP_BASE + ~~(random() * SPAWN_GAP_RANGE);
			}
		}
	};

	this.spawnPlatform = function(x, z, data) {
		if (x < SPAWN_X) {
			x = SPAWN_X;
		}
		if (x + data.width > SPAWN_X + SPAWN_WIDTH) {
			x = SPAWN_X + SPAWN_WIDTH - data.width;
		}

		var plat = this.platformPool.obtainView({
			parent: this,
			x: x,
			y: this.spawnY,
			zIndex: z,
			width: data.width,
			height: data.height
		});

		plat.hitX = data.hitX;
		plat.hitY = data.hitY;
		plat.hitWidth = data.hitWidth;
		plat.setImage(data.image);
		this.active.push(plat);

		return x;
	};
});
