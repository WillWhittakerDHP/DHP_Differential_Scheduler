/**
 * WHY: Event Types

LEARNING: Type definitions for event-driven architecture
 */
import type { EventShapeEntity, EventInstanceEntity } from './entities'

/**
 * EventShape: Shape-level event type definitions (core entity)
 */
export type EventShape = EventShapeEntity

/**
 * EventInstance: Instance-level event configurations with templates (core entity)
 */
export type EventInstance = EventInstanceEntity

