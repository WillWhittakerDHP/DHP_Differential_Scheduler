/**
 * Admin Primitive Metadata Router - Main Orchestrator
 * 
 *      Aligns with entity data pattern: primitives + relationships
 * NOTE: Supports inheritance - instance entities inherit from shapes
 */

import { Router } from 'express'
import { AdminPrimitiveMetadataCrudRouter } from './adminPrimitiveMetadataCrudRouter.js'

const router = Router()

router.use('/', AdminPrimitiveMetadataCrudRouter)

export default router
