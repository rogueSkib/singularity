import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;

import src.lib.utils as utils;
import src.lib.ModelPool as ModelPool;
import src.models.BasicEnemyModel as BasicEnemyModel;

var random = Math.random;
var choose = utils.choose;
var rollInt = utils.rollInt;
var rollFloat = utils.rollFloat;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;

var imgCache = {};

exports = Class(function() {
	var basicPool = new ModelPool({
		ctor: BasicEnemyModel
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
		basicPool.releaseAllModels();
		// process new image data
		for (var type in config) {
			var typeData = config[type];
			var image = typeData.image;
			!imgCache[image] && this._prepImageData(typeData, image);
		}
		// track spawn info
		this.lastX = 0;
		this.spawnX = 0;
		this.spawnY = 0;
		this.lastSpawnType = '';
		this.lastSpawnData = null;
	};

	this._prepImageData = function(data, image) {
		var imgData = imgCache[image] = {};
		var img = imgData.image = new Image({ url: image });
		var b = img.getBounds();
		imgData.w = data.w || b.width + (b.marginLeft || 0) + (b.marginRight || 0);
		imgData.h = data.h || b.height + (b.marginTop || 0) + (b.marginBottom || 0);
	};

	this.step = function(dt, x) {
		if (this.lastX !== x) {
			this.lastX = x;
			this._spawnEnemies(x);
			this._releaseOffscreenEnemies(x);
		}
	};

	this._releaseOffscreenEnemies = function(x) {
		// release enemies as they move off-screen
		var models = this.getBasicModels();
		for (var i = 0, ilen = models.length; i < ilen; i++) {
			var model = models[i];
			if (!model.active) {
				break;
			} else if (model.x + model.w <= x) {
				basicPool.releaseModel(model);
				i--;
			}
		}
	};

	this._spawnEnemies = function(x) {
		// spawn new enemies
		while (this.spawnX <= x + BG_WIDTH) {
			var eData = this._getSpawn();
			var iData = imgCache[pData.image];
			var gData = eData.gap;
			var gap = rollInt(gData.min, gData.max);
			var model = platformPool.obtainModel();
			var yData = eData.y;
			var ex = this.spawnX;
			var ey = this.spawnY + (yData ? rollFloat(yData.min, yData.max) : 0);
			var ew = iData.w;
			var eh = iData.h;
			model.reset(ex, ey, ew, eh, iData, eData);
			this.spawnX += ew + gap;
		}
	};

	this._getSpawn = function() {
		var type = 'basic';
		var lastType = this.lastSpawnType;
		var lastData = this.lastSpawnData;
		// TODO: spawn logic, just drop basic enemies for now
		this.lastSpawnType = type;
		var data = this.lastSpawnData = this.config[type];
		return data;
	};

	this.getBasicModels = function() {
		return basicPool._models;
	};

	this.getAllModels = function() {
		var all = [];
		all.concat(basicPool._models);
		return all;
	};
});
