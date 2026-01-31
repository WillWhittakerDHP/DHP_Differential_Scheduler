/**
 * Annotation Base Router
 * 
 * LEARNING: Base router for annotation endpoints
 * WHY: Provides nested structure matching entities/relationships pattern
 * PATTERN: Base router that nests shape and instance routers
 * 
 * NOTE: Created to restructure endpoints from flat to nested (2026-01-30)
 *       Old: /annotation-instances, /annotation-shapes
 *       New: /annotation/annotationInstance, /annotation/annotationShape
 */

import { Router } from 'express'
import { AnnotationShapeRouter } from './annotationShape/annotationShapeRouter.js'
// NOTE: AnnotationInstance routes are handled by the consolidated router in /annotations/annotationRouter.ts
// This router only handles annotationShape routes

const router = Router()

// Nest shape router under /annotation base path
router.use('/annotationShape', AnnotationShapeRouter)
// NOTE: annotationInstance routes are handled by /annotations/:annotationType where annotationType='annotationInstance'

export { router as AnnotationRouter }
