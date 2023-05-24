import express, { Application } from 'express'
import { startDatabase } from './database'
import {
  developerLogic,
  developerInfoLogic,
  projectLogic,
  projectTechnologyLogic,
} from './logic'
import {
  checkIfDeveloperExists,
  checkIfEmailExists,
  checkIfProjectExists,
} from './middlewares'

const app: Application = express()
app.use(express.json())

app.post('/developers', checkIfEmailExists, developerLogic.create)
app.post(
  '/developers/:id/infos',
  checkIfDeveloperExists,
  developerInfoLogic.create
)
app.get('/developers', developerLogic.read)
app.get('/developers/:id', checkIfDeveloperExists, developerLogic.readById)
app.get(
  '/developers/:id/projects',
  checkIfDeveloperExists,
  developerLogic.readByIdWithProject
)
app.patch('/developers/:id', checkIfDeveloperExists, developerLogic.update)
app.patch(
  '/developers/:id/infos',
  checkIfDeveloperExists,
  developerInfoLogic.update
)
app.delete('/developers/:id', checkIfDeveloperExists, developerLogic.remove)

app.post('/projects', projectLogic.create)
app.post(
  '/projects/:id/tecnologies',
  checkIfProjectExists,
  projectTechnologyLogic.create
)
app.get('/projects', projectLogic.read)
app.get('/projects/:id', checkIfProjectExists, projectLogic.readById)
app.patch('/projects/:id', checkIfProjectExists, projectLogic.update)
app.delete('/projects/:id', checkIfProjectExists, projectLogic.remove)
app.delete(
  '/projects/:id/technologies/:name',
  checkIfProjectExists,
  projectTechnologyLogic.remove
)

const PORT: number = 3000
const runningMsg: string = `Server running on http://localhost${PORT}`

app.listen(PORT, async () => {
  await startDatabase()
  console.log(runningMsg)
})
