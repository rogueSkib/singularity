import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;

import src.lib.utils as utils;
import src.lib.ModelPool as ModelPool;
import src.models.PhysicalModel as PhysicalModel;

var random = Math.random;
var choose = utils.choose;
var rollInt = utils.rollInt;
var rollFloat = utils.rollFloat;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;

var imgCache = {};

var PlatformModel = Class(PhysicalModel, function(supr) {
	this.init = function() {
		supr(this, 'init', arguments);

		this.imgData = null;
		this.active = false;
		this.view = null;
		this._poolIndex = -1;
	};

	this.reset = function(x, y, w, h, hx, hy, hw, hh, imgData) {
		supr(this, 'reset', null);

		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.hx = hx;
		this.hy = hy;
		this.hw = hw;
		this.hh = hh;
		this.imgData = imgData;
		this.view = null;
	};
});

exports = Class(function() {
	var platformPool = new ModelPool({
		ctor: PlatformModel
	});

	this.init = function() {
		this.lastX = 0;
		this.spawnX = 0;
		this.spawnY = 0;
		this.lastSpawnType = '';
		this.lastSpawnData = null;
		this.config = null;
	};

	this.reset = function(config) {
		this.config = config;
		platformPool.releaseAllModels();
		// process new image data
		for (var type in config) {
			var typeData = config[type];
			for (var i = 0, len = typeData.length; i < len; i++) {
				var platConf = typeData[i];
				!imgCache[platConf.image] && this._prepImageData(platConf);
			}
		}
		// track spawn info
		this.lastX = 0;
		this.spawnX = 0;
		this.spawnY = 0;
		this.lastSpawnType = '';
		this.lastSpawnData = null;
	};

	this._prepImageData = function(data) {
		var imgData = imgCache[data.image] = {};
		var img = imgData.image = new Image({ url: data.image });
		var b = img.getBounds();
		imgData.y = data.y || 0;
		imgData.w = data.w || b.width + (b.marginLeft || 0) + (b.marginRight || 0);
		imgData.h = data.h || b.height + (b.marginTop || 0) + (b.marginBottom || 0);
	};

	this.step = function(dt, x) {
		if (this.lastX !== x) {
			this.lastX = x;
			this._spawnPlatforms(x);
			this._releaseOffscreenPlatforms(platformPool._models, x);
		}
	};

	this._releaseOffscreenPlatforms = function(models, x) {
		// release old platforms as they move off-screen
		for (var i = 0, ilen = models.length; i < ilen; i++) {
			var model = models[i];
			if (!model.active) {
				break;
			} else if (model.x + model.w <= x) {
				platformPool.releaseModel(model);
				i--;
			}
		}
	};

	this._spawnPlatforms = function(x) {
		// spawn new platforms as they move on-screen
		while (this.spawnX <= x + BG_WIDTH) {
			var pData = this._getSpawn();
			var iData = imgCache[pData.image];
			var gData = pData.gap;
			var gap = gData ? rollInt(gData.min, gData.max) : 0;
			var model = platformPool.obtainModel();
			var px = this.spawnX + (pData.x || 0);
			var type = this.lastSpawnType;
			var py = type === 'start' || type === 'alone'
				? (pData.y || 0) + random() * (pData.yRange || 0)
				: this.spawnY;
			var pw = iData.w;
			var ph = iData.h;
			var hx = pData.hx || 0;
			var hy = pData.hy || 0;
			var hw = pData.hw || pw;
			var hh = pData.hh || ph;
			model.reset(px, py, pw, ph, hx, hy, hw, hh, iData);
			this.spawnX += pw + gap;
			this.spawnY = py;
		}
	};

	this._getSpawn = function() {
		var type = 'start';
		var lastType = this.lastSpawnType;
		var lastData = this.lastSpawnData;
		if (lastType === 'start' || lastType === 'middle') {
			var spawnEnd = random() < lastData.endChance;
			type = spawnEnd ? 'end' : 'middle';
		} else if (lastType === 'end' || lastType === 'alone') {
			var spawnStart = random() < lastData.startChance;
			type = spawnStart ? 'start' : 'alone';
		}
		this.lastSpawnType = type;
		var data = this.lastSpawnData = choose(this.config[type]);
		return data;
	};

	this.getModels = function() {
		return platformPool._models;
	};
});
