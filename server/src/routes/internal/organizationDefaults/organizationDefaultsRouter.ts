import { Router } from 'express'
import { OrganizationDefaultsCrudRouter } from './organizationDefaultsCrudRouter.js'

const router = Router()
router.use('/', OrganizationDefaultsCrudRouter)
export { router as OrganizationDefaultsRouter }
