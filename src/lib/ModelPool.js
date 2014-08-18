exports = Class(function() {
	this.init = function(opts) {
		this._ctor = opts.ctor;
		this._freshModelIndex = 0;
		this._models = [];
	};

	this.obtainModel = function() {
		var model = null;
		var models = this._models;
		if (this._freshModelIndex < models.length) {
			model = models[this._freshModelIndex];
		} else {
			model = this._createModel();
		}
		model.active = true;
		this._freshModelIndex++;
		return model;
	};

	this.releaseModel = function(model) {
		var models = this._models;
		if (model.active) {
			model.active = false;
			var temp = models[this._freshModelIndex - 1];
			models[this._freshModelIndex - 1] = model;
			models[model._poolIndex] = temp;
			var tempIndex = temp._poolIndex;
			temp._poolIndex = model._poolIndex;
			model._poolIndex = tempIndex;
			this._freshModelIndex--;
		}
	};

	this.releaseAllModels = function () {
		var models = this._models;
		for (var i = 0, len = models.length; i < len; i++) {
			var model = models[i];
			model.active = false;
		}
		this._freshModelIndex = 0;
	};

	this.forEachActiveModel = function(fn, ctx) {
		var models = this._models;
		var f = bind(ctx, fn);
		for (var i = 0, len = this._freshModelIndex; i < len; i++) {
			f(models[i], i);
		}
	};

	this._createModel = function () {
		var models = this._models;
		var model = new this._ctor();
		model._poolIndex = models.length;
		models.push(model);
		return model;
	};
});
