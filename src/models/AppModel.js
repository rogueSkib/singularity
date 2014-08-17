// AppModel is the centralized, top-level storage model for the app.
// It maintains a data object representing all saved data, minimizing
// localStorage access. The object is written to localStorage via saveData.

exports = Class(function() {
	this.init = function(opts) {
		this._data = {};
		this._key = CONFIG.appID + "_data";

		var storedData = localStorage.getItem(this._key);
		if (storedData !== null) {
			this._data = JSON.parse(storedData);
		} else {
			this.resetData();
		}

		this.saveData();
	};

	this.resetData = function() {
		this._data = {};

		// settings
		this._data["sfxEnabled"] = true;
		this._data["musicEnabled"] = true;
	};

	this.getData = function(key) {
		return this._data[key];
	};

	this.setData = function(key, value) {
		this._data[key] = value;
	};

	this.saveData = function() {
		localStorage.setItem(this._key, JSON.stringify(this._data));
	};
});
