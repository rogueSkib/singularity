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
		health: 100,
		healthRegen: 0,
		energy: 100,
		energyRegen: 0.004,
		image: "resources/images/game/players/rogue/rogue.png",
		actions: [
			{
				id: 'jump1',
				type: 'jump',
				blocks: [
					{ type: 'jump', duration: 250 }
				],
				events: [
					{ vy: -0.18, fy: -0.42 },
					{ fy: 0.42, delay: 80 }
				]
			},
			{
				id: 'jump2',
				type: 'jump',
				blocks: [],
				events: [
					{ vy: 0, ay: 0, force: true },
					{ vy: -0.16, fy: -0.38 },
					{ fy: 0.38, delay: 80 }
				]
			}
		]
	}
};
