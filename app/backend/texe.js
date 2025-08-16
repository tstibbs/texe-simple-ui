import {promisify} from 'node:util'

import {backOff} from 'exponential-backoff'

const sleep = promisify(setTimeout)

import axios from 'axios'
import {
	TEXE_USERNAME, //
	TEXE_PASSWORD, //
	TEXE_USER_CODE, //
	TOKEN, //
	PANEL_ID //
} from '../envs.js'
import {getStoredVal, storeVal} from '../store.js'

const TOKEN_KEY = 'TOKEN_KEY_for_internal_store'
const PANEL_ID_KEY = 'PANEL_ID_KEY_for_internal_store'
const STATUS_GRACE_PERIOD = 5 * 1000 //if the request is from the last 5 seconds, it's good enough - this prevents issues with misaligned clocks

storeVal(TOKEN_KEY, TOKEN)
storeVal(PANEL_ID_KEY, PANEL_ID)

const headers = {
	accept: 'application/json',
	'accept-encoding': 'gzip',
	connection: 'Keep-Alive',
	host: 'cloud.texe.com',
	'user-agent': 'okhttp/4.9.2',
	'content-type': 'application/json'
}

const axiosInstance = axios.create({
	baseURL: 'https://cloud.texe.com/',
	headers
})
axiosInstance.interceptors.response.use(res => {
	if (res.data?.response === 'error') {
		if (res.data?.details?.login_required === true) {
			res.status = 403
		} else {
			res.status = 555 //some kind of error
		}
		const error = new Error(res.data?.message)
		error.response = res
		throw error
	} else {
		return res
	}
})

const extraHeaders = () => ({headers: {token: getStoredVal(TOKEN_KEY)}})

const log = response => console.log(`${response.status} - ${JSON.stringify(response.data)}`)

async function login() {
	console.log('login')
	let response = await axiosInstance.post('token/', {
		username: TEXE_USERNAME,
		password: TEXE_PASSWORD,
		app: 'texecom',
		push_token: null,
		use_sound_channels: true,
		device_token: null,
		device_locale: 'en-US'
	})
	log(response)
	if (response.data.token != null) {
		console.log(`token: ${response.data.token}`)
		storeVal(TOKEN_KEY, response.data.token)
	}

	console.log('list sites')
	response = await axiosInstance.get('api/texecom-app/site/list/', extraHeaders())
	if (response.data[0].panel_id != null) {
		storeVal(PANEL_ID_KEY, response.data[0].panel_id)
	}
	log(response)

	console.log('set code')
	response = await axiosInstance.post(
		'api/texecom-app/site/setcode',
		{
			panel_id: getStoredVal(PANEL_ID_KEY),
			panel_user_code: TEXE_USER_CODE
		},
		extraHeaders()
	)
	log(response)
}

function authWrap(delegate) {
	return async res => {
		try {
			return await delegate()
		} catch (e) {
			console.error(e.stack)
			if (e.response?.status == 401 || e.response?.status == 403) {
				try {
					await login()
					//now try again
					return await delegate()
				} catch (e) {
					console.error(e.stack)
					res.sendStatus(e.response?.status || 418)
				}
			} else {
				res.sendStatus(e.response?.status || 418)
			}
		}
	}
}

async function _getStatus() {
	console.log('status')
	const fetchStatus = async requestTime => {
		let response = await axiosInstance.get(
			`api/texecom-app/site/status?request_mask=1&panel_id=${getStoredVal(PANEL_ID_KEY)}`,
			extraHeaders()
		)
		let lastUpdatedTs = response.data.last_updated * 1000
		if (lastUpdatedTs < requestTime - STATUS_GRACE_PERIOD) {
			let errorMessage = `Status request not recent enough: ${new Date(lastUpdatedTs).toISOString()} < ${new Date(
				requestTime
			).toISOString()}`
			console.error(errorMessage)
			throw new Error(errorMessage)
		} else {
			console.log(
				`Status request recent enough: ${new Date(lastUpdatedTs).toISOString()} < ${new Date(
					requestTime
				).toISOString()}`
			)
		}
		log(response)
		return response.data
	}
	const requestTime = Date.now()
	let data = null
	try {
		data = await fetchStatus(requestTime)
	} catch (e) {
		//retry quickly after the first failed attempt, but then retry slower after that
		await sleep(100)
		data = await backOff(() => fetchStatus(requestTime), {
			startingDelay: 500,
			maxDelay: 3000,
			numOfAttempts: 6
		})
	}

	let {zones, areas, last_updated: lastUpdated} = data
	areas = areas.filter(area => area.name.trim().length > 0)
	let mode = null
	if (areas.length == 0) {
		mode = 'invalid'
	} else if (areas.length == 1) {
		mode = areas[0].state
	} else {
		mode = areas.map(area => `${area.name}=${area.state}`).join(', ')
	}
	const zoneStatuses = zones
		.filter(zone => zone.name.trim().length > 0)
		.map(zone => {
			let {name} = zone
			if (/^Zone \d+$/.test(name)) {
				name = `${name} (${zone.device})`
			}
			return [name, zone.state.join(', ')]
		})
	return {mode, zoneStatuses, lastUpdated}
}

async function _recentEvents() {
	console.log('recentEvents')
	const startTime = Date.now() / 1000 - 24 * 60 * 60 //one day ago
	const response = await axiosInstance.get(
		`api/texecom-app/pushlog/list?start=${startTime}&end=0&panel_id=${getStoredVal(PANEL_ID_KEY)}`,
		extraHeaders()
	)
	log(response)
	let events = null
	try {
		events = response.data
			.map(event => {
				let desc = `${event.event_name}, ${event.description}`
				if (event.user != null && event.user.length > 0) {
					desc = `${desc} by ${event.user}`
				}
				return [event.timestamp, desc]
			})
			.sort((a, b) => b[0] - a[0])
	} catch (e) {
		log(response)
		console.error(e)
	}
	return events
}

async function genericArm(url) {
	const response = await axiosInstance.get(url, extraHeaders())
	log(response)
	return response.data.message || response.data
}

async function _partArm() {
	console.log('partArm')
	return genericArm(
		`api/texecom-app/partarmarea?option=1&area=1&panel_id=${getStoredVal(PANEL_ID_KEY)}`,
		extraHeaders()
	)
}

async function _fullArm() {
	console.log('fullArm')
	return genericArm(`api/texecom-app/arm?areas=1&panel_id=${getStoredVal(PANEL_ID_KEY)}`, extraHeaders())
}

export const getStatus = authWrap(_getStatus)
export const recentEvents = authWrap(_recentEvents)
export const partArm = authWrap(_partArm)
export const fullArm = authWrap(_fullArm)
