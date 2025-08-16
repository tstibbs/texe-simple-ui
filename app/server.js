import express from 'express'
import nocache from 'nocache'
import {getStatus, recentEvents, partArm, validatedPartArm, validatedFullArm, fullArm} from './backend.js'

const apiRouter = express.Router()
const app = express()

app.use(nocache())

app.use('/static', express.static('./public/static'))
app.use('/api', apiRouter)
app.get('/', (req, res) => {
	res.sendFile(new URL('./public/index.html', import.meta.url).pathname)
})

apiRouter.get('/status', async (req, res) => {
	const response = await getStatus(res)
	res.json(response)
})

apiRouter.get('/events', async (req, res) => {
	const response = await recentEvents(res)
	res.json(response)
})

apiRouter.post('/partArm', async (req, res) => {
	const response = await partArm(res)
	res.json(response)
})

apiRouter.post('/fullArm', async (req, res) => {
	const response = await fullArm(res)
	res.json(response)
})

apiRouter.post('/validated/partArm', async (req, res) => {
	const response = await validatedPartArm(res)
	res.json(response)
})

apiRouter.post('/validated/fullArm', async (req, res) => {
	const response = await validatedFullArm(res)
	res.json(response)
})

app.listen(3000, () => {
	console.log(`Running...`)
})
