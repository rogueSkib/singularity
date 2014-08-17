exports = {
	base: [
		{
			name: "background",
			speed: 0.025,
			zIndex: 0,
			pieces: [
				{
					image: "resources/images/game/levels/base/background.png",
					gapMin: 0,
					gapMax: 0
				}
			]
		},
		{
			name: "farground",
			speed: 0.2,
			zIndex: 10,
			pieces: [
				{
					image: "resources/images/game/levels/base/farground_1.png",
					y: 312,
					gapMin: 0,
					gapMax: 0
				},
				{
					image: "resources/images/game/levels/base/farground_2.png",
					y: 312,
					gapMin: 0,
					gapMax: 0
				}
			]
		},
		{
			name: "midground",
			speed: 0.5,
			zIndex: 50,
			pieces: [
				{
					image: "resources/images/game/levels/base/midground_1.png",
					gapMin: 0,
					gapMax: 0
				},
				{
					image: "resources/images/game/levels/base/midground_2.png",
					gapMin: 0,
					gapMax: 0
				}
			]
		}
	]
};
