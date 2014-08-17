import ui.View as View;
import ui.ImageView as ImageView;
import ui.ParticleEngine as ParticleEngine;

import src.models.GameModel as GameModel;

exports = Class(View, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', arguments);
		this.designView();
	};

	// build the component subviews of the screen
	this.designView = function() {
		// center background horizontally to support widest aspect ratio of 16:9
		var s = this.style;
		this.background = new ImageView({
			parent: this,
			x: (s.width - BG_WIDTH) / 2,
			y: (s.height - BG_HEIGHT) / 2,
			width: BG_WIDTH,
			height: BG_HEIGHT,
			image: "resources/images/game/background.png"
		});

		// EXAMPLE: ParticleEngine usage - bouncing block
		this.pEngine = new ParticleEngine({
			parent: this,
			x: 0,
			y: 0,
			width: s.width,
			height: s.height
		});

		// set up basic physical properties
		var data = this.pEngine.obtainParticleArray(1);
		var pObj = data[0];
		var size = 60;

		pObj.x = s.width / 2;
		pObj.y = s.height / 2;
		pObj.width = size;
		pObj.height = size;
		pObj.image = "resources/images/menu/background.png"
		pObj.dx = 200;
		pObj.dy = -400;
		pObj.ddy = 1600;
		pObj.ttl = Infinity;

		// EXAMPLE: particle trigger usage - bounding the bouncing block
		// note the particle engine only approximates physics and is not frame-independent
		pObj.triggers.push({
			property: "x",
			smaller: true,
			value: 0,
			action: function(particle) {
				particle.style.x = this.value; // this refers to the trigger here
				particle.pData.dx = -particle.pData.dx;
			}
		});
		pObj.triggers.push({
			property: "x",
			value: s.width - size,
			action: function(particle) {
				particle.style.x = this.value;
				particle.pData.dx = -particle.pData.dx;
			}
		});
		pObj.triggers.push({
			property: "y",
			smaller: true,
			value: 0,
			count: 5, // break through the top after 5 hits
			action: function(particle) {
				particle.style.y = this.value;
				particle.pData.dy = -particle.pData.dy;
			}
		});
		pObj.triggers.push({
			property: "y",
			value: s.height - size,
			action: function(particle) {
				particle.style.y = this.value;
				particle.pData.dy = -particle.pData.dy;
			}
		});

		this.pEngine.emitParticles(data);

		// grab a reference to the bouncy box
		this.bouncyBox = this.pEngine.getActiveParticles()[0];
	};

	// called by screen transitions to ensure state reset each time the view becomes active
	this.resetView = function() {
		this.model = new GameModel();
	};

	// called after screen transition, animate the subviews of the screen into place, block input if necessary
	this.constructView = function() {};

	// transition out; animate the component subviews of the screen out
	this.deconstructView = function(callback) {
		callback && callback();
	};

	// dummy function to show how transitions between views can be implemented
	this.onInputStart = function() {
		this.deconstructView(bind(controller, 'transitionToMenu'));
	};

	this.tick = function(dt) {
		// only update if the screen is visible
		if (this.style.visible) {
			// EXAMPLE: particle effect trail behind the bouncing box
			var bbs = this.bouncyBox.style;
			var bbd = this.bouncyBox.pData;
			var data = this.pEngine.obtainParticleArray(1);
			var pObj = data[0];
			var random = Math.random;
			var size = random() * 10 + 20;
			var ttl = 750;

			pObj.x = bbs.x + bbs.width / 2 + random() * bbs.width - bbs.width / 2;
			pObj.y = bbs.y + bbs.height / 2 + random() * bbs.height - bbs.height / 2;
			pObj.r = random() * 6.28;
			pObj.anchorX = size / 2;
			pObj.anchorY = size / 2;
			pObj.width = size;
			pObj.height = size;
			pObj.image = "resources/images/menu/background.png"
			pObj.dx = bbd.dx / 8;
			pObj.dy = bbd.dy / 8;
			pObj.dr = random() * 40 - 20;
			pObj.ddx = -pObj.dx * 1000 / ttl;
			pObj.ddy = 800;
			pObj.dscale = -1000 / ttl;
			pObj.ttl = ttl;

			this.pEngine.emitParticles(data);

			// step the particle engine
			this.pEngine.runTick(dt);
		}
	};
});
