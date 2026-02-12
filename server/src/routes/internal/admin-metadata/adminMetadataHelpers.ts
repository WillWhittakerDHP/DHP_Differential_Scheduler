/**
 * Admin Metadata Router Helper Functions
 * 
 * LEARNING: Extracted helper functions for admin metadata operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure functions for complex logic
 */

import { Op } from 'sequelize'
import { isRelationshipKey } from '../../../constants/relationships.js'
import { GLOBAL_CONFIG_IDS, VALID_ENTITY_TYPES } from './adminMetadataConstants.js'

type AdminMetadataEntityType = (typeof VALID_ENTITY_TYPES)[number]

/**
 * Determine metadata type from field key
 * LEARNING: Backend determines metadataType by checking RELATIONSHIP_KEYS
 * WHY: Matches entity pattern - backend routes based on field type
 * PATTERN: Check if fieldKey is in RELATIONSHIP_KEYS to determine metadataType
 * 
 * @param fieldKey - Field key to check
 * @returns 'relationship' or 'primitive'
 */
export function determineMetadataType(fieldKey: string): 'relationship' | 'primitive' {
  return isRelationshipKey(fieldKey) ? 'relationship' : 'primitive'
}

/**
 * Get default renderAs based on metadata type
 * LEARNING: Default renderAs values based on metadata type
 * WHY: Provides sensible defaults for renderAs
 * PATTERN: Return default based on metadata type
 * 
 * @param metadataType - Metadata type ('relationship' or 'primitive')
 * @returns Default renderAs value
 */
export function getDefaultRenderAs(metadataType: 'relationship' | 'primitive'): string {
  return metadataType === 'relationship' ? 'reference' : 'text'
}

/**
 * Get default panel based on metadata type
 * LEARNING: Default panel values based on metadata type
 * WHY: Provides sensible defaults for panel
 * PATTERN: Return default based on metadata type
 * 
 * @param metadataType - Metadata type ('relationship' or 'primitive')
 * @returns Default panel value
 */
export function getDefaultPanel(metadataType: 'relationship' | 'primitive'): string {
  return metadataType === 'relationship' ? 'relationships' : 'none'
}

/**
 * Resolve entity ID and blockShapeRef for blockInstance metadata
 * LEARNING: When saving blockInstance metadata with blockShapeRef, use global config ID
 * WHY: BlockShape-specific instance metadata uses global config ID pattern
 * PATTERN: Check entityType and blockShapeRef, return resolved values
 * 
 * @param entityType - Entity type
 * @param entityId - Original entity ID
 * @param blockShapeRef - BlockShape reference (optional)
 * @returns Resolved entity ID and blockShapeRef
 */
export function resolveBlockInstanceMetadata(
  entityType: string,
  entityId: string,
  blockShapeRef: string | null | undefined
): { finalEntityId: string; finalBlockShapeRef: string | null } {
  if (entityType === 'blockInstance' && blockShapeRef) {
    return {
      finalEntityId: GLOBAL_CONFIG_IDS.BLOCK_INSTANCE,
      finalBlockShapeRef: blockShapeRef,
    }
  }
  
  return {
    finalEntityId: entityId,
    finalBlockShapeRef: null,
  }
}

/**
 * Build where clause for finding existing metadata
 * LEARNING: Builds Sequelize where clause for metadata lookup
 * WHY: Reusable logic for finding existing metadata records
 * PATTERN: Build where clause based on entity type and blockShapeRef
 * 
 * @param entityType - Entity type
 * @param entityId - Entity ID
 * @param metadataType - Metadata type ('relationship' or 'primitive')
 * @param fieldKey - Field key
 * @param blockShapeRef - BlockShape reference (optional)
 * @returns Sequelize where clause
 */
export function buildMetadataWhereClause(
  entityType: string,
  entityId: string,
  metadataType: 'relationship' | 'primitive',
  fieldKey: string,
  blockShapeRef: string | null | undefined
): Record<string, unknown> {
  const where: Record<string, unknown> = {
    entityType: entityType as AdminMetadataEntityType,
    entityId,
    metadataType,
    fieldKey,
  }
  
  if (entityType === 'blockInstance') {
    where.blockShapeRef = blockShapeRef
  } else {
    where.blockShapeRef = { [Op.is]: null }
  }
  
  return where
}

/**
 * Build batch metadata result structure
 * LEARNING: Builds the structured result for batch metadata endpoint
 * WHY: Centralized logic for batch metadata result construction
 * PATTERN: Transform flat metadata array into structured result
 * 
 * @param allMetadata - Array of all metadata records
 * @returns Structured batch metadata result
 */
export function buildBatchMetadataResult(allMetadata: any[]): {
  global: {
    blockShape: Record<string, unknown>
    partShape: Record<string, unknown>
    blockInstance: Record<string, unknown>
    partInstance: Record<string, unknown>
    eventShape: Record<string, unknown>
    eventInstance: Record<string, unknown>
    annotationShape: Record<string, unknown>
    annotationInstance: Record<string, unknown>
  }
  blockShapeSpecific: Record<string, Record<string, unknown>>
} {
  const result: {
    global: {
      blockShape: Record<string, unknown>
      partShape: Record<string, unknown>
      blockInstance: Record<string, unknown>
      partInstance: Record<string, unknown>
      eventShape: Record<string, unknown>
      eventInstance: Record<string, unknown>
      annotationShape: Record<string, unknown>
      annotationInstance: Record<string, unknown>
    }
    blockShapeSpecific: Record<string, Record<string, unknown>>
  } = {
    global: {
      blockShape: {},
      partShape: {},
      blockInstance: {},
      partInstance: {},
      eventShape: {},
      eventInstance: {},
      annotationShape: {},
      annotationInstance: {},
    },
    blockShapeSpecific: {},
  }

  for (const entry of allMetadata) {
    const entityType = entry.entityType as keyof typeof result.global
    const fieldKey = entry.fieldKey
    const blockShapeRef = entry.blockShapeRef

    const metadataEntry = {
      dataType: entry.dataType,
      label: entry.label,
      isRequired: entry.isRequired,
      visibility: entry.visibility,
      layout: entry.layout,
      displayOrder: entry.displayOrder,
      renderAs: entry.renderAs,
      statusButtonColor: entry.statusButtonColor,
      panel: entry.panel,
      bulkEdit: entry.bulkEdit,
      inputConfig: entry.inputConfig,
    }

    if (entityType === 'blockInstance' && blockShapeRef) {
      if (!result.blockShapeSpecific[blockShapeRef]) {
        result.blockShapeSpecific[blockShapeRef] = {}
      }
      result.blockShapeSpecific[blockShapeRef][fieldKey] = metadataEntry
    } else {
      if (result.global[entityType]) {
        result.global[entityType][fieldKey] = metadataEntry
      }
    }
  }

  return result
}
