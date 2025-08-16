export async function getStatus() {
	return {
		mode: 'armed',
		zoneStatuses: [
			[`zone1`, `healthy`],
			[`zone2`, `tamper`]
		],
		lastUpdated: 1727733458,
		metadata: [
			'Status request not recent enough: 2025-01-02T03:04:05.678Z < 2025-01-02T03:04:05.678Z - 5000',
			'Status request not recent enough: 2025-01-02T03:04:05.678Z < 2025-01-02T03:04:05.678Z - 5000',
			'Status request recent enough: 2025-01-02T03:04:05.678Z >= 2025-01-02T03:04:05.678Z - 5000'
		]
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
