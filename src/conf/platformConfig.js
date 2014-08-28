exports = {
	base: {
		alone: [
			{
				x: 0,
				y: 320,
				hx: 0,
				hy: 82,
				yRange: 125,
				startChance: 0.8,
				gap: { min: 150, max: 450 },
				images: [
					"resources/images/game/levels/base/road_alone_1.png"
				]
			}
		],
		start: [
			{
				x: 0,
				y: 320,
				hx: 0,
				hy: 82,
				yRange: 125,
				endChance: 0.2,
				images: [
					"resources/images/game/levels/base/road_start_1.png",
					"resources/images/game/levels/base/plat_start_1.png"
				]
			}
		],
		middle: [
			{
				x: 0,
				y: 320,
				hx: 0,
				hy: 82,
				yRange: 125,
				endChance: 0.4,
				images: [
					"resources/images/game/levels/base/road_mid_1.png",
					"resources/images/game/levels/base/plat_mid_1.png",
					"resources/images/game/levels/base/plat_mid_2.png",
					"resources/images/game/levels/base/plat_mid_3.png"
				]
			}
		],
		end: [
			{
				x: 0,
				y: 320,
				hx: 0,
				hy: 82,
				yRange: 125,
				startChance: 0.6,
				gap: { min: 150, max: 450 },
				images: [
					"resources/images/game/levels/base/road_end_1.png",
					"resources/images/game/levels/base/plat_end_1.png"
				]
			}
		]
	}
};
