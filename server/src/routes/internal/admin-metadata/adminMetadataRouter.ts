/**
 * Admin Metadata Router - Main Orchestrator
 * 
 *      Follows entity pattern: single endpoint/table, backend routes based on field type
 * NOTE: Backend routes based on fieldKey type (matches entity pattern where backend routes based on field type)
 */

import { Router } from 'express'
import { AdminMetadataCrudRouter } from './adminMetadataCrudRouter.js'

const router = Router()

router.use('/', AdminMetadataCrudRouter)

export default router
