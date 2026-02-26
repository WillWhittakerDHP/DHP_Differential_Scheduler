/**
 * Admin Relationship Metadata Router - Main Orchestrator
 * 
 * NOTE: Supports inheritance - instance entities inherit from shapes
 */

import { Router } from 'express'
import { AdminRelationshipMetadataCrudRouter } from './adminRelationshipMetadataCrudRouter.js'

const router = Router()

router.use('/', AdminRelationshipMetadataCrudRouter)

export default router
