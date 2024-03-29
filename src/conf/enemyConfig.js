exports = {
	basic: {
		type: 'basic',
		warn: false,
		hx: 27,
		hy: 11,
		hw: 87,
		hh: 146,
		mass: 50,
		gap: { min: 1000, max: 2000 },
		image: "resources/images/game/enemies/basic/basic.png",
		actions: []
	},
	bullet: {
		type: 'flying',
		warn: true,
		y: { min: -100, max: 100 },
		hx: 5,
		hy: 7,
		hw: 52,
		hh: 56,
		mass: 25,
		gap: { min: 2000, max: 4000 },
		image: "resources/images/game/enemies/bullet/bullet.png",
		actions: []
	}
};
