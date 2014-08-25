import ui.View as View;
import ui.ImageView as ImageView;
import ui.ParticleEngine as ParticleEngine;

import src.lib.utils as utils;

var PI = Math.PI;
var random = Math.random;
var rollInt = utils.rollInt;
var rollFloat = utils.rollFloat;

exports = Class(ImageView, function(supr) {
	var FRAME = "resources/images/game/ui/status_frame.png";
	var HEALTH_BAR = "resources/images/game/ui/status_bar_health.png";
	var ENERGY_BAR = "resources/images/game/ui/status_bar_energy.png";
	var SPARK_HEALTH = "resources/images/game/particles/spark_health.png";
	var SPARK_ENERGY = "resources/images/game/particles/spark_energy.png";
	var FRAME_WIDTH = 256;
	var FRAME_HEIGHT = 128;
	var HEALTH_X = 27;
	var HEALTH_Y = 23;
	var HEALTH_FILL = 203;
	var ENERGY_X = 27;
	var ENERGY_Y = 71;
	var ENERGY_FILL = 183;

	this.init = function(opts) {
		opts.image = FRAME;
		opts.width = FRAME_WIDTH;
		opts.height = FRAME_HEIGHT;
		supr(this, 'init', arguments);

		this.healthPct = 0;
		this.healthTargetPct = 0;
		this.energyPct = 0;
		this.energyTargetPct = 0;

		this.designView();
	};

	this.designView = function() {
		this.healthClipper = new View({
			parent: this,
			width: FRAME_WIDTH,
			height: FRAME_HEIGHT,
			clip: true,
			canHandleEvents: false
		});
		this.healthBar = new ImageView({
			parent: this.healthClipper,
			width: FRAME_WIDTH,
			height: FRAME_HEIGHT,
			image: HEALTH_BAR,
			canHandleEvents: false
		});

		this.energyClipper = new View({
			parent: this,
			width: FRAME_WIDTH,
			height: FRAME_HEIGHT,
			clip: true,
			canHandleEvents: false
		});
		this.energyBar = new ImageView({
			parent: this.energyClipper,
			width: FRAME_WIDTH,
			height: FRAME_HEIGHT,
			image: ENERGY_BAR,
			canHandleEvents: false
		});

		this.pEngine = new ParticleEngine({
			parent: this,
			width: FRAME_WIDTH,
			height: FRAME_HEIGHT,
			initCount: 20
		});
	};

	this.reset = function(model) {
		this.healthPct = 1;
		this.healthTargetPct = 1;
		this.energyPct = 1;
		this.energyTargetPct = 1;
		this.update(0, model);
	};

	this.update = function(dt, model) {
		var hcs = this.healthClipper.style;
		var ecs = this.energyClipper.style;
		var initialHealth = hcs.width;
		var initialEnergy = ecs.width;
		this.healthTargetPct = model.health / model.healthMax;
		this.energyTargetPct = model.energy / model.energyMax;
		this.healthPct = (this.healthTargetPct + 5 * this.healthPct) / 6;
		this.energyPct = (this.energyTargetPct + 5 * this.energyPct) / 6;

		if (this.healthPct) {
			hcs.width = HEALTH_X + this.healthPct * HEALTH_FILL;
		} else {
			hcs.width = 0;
		}

		if (this.energyPct) {
			ecs.width = ENERGY_X + this.energyPct * ENERGY_FILL;
		} else {
			ecs.width = 0;
		}

		var dh = hcs.width - initialHealth;
		if (dh > 0.05) {
			this.emitGainParticle(hcs.width, HEALTH_Y, SPARK_HEALTH);
		} else if (dh < -0.05) {
			this.emitLossParticle(hcs.width, HEALTH_Y, SPARK_HEALTH);
		}

		var de = ecs.width - initialEnergy;
		if (de > 0.1) {
			this.emitGainParticle(ecs.width, ENERGY_Y, SPARK_ENERGY);
		} else if (de < -0.1) {
			this.emitLossParticle(ecs.width, ENERGY_Y, SPARK_ENERGY);
		}

		this.pEngine.runTick(dt);
	};

	this.emitGainParticle = function(x, y, img) {
		var count = rollInt(1, 2);
		var data = this.pEngine.obtainParticleArray(count);
		var size = rollFloat(20, 50);
		var ttl = 666;
		var stop = -1000 / ttl;
		for (var i = 0; i < count; i++) {
			var p = data[i];
			p.x = x - size / 2;
			p.y = y - size / 2 + rollFloat(-10, 10);
			p.r = rollFloat(0, PI);
			p.dr = rollFloat(-PI / 2, PI / 2);
			p.ddr = stop * p.dr;
			p.anchorX = size / 2;
			p.anchorY = size / 2;
			p.width = size;
			p.height = size;
			p.dscale = stop;
			p.dopacity = stop;
			p.image = img;
			p.opacity = 0.25;
			p.ttl = ttl;
			p.delay = rollFloat(0, ttl / 4);
			p.compositeOperation = "lighter";
		}
		this.pEngine.emitParticles(data);
	};

	this.emitLossParticle = function(x, y, img) {
		var count = rollInt(1, 2);
		var data = this.pEngine.obtainParticleArray(count);
		var size = rollFloat(20, 50);
		var ttl = 666;
		var stop = -1000 / ttl;
		for (var i = 0; i < count; i++) {
			var p = data[i];
			var dx = rollFloat(-150, 0);
			var dy = rollFloat(-150, 0);
			p.x = x - size / 2;
			p.dx = dx < -75 ? dx : 0;
			p.ddx = stop * p.dx;
			p.y = y - size / 2 + rollFloat(-10, 10);
			p.dy = dy < -75 ? dy : 0;
			p.ddy = stop * p.dy;
			p.r = rollFloat(0, PI);
			p.dr = rollFloat(-PI / 2, PI / 2);
			p.ddr = stop * p.dr;
			p.anchorX = size / 2;
			p.anchorY = size / 2;
			p.width = size;
			p.height = size;
			p.dscale = stop;
			p.opacity = 0.25;
			p.image = img;
			p.ttl = ttl;
			p.delay = rollFloat(0, ttl / 4);
			p.compositeOperation = "lighter";
		}
		this.pEngine.emitParticles(data);
	};
});
