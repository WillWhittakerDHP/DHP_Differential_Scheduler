/**
 * Event Types
 * 
 * LEARNING: Type definitions for event-driven architecture
 * WHY: Provides type safety for event shapes, instances, and relationships
 * PATTERN: Follows annotation pattern structure
 */

/**
 * EventShape: Shape-level event type definitions (configuration data, not core entity)
 * LEARNING: Defines what event types can exist (e.g., "OnSite", "Moveable", "ClientPresent")
 * WHY: Shape-level configuration matching annotation_shapes pattern (simple id + name structure)
 * PATTERN: Simple configuration type like AnnotationType - doesn't extend BaseGlobalEntity
 * NOTE: Not a core entity - these are configuration data, not business entities
 * 
 * ARCHITECTURAL CHANGE: Metadata stored as columns in event_shapes table
 * WHY: Shape columns are always metadata - relationships just indicate which shapes are active
 * PATTERN: Metadata (ternaryValue, orderIndex) lives in shape table, not in relationship tables
 */
export interface EventShape {
  id: string
  name: string  // e.g., 'OnSite', 'Moveable', 'ClientPresent'
  defaultTernaryValue?: 'true' | 'false' | 'override' | null  // Default ternary value for this event shape
  defaultOrderIndex?: number  // Default order index for this event shape
}

/**
 * EventInstance: Instance-level event configurations with templates (configuration data, not core entity)
 * LEARNING: Reusable event configurations with calendar event templates
 * WHY: Instance-level configuration with templates for calendar event creation
 * PATTERN: Simple configuration type - doesn't extend BaseGlobalEntity (no orderIndex/active fields)
 * NOTE: Not a core entity - these are configuration data, not business entities
 */
export interface EventInstance {
  id: string
  eventShapeRef: string  // Foreign key to event_shapes.id
  name: string  // Template name
  titleTemplate: string | null  // Template for event title (e.g., "{service} on {propertyType}")
  descriptionTemplate: string | null  // Template for event description (e.g., "{clientName} - {propertyAddress}")
  locationTemplate: string | null  // Template for event location (e.g., "{propertyAddress}")
}

