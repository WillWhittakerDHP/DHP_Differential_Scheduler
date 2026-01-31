/**
 * Event Base Router
 * 
 * LEARNING: Base router for event endpoints
 * WHY: Provides nested structure matching entities/relationships pattern
 * PATTERN: Base router that nests shape and instance routers
 * 
 * NOTE: Created to restructure endpoints from flat to nested (2026-01-30)
 *       Old: /event-instances, /event-shapes
 *       New: /event/eventInstance, /event/eventShape
 */

import { Router } from 'express'
import { EventShapeRouter } from './eventShape/eventShapeRouter.js'
// NOTE: EventInstance routes are handled by the consolidated router in /events/eventRouter.ts
// This router only handles eventShape routes

const router = Router()

// Nest shape router under /event base path
router.use('/eventShape', EventShapeRouter)
// NOTE: eventInstance routes are handled by /events/:eventType where eventType='eventInstance'

export { router as EventRouter }
