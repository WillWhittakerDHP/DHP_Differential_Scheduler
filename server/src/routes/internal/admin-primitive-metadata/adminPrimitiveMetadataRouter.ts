/**
 * Admin Primitive Metadata Router - Main Orchestrator
 * 
 * LEARNING: Admin Primitive Metadata Router (legacy - for backward compatibility)
 * WHY: Unified API for admin primitive metadata (renamed from AdminInputMetadataRouter)
 *      Aligns with entity data pattern: primitives + relationships
 * PATTERN: Single router handles all entity types without special casing
 * NOTE: Supports inheritance - instance entities inherit from shapes
 * NOTE: This is a legacy router maintained for backward compatibility
 */

import { Router } from 'express'
import { AdminPrimitiveMetadataCrudRouter } from './adminPrimitiveMetadataCrudRouter.js'

const router = Router()

// Mount CRUD routes
router.use('/', AdminPrimitiveMetadataCrudRouter)

export default router
