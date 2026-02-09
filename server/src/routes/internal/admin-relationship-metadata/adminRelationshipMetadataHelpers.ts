/**
 * Admin Relationship Metadata Router Helper Functions
 * 
 * LEARNING: Extracted helper functions for admin relationship metadata operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure functions for complex logic
 */

import type { RelationshipMetadataEntry } from '../../../utils/adminRelationshipMetadataComposer.js'

/**
 * Transform metadata array to record format
 * LEARNING: Transforms array of metadata to keyed record
 * WHY: Provides consistent format for metadata responses
 * PATTERN: Map array to record with relationshipKey as key
 * 
 * @param metadata - Array of metadata records
 * @returns Record keyed by relationshipKey
 */
export function transformMetadataToRecord(metadata: RelationshipMetadataEntry[]): Record<string, unknown> {
  const metadataRecord: Record<string, unknown> = {}
  for (const meta of metadata) {
    metadataRecord[meta.relationshipKey] = {
      dataType: meta.dataType,
      label: meta.label,
      isRequired: meta.isRequired,
      visibility: meta.visibility,
      layout: meta.layout,
      displayOrder: meta.displayOrder,
      renderAs: meta.renderAs,
      statusButtonColor: meta.statusButtonColor,
      panel: meta.panel,
      bulkEdit: meta.bulkEdit,
      inputConfig: meta.inputConfig || null,
    }
  }
  return metadataRecord
}
