import * as texe from './backend/texe.js'
import * as dummy from './backend/dummy.js'
const useDummy = process.env.DUMMY_DATA === 'true'

export const {getStatus, recentEvents, partArm, fullArm} = useDummy ? dummy : texe
