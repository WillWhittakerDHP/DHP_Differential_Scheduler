/**
 * Admin Metadata Router - Main Orchestrator
 * 
 * LEARNING: Unified Admin Metadata Router
 * WHY: Single API endpoint for all metadata (primitives + relationships)
 *      Follows entity pattern: single endpoint/table, backend routes based on field type
 * PATTERN: Single router handles all metadata types, backend determines metadataType by checking RELATIONSHIP_KEYS
 * NOTE: Backend routes based on fieldKey type (matches entity pattern where backend routes based on field type)
 */

import { Router } from 'express'
import { AdminMetadataCrudRouter } from './adminMetadataCrudRouter.js'

const router = Router()

// Mount CRUD routes
router.use('/', AdminMetadataCrudRouter)

export default router
