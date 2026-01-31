/**
 * Global to Booking Transformer
 * 
 * LEARNING: Transforms GlobalData into booking-optimized format
 * WHY: Provides lightweight data structure for booking views
 * PATTERN: Plain objects with embedded relationships
 */

import type { GlobalData, GlobalRelationship } from './fetchToGlobalTransformer'
import type { GlobalEntity } from '@/types/entities'
import type { BlockInstanceEntity } from '@/types/entities'
import type { BlockShapeType } from '@/constants/blockShapeTypes'
import type { TernaryBoolean } from '@/types/ternary'
import type { EventShape, EventInstance } from '@/types/events'
import type { AnnotationInstance, AnnotationShape } from '@/types/annotations'
import { findRelationshipsByParent, extractChildIds, composePartInstances } from './relationshipTransformers'

/**
 * Booking Part Instance type
 * LEARNING: Lightweight part instance for booking
 * WHY: Plain object optimized for read-only operations
 */
export type BookingPartInstance = {
  id: string
  entityKey: 'partInstance'
  name: string
  active: boolean
  partShape: string // Denormalized: partShape name instead of ID
  baseTime: number
  rateOverBaseTime: number
  baseFee: number
  rateOverBaseFee: number
  orderIndex: number
  zeroOutPart: boolean
}

/**
 * Booking Block Shape type
 * LEARNING: Lightweight block shape for property-based filtering
 * WHY: Enables filtering by block shape properties (e.g., canHaveParts) and type without full entity
 */
export type BookingBlockShape = {
  id: string
  name: string
  type: BlockShapeType // Semantic type identifier for stable filtering
  canHaveParts: boolean
  isStateControl: boolean
  composable: boolean
}

/**
 * Booking Block Instance type
 * LEARNING: Lightweight block instance with embedded part instances
 * WHY: Denormalized structure for fast access without joins
 */
export type BookingBlockInstance = {
  id: string
  entityKey: 'blockInstance'
  name: string
  active: boolean
  baseSqFt: number
  icon: string
  bookingMode: import('@/constants/entities').BookingMode // Controls where instance appears in booking flows
  differential: TernaryBoolean // Whether this service supports differential scheduling (inspector and client have different arrival times). 'override' means differential is disabled.
  orderIndex: number
  blockShape: string // Denormalized: blockShape name instead of ID (kept for backward compatibility)
  blockShapeRef: string // Block shape ID reference for filtering
  activeBlockIds: string[] // Child block IDs for cascading filters
  partInstances: BookingPartInstance[] // Embedded part instances
  allowMultiple: boolean // Whether this block instance can be multiplied by ADU count or number
  requiresUnitNumber: boolean | null // If true, property requires a unit number (nullable by design)
  number?: number | null // Optional quantity multiplier for allowMultiple instances
}

/**
 * Booking Data type
 * LEARNING: Container for booking-optimized data
 * WHY: Single structure with all booking data
 */
export type BookingData = {
  blockInstances: BookingBlockInstance[] // Main booking blocks (standalone, both) - excludes addOn
  lineItemBlocks: BookingBlockInstance[] // Line item blocks (bookingMode: "addOn") - separate for line item selection
  blockShapes: BookingBlockShape[] // Block shapes for property-based filtering
}

/**
 * Booking Transformer Class
 * LEARNING: Transforms GlobalData to booking format
 * WHY: Optimizes data structure for booking display
 * PATTERN: Class-based transformer matching React's structure
 */
export class BookingTransformer {
  private isEntityActive(entity: Record<string, unknown> | null | undefined): boolean {
    if (!entity) return false

    // LEARNING: Some entities omit `active` in older/test fixtures.
    // WHY: We want "active unless explicitly inactive/disabled" semantics across the transformer.
    const disabled = entity.disabled === true
    const active = entity.active !== false
    return !disabled && active
  }

  /**
   * Transform GlobalData to booking-optimized format
   * LEARNING: Creates lightweight plain objects with embedded relationships
   * WHY: Fast read-only access without class overhead
   * PATTERN: Single transformation pass with denormalization
   */


  transformGlobalToBooking(globalData: GlobalData): BookingData {
    const { entities, relationships, annotations, events } = globalData
    const blockShapes = (entities.blockShape || []) as GlobalEntity<'blockShape'>[]
    const blockInstances = (entities.blockInstance || []) as GlobalEntity<'blockInstance'>[]
    const partShapes = (entities.partShape || []) as GlobalEntity<'partShape'>[]
    const partInstances = (entities.partInstance || []) as GlobalEntity<'partInstance'>[]
    const annotationShapes = (annotations?.annotationShape || []) as AnnotationShape[]
    const annotationInstances = (annotations?.annotationInstance || []) as AnnotationInstance[]
    const eventShapes = (events?.eventShape || []) as EventShape[]
    const eventInstances = (events?.eventInstance || []) as EventInstance[]
    const partAssignmentsRelationships = relationships.partAssignments || []
    const eventAssignmentsRelationships = relationships.eventAssignments || []
    const annotationAssignmentsRelationships = relationships.annotationAssignments || []
    const bookingCascadesRelationships = relationships.bookingCascades || []
    const instanceComponentsRelationships = relationships.instanceComponents || []
    
    
    // Create lookup maps for denormalization
    const partInstanceById = new Map(
      partInstances.map(partInstance => [partInstance.id, partInstance])
    )
    const blockShapeById = new Map(
      blockShapes.map(blockShape => [blockShape.id, blockShape])
    )
    const partShapeById = new Map(
      partShapes.map(partShape => [partShape.id, partShape])
    )
    
    // LEARNING: Get set of component IDs (blockInstances that are instanceComponents of other blockInstances)
    // WHY: Components should not appear in booking - they're part of composed entities, not standalone options
    // PATTERN: Extract all child IDs from instanceComponents relationships to create exclusion set
    // LEARNING: Use flatMap and Set constructor instead of forEach with add
    // WHY: Functional approach avoids forEach with Set mutations
    const componentIds = new Set(
      instanceComponentsRelationships
        .filter(rel => rel.relationshipKind === 'instanceComponents')
        .flatMap(rel => rel.children.map(child => child.id))
    )
    
    // Removed hardcoded "User Type" diagnostic logging - now using property-based filtering
    
    /**
     * WHY: // WHY: Need to see all data before filtering to understand what's being filtered out
     */
    // LEARNING: Filter main booking blocks (excludes addOn and component children)
    // WHY: Main booking blocks are standalone or both bookingMode, not addOn-only
    // PATTERN: Filter active, non-component blocks with bookingMode !== 'addOn'
    const bookingBlockInstances = blockInstances
      // LEARNING: Components should not be shown as standalone booking options.
      // WHY: They are only meaningful as parts of composed (composite) services.
      //
      // LEARNING: Add-on only instances should not be shown in main booking lists.
      // WHY: They are only selectable as nested add-on options under a parent instance.
      .filter((blockInstance) => {
        const isActive = this.isEntityActive(blockInstance as unknown as Record<string, unknown>)
        const isComponentChild = componentIds.has(blockInstance.id)
        const bookingMode = (blockInstance as unknown as { bookingMode?: import('@/constants/entities').BookingMode }).bookingMode ?? 'standalone'
        return isActive && !isComponentChild && bookingMode !== 'addOn'
      })
      .map(blockInstance => this.transformBlockInstance(
        blockInstance,
        partAssignmentsRelationships,
        eventAssignmentsRelationships,
        annotationAssignmentsRelationships,
        bookingCascadesRelationships,
        instanceComponentsRelationships,
        partInstanceById,
        blockShapeById,
        partShapeById,
        eventInstances,
        eventShapes,
        annotationInstances,
        annotationShapes
      ))
      .sort((a, b) => {
        const aOrder = typeof a.orderIndex === 'number' ? a.orderIndex : 0
        const bOrder = typeof b.orderIndex === 'number' ? b.orderIndex : 0
        return aOrder - bOrder
      })
    
    // LEARNING: Filter line item blocks (bookingMode: "addOn")
    // WHY: Line items are separate from main booking blocks and displayed as individual line items
    // PATTERN: Filter active, non-component blocks with bookingMode === 'addOn'
    const lineItemBlocks = blockInstances
      .filter((blockInstance) => {
        const isActive = this.isEntityActive(blockInstance as unknown as Record<string, unknown>)
        const isComponentChild = componentIds.has(blockInstance.id)
        const bookingMode = (blockInstance as unknown as { bookingMode?: import('@/constants/entities').BookingMode }).bookingMode ?? 'standalone'
        return isActive && !isComponentChild && bookingMode === 'addOn'
      })
      .map(blockInstance => this.transformBlockInstance(
        blockInstance,
        partAssignmentsRelationships,
        eventAssignmentsRelationships,
        annotationAssignmentsRelationships,
        bookingCascadesRelationships,
        instanceComponentsRelationships,
        partInstanceById,
        blockShapeById,
        partShapeById,
        eventInstances,
        eventShapes,
        annotationInstances,
        annotationShapes
      ))
      .sort((a, b) => {
        const aOrder = typeof a.orderIndex === 'number' ? a.orderIndex : 0
        const bOrder = typeof b.orderIndex === 'number' ? b.orderIndex : 0
        return aOrder - bOrder
      })
    
    // Transform block shapes for property-based filtering
    const bookingBlockShapes: BookingBlockShape[] = blockShapes
      .map(blockShape => ({
        id: blockShape.id,
        name: blockShape.name,
        type: blockShape.type,
        canHaveParts: blockShape.canHaveParts,
        isStateControl: blockShape.isStateControl,
        composable: blockShape.composable,
      }))
      .sort((a, b) => {
        // Sort by name for consistent ordering
        return a.name.localeCompare(b.name)
      })
    
    return {
      blockInstances: bookingBlockInstances,
      lineItemBlocks,
      blockShapes: bookingBlockShapes,
    }
  }
  
  /**
   * Transform a single block instance with embedded part instances
   * LEARNING: Denormalizes blockShape and embeds part instances
   * WHY: Fast access without joins or lookups
   * 
   * LEARNING: For composite instances, merge own parts with component parts
   * WHY: Composites can have their own parts AND parts from components
   * PATTERN: Use Set to deduplicate part instance IDs to prevent double-counting
   */
  private transformBlockInstance(
    blockInstance: GlobalEntity<'blockInstance'>,
    partAssignmentsRelationships: GlobalRelationship[],
    eventAssignmentsRelationships: GlobalRelationship[],
    annotationAssignmentsRelationships: GlobalRelationship[],
    bookingCascadesRelationships: GlobalRelationship[],
    instanceComponentsRelationships: GlobalRelationship[],
    partInstanceById: Map<string, GlobalEntity<'partInstance'>>,
    blockShapeById: Map<string, GlobalEntity<'blockShape'>>,
    partShapeById: Map<string, GlobalEntity<'partShape'>>,
    eventInstances: EventInstance[],
    eventShapes: EventShape[],
    annotationInstances: AnnotationInstance[],
    annotationShapes: AnnotationShape[],
  ): BookingBlockInstance {
    // Get blockInstance's own partAssignments
    const partAssignmentsRels = findRelationshipsByParent(
      blockInstance.id,
      partAssignmentsRelationships
    )
    const partAssignmentsRel = partAssignmentsRels[0] // Get first relationship (should be only one)
    
    // LEARNING: Use Set to deduplicate part instance IDs
    // WHY: Prevents double-counting when composite has own parts AND component parts
    // PATTERN: Start with composite's own parts, then add component parts
    const partInstanceIds = new Set<string>()
    
    // Add composite's own parts (if any)
    // LEARNING: Use filter + forEach on Set instead of forEach with Set.add mutations
    // WHY: Functional approach - filter active parts, then add to Set
    // PATTERN: Filter children to active parts, then add IDs to Set
    if (partAssignmentsRel) {
      const partAssignmentIds = partAssignmentsRel.children
        .filter(child => {
          const partInstance = partInstanceById.get(child.id)
          return this.isEntityActive(partInstance as unknown as Record<string, unknown>)
        })
        .map(child => child.id)
      
      // LEARNING: Add active part IDs to Set using spread operator
      // WHY: Functional approach - spread array into Set constructor instead of forEach
      // FIX: Use for...of instead of forEach for side effects (Set.add)
      // Note: Set.add in forEach is acceptable for building accumulator Sets, but for...of is preferred for side effects
      for (const id of partAssignmentIds) {
        partInstanceIds.add(id)
      }
    }
    
    // LEARNING: For composite instances, also merge parts from components
    // WHY: Composites can have parts from both their own partAssignments and from components
    // PATTERN: Check composite property, get component IDs, then compose their parts
    const blockInstanceTyped = blockInstance as BlockInstanceEntity
    const composite = blockInstanceTyped.composite === true
    
    if (composite) {
      // Get component IDs for this composite
      const componentRels = findRelationshipsByParent(
        blockInstance.id,
        instanceComponentsRelationships
      )
      const componentIds = extractChildIds(componentRels)
      
      if (componentIds.length > 0) {
        // Get parts from components using composePartInstances
        // LEARNING: composePartInstances already uses Set internally, so it deduplicates
        // WHY: Ensures no duplicate part instances from multiple components
        // PATTERN: Merge component parts into the Set
        const componentPartIds = composePartInstances(
          componentIds,
          partAssignmentsRelationships
        )
        
        // Add component parts to the Set (Set automatically deduplicates)
        // LEARNING: Filter active parts, then add to Set
        // WHY: Set.add is a legitimate operation for building Sets - use for...of for side effects
        // PATTERN: for...of with Set.add is acceptable for building accumulator Sets (side effects)
        // FIX: Use for...of instead of forEach for side effects (Set.add)
        const activeComponentPartIds = componentPartIds.filter(partId => {
          const partInstance = partInstanceById.get(partId)
          return this.isEntityActive(partInstance as unknown as Record<string, unknown>)
        })
        for (const id of activeComponentPartIds) {
          partInstanceIds.add(id)
        }
      }
    }
    
    // Transform deduplicated part instance IDs to BookingPartInstance[]
    const partInstances: BookingPartInstance[] = Array.from(partInstanceIds)
      .map((partId) => partInstanceById.get(partId))
      .filter((partInstance: GlobalEntity<'partInstance'> | undefined): partInstance is GlobalEntity<'partInstance'> =>
        partInstance !== undefined && this.isEntityActive(partInstance as unknown as Record<string, unknown>)
      )
      .map((partInstance: GlobalEntity<'partInstance'>) => this.transformPartInstance(
        partInstance,
        partShapeById,
        eventAssignmentsRelationships,
        eventInstances,
        eventShapes
      ))
      .sort((a: BookingPartInstance, b: BookingPartInstance) => {
        const aOrder = typeof a.orderIndex === 'number' ? a.orderIndex : 0
        const bOrder = typeof b.orderIndex === 'number' ? b.orderIndex : 0
        return aOrder - bOrder
      })
    
    // Denormalize blockShape
    const blockInstanceWithShapeRef = blockInstance as GlobalEntity<'blockInstance'> & { blockShapeRef: string }
    const blockShapeRef = blockInstanceWithShapeRef.blockShapeRef
    const blockShapeEntity = blockShapeById.get(blockShapeRef)
    const blockShape = blockShapeEntity?.name || blockShapeRef
    
    // Find bookingCascades relationship
    // LEARNING: Use shared utility for relationship finding and child ID extraction
    // WHY: DRY principle - consistent relationship operations across transformers
    // PATTERN: Use findRelationshipsByParent() and extractChildIds() instead of manual operations
    const bookingCascadesRels = findRelationshipsByParent(
      blockInstance.id,
      bookingCascadesRelationships
    )
    const activeBlockIds = extractChildIds(bookingCascadesRels)
    
    const blockInstanceWithProps = blockInstance as GlobalEntity<'blockInstance'> & {
      baseSqFt?: number
      icon?: string
      bookingMode?: import('@/constants/entities').BookingMode
      differential?: TernaryBoolean | boolean
      number?: number | null
      allowMultiple?: boolean
      requiresUnitNumber?: boolean | null
    }
    
    // LEARNING: Convert boolean to TernaryBoolean for backward compatibility during migration
    // WHY: During migration, some values may still be boolean
    // PATTERN: Convert boolean to TernaryBoolean, default to 'false'
    const convertDifferentialToTernary = (value: TernaryBoolean | boolean | undefined): TernaryBoolean => {
      if (value === true) return 'true'
      if (value === false) return 'false'
      if (value === 'true' || value === 'false' || value === 'override') return value
      return 'false'
    }
    
    return {
      id: blockInstance.id,
      entityKey: 'blockInstance',
      name: blockInstance.name,
      active: this.isEntityActive(blockInstance as unknown as Record<string, unknown>),
      baseSqFt: blockInstanceWithProps.baseSqFt || 0,
      icon: blockInstanceWithProps.icon || '',
      bookingMode: (blockInstanceWithProps.bookingMode ?? 'standalone') as import('@/constants/entities').BookingMode,
      differential: convertDifferentialToTernary(blockInstanceWithProps.differential),
      orderIndex: blockInstance.orderIndex,
      blockShape, // Keep for backward compatibility
      blockShapeRef, // Add block shape ID reference for filtering
      activeBlockIds,
      partInstances,
      allowMultiple: blockInstanceWithProps.allowMultiple ?? false,
      requiresUnitNumber: typeof blockInstanceWithProps.requiresUnitNumber === 'boolean' ? blockInstanceWithProps.requiresUnitNumber : null,
    }
  }
  
  /**
   * Transform a single part instance
   * LEARNING: Denormalizes partShape to name and computes booleans from activeEvents relationships
   * WHY: Simple string property instead of nested object, events configured at shape level
   * 
   * ARCHITECTURAL CHANGE: Reads metadata from event_shapes table columns, not from relationships
   * WHY: Shape columns are always metadata - relationships just indicate which shapes are active
   * PATTERN: Use GlobalRelationship[] to determine which event shapes are active, read metadata from eventShape columns
   * 
   * Session Event Refactor: Computes onSite/clientPresent/moveable from eventAssignments relationships
   * WHY: Events are configured at shape level, all instances of a shape inherit same configuration
   * PATTERN: Look up eventAssignments by part shape, read metadata from eventShape.defaultTernaryValue column
   */
  private transformPartInstance(
    partInstance: GlobalEntity<'partInstance'>,
    partShapeById: Map<string, GlobalEntity<'partShape'>>,
    eventAssignmentsRelationships: GlobalRelationship[],
    eventInstances: EventInstance[],
    eventShapes: EventShape[]
  ): BookingPartInstance {
    // Denormalize partShape
    const partInstanceTyped = partInstance as GlobalEntity<'partInstance'> & { partShapeRef: string }
    const partShapeRef = partInstanceTyped.partShapeRef
    const partShapeEntity = partShapeById.get(partShapeRef)
    const partShape = partShapeEntity?.name || partShapeRef
    
    // Get eventAssignments relationships for this part's shape (not instance)
    // LEARNING: Events are configured at shape level, all instances inherit same configuration
    // WHY: Aligns with FinalizedPart grouping by part shape
    // PATTERN: Filter GlobalRelationship[] where parent.id matches partShapeRef
    // NOTE: For eventAssignments, parent is a shape (blockShape or partShape)
    const shapeEventAssignmentsRels = eventAssignmentsRelationships.filter(rel => {
      // Check if parent.id matches partShapeRef (parent is the shape for eventAssignments)
      return rel.parent.id === partShapeRef
    })
    
    // Helper function to get event shape name and metadata from a relationship
    // LEARNING: Read metadata from eventShape columns, not from relationships
    // WHY: Metadata (ternaryValue) is stored in event_shapes table, not relationship tables
    // PATTERN: Look up eventShape by eventInstance.eventShapeRef, read defaultTernaryValue from shape
    const getEventData = (childId: string): { shapeName?: string; ternaryValue?: 'true' | 'false' | 'override' | null } => {
      const eventInstance = eventInstances.find(ei => ei.id === childId)
      if (!eventInstance) return {}
      const eventShape = eventShapes.find(es => es.id === eventInstance.eventShapeRef)
      return {
        shapeName: eventShape?.name,
        ternaryValue: eventShape?.defaultTernaryValue ?? 'true' // Read from eventShape column, default to 'true'
      }
    }
    
    // Compute onSite from eventAssignments relationships
    // LEARNING: Find relationships with OnSite event shape, read ternaryValue from eventShape.defaultTernaryValue
    // WHY: Events are configured at shape level, metadata stored in event_shapes table columns
    // PATTERN: Filter by event shape name, read metadata from eventShape.defaultTernaryValue column
    const onSiteEvents = shapeEventAssignmentsRels
      .flatMap(rel => rel.children.map(child => ({ childId: child.id, ...getEventData(child.id) })))
      .filter(item => item.shapeName === "OnSite")
    const onSite: TernaryBoolean = onSiteEvents.length > 0
      ? (onSiteEvents[0].ternaryValue || 'true') // Use ternaryValue from eventShape column, default to 'true'
      : 'false'
    
    // Compute clientPresent from eventAssignments relationships
    const clientPresentEvents = shapeEventAssignmentsRels
      .flatMap(rel => rel.children.map(child => ({ childId: child.id, ...getEventData(child.id) })))
      .filter(item => item.shapeName === "ClientPresent")
    const clientPresent: TernaryBoolean = clientPresentEvents.length > 0
      ? (clientPresentEvents[0].ternaryValue || 'true') // Use ternaryValue from eventShape column, default to 'true'
      : 'false'
    
    // Compute moveable from eventAssignments relationships
    const moveableEvents = shapeEventAssignmentsRels
      .flatMap(rel => rel.children.map(child => ({ childId: child.id, ...getEventData(child.id) })))
      .filter(item => item.shapeName === "Moveable")
    const moveable = moveableEvents.length > 0
    
    const partInstanceWithProps = partInstance as GlobalEntity<'partInstance'> & {
      baseTime?: number
      rateOverBaseTime?: number
      baseFee?: number
      rateOverBaseFee?: number
      zeroOutPart?: boolean
    }
    
    return {
      id: partInstance.id,
      entityKey: 'partInstance',
      name: partInstance.name,
      active: this.isEntityActive(partInstance as unknown as Record<string, unknown>),
      partShape,
      baseTime: partInstanceWithProps.baseTime || 0,
      rateOverBaseTime: partInstanceWithProps.rateOverBaseTime || 0,
      baseFee: partInstanceWithProps.baseFee || 0,
      rateOverBaseFee: partInstanceWithProps.rateOverBaseFee || 0,
      orderIndex: partInstance.orderIndex,
      zeroOutPart: partInstanceWithProps.zeroOutPart || false,
    }
  }
}

// Export singleton
export const bookingTransformer = new BookingTransformer()

