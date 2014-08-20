data {
	touches: [
		{
			start: {x,y},
			end: {x,y},
			distance: {x,y},
			direction: LEFT | RIGHT | UP | DOWN
		},
		{
			...
		}
	],
	prevTouchCount: 2,
	phase: PHASE_START_MOVE | PHASE_MOVE | ...
	originalEvt: evt,
	/* props from touches[0] */
	start: {x,y},
	end: {x,y},
	distance: {x,y},
	direction: LEFT | RIGHT | UP | DOWN
}
