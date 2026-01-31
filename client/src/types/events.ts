/**
 * Event Types
 * 
 * LEARNING: Type definitions for event-driven architecture
 * WHY: Provides type safety for event shapes, instances, and relationships
 * PATTERN: Events are now core entities extending BaseGlobalEntity
 */

import type { EventShapeEntity, EventInstanceEntity } from './entities'

/**
 * EventShape: Shape-level event type definitions (core entity)
 * LEARNING: Defines what event types can exist (e.g., "OnSite", "Moveable", "ClientPresent")
 * WHY: Now a core entity with full entity capabilities
 * PATTERN: Extends BaseGlobalEntity via EventShapeEntity
 */
export type EventShape = EventShapeEntity

/**
 * EventInstance: Instance-level event configurations with templates (core entity)
 * LEARNING: Reusable event configurations with calendar event templates
 * WHY: Now a core entity with full entity capabilities
 * PATTERN: Extends BaseGlobalEntity via EventInstanceEntity
 */
export type EventInstance = EventInstanceEntity

