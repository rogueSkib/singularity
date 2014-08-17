import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import ui.ViewPool as ViewPool;

import src.lib.utils as utils;

exports = Class(function() {
	var random = Math.random;
	var rollInt = utils.rollInt;
	var rollFloat = utils.rollFloat;

	var BG_WIDTH = G_BG_WIDTH;
	var BG_HEIGHT = G_BG_HEIGHT;

	var imgCache = {};
	var layerPool = new ViewPool({
		ctor: View,
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
	};

	this.reset = function(config) {
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
			var data = config[i];
			var layer = layerPool.obtainView({
				parent: this.rootView,
				width: data.width || 1,
				height: data.height || 1,
				zIndex: data.zIndex || 1
			});
			layer.data = data;
			layer.spawnX = 0;
			layer.pieces = [];
			layers.push(layer);
			// automatically process layer image data if we haven't already
			var pieces = data.pieces;
			for (var j = 0, jlen = pieces.length; j < jlen; j++) {
				var piece = pieces[j];
				if (imgCache[piece.image] === void 0) {
					imgData = imgCache[piece.image] = {};
					imgData.image = new Image({ url: piece.image });
					var b = imgData.image.getBounds();
					imgData.y = piece.y || 0;
					imgData.width = piece.width || b.width + (b.marginLeft || 0) + (b.marginRight || 0);
					imgData.height = piece.height || b.height + (b.marginTop || 0) + (b.marginBottom || 0);
				}
			}
		}
		// track offset for spawn timing
		this.lastX = 0;
	};

	this.step = function(x) {
		if (this.lastX !== x) {
			this.lastX = x;
			// update parallax layers
			var layers = this.layers;
			for (var l = 0, llen = layers.length; l < llen; l++) {
				var layer = layers[l];
				var data = layer.data;
				var layerX = layer.style.x = -x * data.speed;
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
		while (layer.spawnX <= -x + BG_WIDTH) {
			var pieceConfig = layer.data.pieces;
			var pData = pieceConfig[~~(random() * pieceConfig.length)];
			var iData = imgCache[pData.image];
			var piece = piecePool.obtainView({
				parent: layer,
				x: layer.spawnX,
				y: iData.y,
				width: iData.width,
				height: iData.height
			});
			piece.setImage(iData.image);
			layer.spawnX += iData.width + rollInt(pData.gapMin, pData.gapMax);
			layer.pieces.push(piece);
		}
	};
});
