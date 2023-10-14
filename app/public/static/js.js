async function apiCall(method, url) {
	try {
		const response = await fetch(url, {
			method
		})
		if (response.status !== 200) {
			throw new Error(response.status + ' ' + response.statusText)
		}
		return await response.json()
	} catch (e) {
		console.error(e)
		dumpText(e.message)
	}
}

function dumpText(text) {
	const div = document.createElement('div')
	div.textContent = text
	document.body.appendChild(div)
}

function setUpButtons(mode) {
	const disarmButton = document.getElementById('disarm')
	const partArmButton = document.getElementById('partArm')
	const fullArmButton = document.getElementById('fullArm')
	if (mode == 'disarmed') {
		disarmButton.textContent = 'Disarmed'
		disarmButton.classList.add('selected')
		partArmButton.textContent = 'Part Arm'
		fullArmButton.textContent = 'Full Arm'
	} else if (mode == 'partArmed') {
		partArmButton.textContent = 'Part Armed'
		partArmButton.classList.add('selected')
	} else if (mode == 'armed') {
		fullArmButton.textContent = 'Full Armed'
		fullArmButton.classList.add('selected')
	} else {
		dumpText(`Mode not understood: ${mode}`)
	}

	partArmButton.addEventListener("click", async () => {
        const response = await apiCall('POST', "api/partArm")
		dumpText(response)
 	});
	 fullArmButton.addEventListener("click", async () => {
		const response = await apiCall('POST', "api/fullArm")
		dumpText(response)
	});
	document.getElementById('states').classList.add('show')
}

async function fetchInfo() {
	const {mode, zoneStatuses} = await apiCall('GET', "api/status")
	document.getElementById('mode').innerHTML = '<span>' + mode + '</span>'
	document.getElementById('status').innerHTML = zoneStatuses.join('<br />')
	const events = await apiCall('GET', "api/events")
	document.getElementById('events').innerHTML = events.join('<br />')
	return  mode
}

async function init() {
	const mode = await fetchInfo()
	setUpButtons(mode)
}

init()
