import * as texe from './backend/texe.js'
import * as dummy from './backend/dummy.js'
const useDummy = process.env.DUMMY_DATA === 'true'

export const {getStatus, recentEvents, partArm, fullArm} = useDummy ? dummy : texe

async function validateWrapper(response, delegate) {
	const {mode} = await getStatus(response)
	if (mode != 'disarmed') {
		response.status(409).send(`mode was '${mode}'`)
	} else {
		await delegate(response)
	}
}

export async function validatedPartArm(response) {
	await validateWrapper(response, partArm)
}

export async function validatedFullArm(response) {
	await validateWrapper(response, fullArm)
}
