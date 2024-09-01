export async function getStatus() {
	return {
		mode: 'armed',
		zoneStatuses: [
			[`zone1`, `healthy`],
			[`zone2`, `tamper`]
		],
		lastUpdated: 1727733458
	}
}

export async function recentEvents() {
	return [
		[1730325458, `disarmed, thing by person`],
		[1733003858, `armed, thing by app`]
	]
}

export async function partArm() {
	console.log('PART ARMED')
	return 'part armed'
}

export async function fullArm() {
	console.log('FULL ARMED')
	return 'full armed'
}
