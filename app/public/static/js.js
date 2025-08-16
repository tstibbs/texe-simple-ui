const pageLoadDelay = new Promise(resolve => {
	setTimeout(resolve, 1000) //wait 1 second before enabling buttons, to prevent accidental click
})

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

async function setUpButtons(mode) {
	const disarmButton = document.getElementById('disarm')
	const partArmButton = document.getElementById('partArm')
	const fullArmButton = document.getElementById('fullArm')
	if (mode == 'partarmed') {
		partArmButton.textContent = 'Part Armed'
		partArmButton.classList.add('selected')
	} else if (mode == 'armed') {
		fullArmButton.textContent = 'Full Armed'
		fullArmButton.classList.add('selected')
	} else if (mode == 'partarming') {
		partArmButton.textContent = 'Part Arming'
		partArmButton.classList.add('selected', 'pending')
	} else if (mode == 'arming') {
		fullArmButton.textContent = 'Arming'
		fullArmButton.classList.add('selected', 'pending')
	} else if (mode == 'disarmed') {
		disarmButton.textContent = 'Disarmed'
		disarmButton.classList.add('selected')
		partArmButton.textContent = 'Part Arm'
		fullArmButton.textContent = 'Full Arm'

		//only enable clicking to arm, not to disarm
		const click = action => async () => {
			document.getElementById('states').classList.add('pending')
			const response = await apiCall('POST', `api/${action}`)
			dumpText(response)
		}

		await pageLoadDelay
		partArmButton.addEventListener('click', click('partArm'))
		fullArmButton.addEventListener('click', click('fullArm'))
	} else {
		dumpText(`Mode not understood: ${mode}`)
	}

	await pageLoadDelay
	document.getElementById('states').classList.remove('pending')
}

async function fetchInfo() {
	const {mode, zoneStatuses, lastUpdated, metadata} = await apiCall('GET', 'api/status')
	document.getElementById('mode').innerHTML = '<span>' + mode + '</span>'
	let statusData = [[`Last Updated`, parseDate(lastUpdated)]].concat(zoneStatuses)
	createTable(document.getElementById('status'), statusData)
	let events = await apiCall('GET', 'api/events')
	events = events.map(([date, text]) => [parseDate(date), text])
	createTable(document.getElementById('events'), events)
	let metadataEntries = metadata.map(entry => [entry])
	createTable(document.getElementById('metadata'), metadataEntries)
	return mode
}

function parseDate(input) {
	try {
		if (Number.isInteger(input) && input > 1704067200 && input < 5000000000) {
			const date = new Date(input * 1000)
			return date.toLocaleString()
		} else {
			return input
		}
	} catch (e) {
		console.error(e)
		return input
	}
}

function createTable(parent, tableData) {
	var table = document.createElement('table')
	var tableBody = document.createElement('tbody')

	tableData.forEach(rowData => {
		var row = document.createElement('tr')

		rowData.forEach(cellData => {
			var cell = document.createElement('td')
			cell.appendChild(document.createTextNode(cellData))
			row.appendChild(cell)
		})

		tableBody.appendChild(row)
	})

	table.appendChild(tableBody)
	parent.appendChild(table)
}

async function init() {
	const mode = await fetchInfo()
	await setUpButtons(mode)
}

init()
