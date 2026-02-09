/**
 * Admin Relationship Metadata Router - Main Orchestrator
 * 
 * LEARNING: Admin Relationship Metadata Router (legacy - for backward compatibility)
 * WHY: Unified API for admin relationship metadata (parallel to adminInputMetadataRouter)
 * PATTERN: Single router handles all entity types without special casing
 * NOTE: Supports inheritance - instance entities inherit from shapes
 * NOTE: This is a legacy router maintained for backward compatibility
 */

import { Router } from 'express'
import { AdminRelationshipMetadataCrudRouter } from './adminRelationshipMetadataCrudRouter.js'

const router = Router()

// Mount CRUD routes
router.use('/', AdminRelationshipMetadataCrudRouter)

export default router
