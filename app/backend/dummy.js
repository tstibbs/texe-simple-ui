export async function getStatus() {
	return {
		mode: 'armed',
		zoneStatuses:
			[
				`zone1: healthy`,
				`zone2: tamper`
			]
	}
}

export async function recentEvents() {
	return [
		`datetime: disarmed, thing by person`,
		`datetime: armed, thing by app`
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
