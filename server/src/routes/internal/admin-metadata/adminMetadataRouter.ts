
import { Router } from 'express'
import { AdminMetadataCrudRouter } from './adminMetadataCrudRouter.js'

const router = Router()

router.use('/', AdminMetadataCrudRouter)

export default router
