import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import ui.ViewPool as ViewPool;

import src.lib.utils as utils;

var random = Math.random;
var rollInt = utils.rollInt;
var rollFloat = utils.rollFloat;

var BG_WIDTH = G_BG_WIDTH;
var BG_HEIGHT = G_BG_HEIGHT;

var imgCache = {};

var ParallaxLayer = Class(View, function(supr) {
	this.init = function() {
		supr(this, 'init', arguments);

		this.config = null;
		this.spawnX = 0;
		this.pieces = [];
	};

	this.reset = function(config) {
		this.config = config;
		this.spawnX = 0;
	};
});

exports = Class(function() {
	var layerPool = new ViewPool({
		ctor: ParallaxLayer,
		initCount: 5
	});
	var piecePool = new ViewPool({
		ctor: ImageView,
		initCount: 50
	});

	this.init = function(opts) {
		this.rootView = opts.rootView;
		this.layers = [];
		this.lastX = 0;
		this.config = null;
	};

	this.reset = function(config) {
		this.config = config;
		// reset parallax layers and pieces
		var layers = this.layers;
		while (layers.length) {
			var layer = layers.pop();
			var pieces = layer.pieces;
			while (pieces.length) {
				var piece = pieces.pop();
				piece.removeFromSuperview();
				piecePool.releaseView(piece);
			}
			layer.removeFromSuperview();
			layerPool.releaseView(layer);
		}
		// initialize parallax layers based on config
		for (var i = 0, ilen = config.length; i < ilen; i++) {
			var layerConf = config[i];
			var layer = layerPool.obtainView({
				parent: this.rootView,
				width: layerConf.w || 1,
				height: layerConf.h || 1,
				zIndex: layerConf.z || 1
			});
			layer.reset(layerConf);
			layers.push(layer);
			// process parallax layer image data
			var pieces = layerConf.pieces;
			for (var j = 0, jlen = pieces.length; j < jlen; j++) {
				var piece = pieces[j];
				!imgCache[piece.image] && this._prepImageData(piece);
			}
		}
		// track offset for spawn timing
		this.lastX = 0;
	};

	this._prepImageData = function(data) {
		var imgData = imgCache[data.image] = {};
		var img = imgData.image = new Image({ url: data.image });
		var b = img.getBounds();
		imgData.y = data.y || 0;
		imgData.w = data.w || b.width + (b.marginLeft || 0) + (b.marginRight || 0);
		imgData.h = data.h || b.height + (b.marginTop || 0) + (b.marginBottom || 0);
	};

	this.update = function(dt, x) {
		if (this.lastX !== x) {
			this.lastX = x;
			// update parallax layers
			var layers = this.layers;
			for (var l = 0, llen = layers.length; l < llen; l++) {
				var layer = layers[l];
				var config = layer.config;
				var layerX = layer.style.x = -x * config.speed;
				this._releaseOffscreenPieces(layer.pieces, layerX);
				this._spawnPieces(layer, layerX);
			}
		}
	};

	this._releaseOffscreenPieces = function(pieces, x) {
		// release old parallax pieces as they move off-screen
		var piece = pieces[0];
		while (piece && piece.style.x + piece.style.width <= -x) {
			pieces.shift();
			piecePool.releaseView(piece);
			piece = pieces[0];
		}
	};

	this._spawnPieces = function(layer, x) {
		// spawn new parallax pieces as they move on-screen
		var pieces = layer.config.pieces;
		while (layer.spawnX <= -x + BG_WIDTH) {
			var pData = pieces[~~(random() * pieces.length)];
			var iData = imgCache[pData.image];
			var gapMin = pData.gapMin || 0;
			var gapMax = pData.gapMax || 0;
			var piece = piecePool.obtainView({
				parent: layer,
				x: layer.spawnX,
				y: iData.y,
				width: iData.w,
				height: iData.h
			});
			piece.setImage(iData.image);
			layer.spawnX += iData.w + rollInt(gapMin, gapMax);
			layer.pieces.push(piece);
		}
	};
});
