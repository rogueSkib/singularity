exports = {
	rogue: {
		x: 0,
		y: 316,
		w: 164,
		h: 164,
		hx: 32,
		hy: 32,
		hw: 100,
		hh: 116,
		vx: 0.67,
		mass: 80,
		fxRun: 0.0003744,
		fxDrag: 0.0000699,
		image: "resources/images/game/players/rogue/rogue.png",
		reloadEvents: true,
		events: {
			'jump1': {
				events: [
					{ vy: -0.18, fy: -0.52, delay: 0 },
					{ fy: 0.52, delay: 80 }
				]
			},
			'jump2': {
				events: [
					{ vy: -0.24, fy: -0.26, delay: 0 },
					{ fy: 0.26, delay: 80 }
				]
			}
		}
	}
};
