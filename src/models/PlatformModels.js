import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;

import src.lib.utils as utils;
import src.lib.ModelPool as ModelPool;

var random = Math.random;
var rollInt = utils.rollInt;
var rollFloat = utils.rollFloat;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;

var imgCache = {};

var PlatformModel = Class(function() {
	this.init = function() {
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.hitX = 0;
		this.hitY = 0;
		this.hitWidth = 0;
		this.hitHeight = 0;
		this.imgData = null;
		this.active = false;
		this.view = null;
		this._poolIndex = -1;
	};

	this.reset = function(x, y, w, h, hX, hY, hW, hH, imgData) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.hitX = hX;
		this.hitY = hY;
		this.hitWidth = hW;
		this.hitHeight = hH;
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
		this.config = null;
	};

	this.reset = function(config) {
		this.config = config;
		platformPool.releaseAllModels();
		// process new image data
		for (var i = 0, ilen = config.length; i < ilen; i++) {
			var platConf = config[i];
			!imgCache[platConf.image] && this._prepImageData(platConf);
		}
		// track offset for spawn timing
		this.lastX = 0;
		this.spawnX = 0;
	};

	this._prepImageData = function(data) {
		var imgData = imgCache[data.image] = {};
		var img = imgData.image = new Image({ url: data.image });
		var b = img.getBounds();
		imgData.y = data.y || 0;
		imgData.width = data.width || b.width + (b.marginLeft || 0) + (b.marginRight || 0);
		imgData.height = data.height || b.height + (b.marginTop || 0) + (b.marginBottom || 0);
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
			} else if (model.x + model.width <= x) {
				platformPool.releaseModel(model);
				i--;
			}
		}
	};

	this._spawnPlatforms = function(x) {
		// spawn new platforms as they move on-screen
		var config = this.config;
		while (this.spawnX <= x + BG_WIDTH) {
			var pData = config[~~(random() * config.length)];
			var iData = imgCache[pData.image];
			var spawnGap = random() < pData.gapChance;
			var gap = spawnGap ? rollInt(pData.gapMin, pData.gapMax) : 0;
			var model = platformPool.obtainModel();
			var pX = this.spawnX + (pData.viewX || 0);
			var pY = pData.viewY || 0;
			var pW = iData.width;
			var pH = iData.height;
			var hX = pData.hitX || 0;
			var hY = pData.hitY || 0;
			var hW = pData.hitWidth || pW;
			var hH = pData.hitHeight || pH;
			model.reset(pX, pY, pW, pH, hX, hY, hW, hH, iData);
			this.spawnX += pW + gap;
		}
	};

	this.getModels = function() {
		return platformPool._models;
	};
});
