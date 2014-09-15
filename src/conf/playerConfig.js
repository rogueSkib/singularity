var GRAVITY_ACCEL = G_GRAVITY_ACCEL;
var PLAYER_MASS = 80;

exports = {
	rogue: {
		x: 0,
		y: 240,
		w: 135,
		h: 146,
		hx: 24,
		hy: 24,
		hw: 75,
		hh: 105,
		vx: 0.67,
		mass: PLAYER_MASS,
		fxRun: 0.0003744,
		dragRun: 0.0000699,
		health: 100,
		healthRegen: 0,
		energy: 100,
		energyRegen: 0.004,
		deJump: -5,
		deDive: -10,
		deRush: -15,
		image: "resources/images/game/players/rogue/rogue.png",
		actions: [
			{
				id: 'jump1',
				type: 'jump',
				blocks: [
					{ type: 'jump', duration: 250 }
				],
				events: [
					{ vy: -0.22, fy: -0.46 },
					{ fy: 0.46, delay: 80 }
				]
			},
			{
				id: 'jump2',
				type: 'jump',
				blocks: [],
				events: [
					{ vy: 0, ay: 0, force: true },
					{ vy: -0.18, fy: -0.42 },
					{ fy: 0.42, delay: 80 }
				]
			},
			{
				id: 'dive',
				type: 'dive',
				blocks: [
					{ type: 'dive', duration: 250 },
					{ type: 'rush', duration: 250 }
				],
				events: [
					{ vy: 0.56, ay: 0, force: true },
					{ fy: 0.64 },
					{ fy: -0.64, delay: 80 }
				]
			},
			{
				id: 'rush',
				type: 'rush',
				blocks: [
					{ type: 'jump', duration: 500 },
					{ type: 'dive', duration: 500 },
					{ type: 'rush', duration: 500 }
				],
				events: [
					{ vy: 0, ay: 0, fy: 0, force: true },
					{ vx: 0.4 },
					{ vx: 0.2, delay: 40 },
					{ vx: 0.2, delay: 80 },
					{ vx: 0.2, delay: 120 },
					{ vx: 0.2, delay: 160 },
					{ vx: -0.2, delay: 400 },
					{ vx: -0.2, delay: 420 },
					{ vx: -0.2, delay: 440 },
					{ vx: -0.2, delay: 460 },
					{ vx: -0.2, delay: 480 },
					{ vx: -0.2, fy: PLAYER_MASS * GRAVITY_ACCEL, delay: 500 }
				]
			}
		]
	}
};
