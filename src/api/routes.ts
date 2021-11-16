import { Router } from 'express'
import * as MainController from './controllers/main.controller'

const router = Router()

router.get('/fetch-dark-links', MainController.fetchDarkLinks)

export { router }
