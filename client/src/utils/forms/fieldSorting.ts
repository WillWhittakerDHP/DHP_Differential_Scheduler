/**
 * Field Sorting Utility
 * 
 * LEARNING: Reusable utility for sorting fields by displayOrder
 * WHY: Single source of truth for field sorting logic, reusable across codebase
 * PATTERN: Pure function that sorts field keys by displayOrder from metadata
 * 
 * This utility handles:
 * - Sorting by displayOrder (ascending)
 * - Fallback to alphabetical sorting when displayOrder is equal
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/types/entityMetadata'

/**
 * Sort fields by displayOrder
 * 
 * LEARNING: Sorts field keys by displayOrder from metadata, with alphabetical fallback
 * WHY: Maintains consistent field ordering across the application
 * PATTERN: Pure function that returns sorted array (doesn't mutate input)
 * 
 * @param fields - Array of field keys to sort
 * @param metadata - Field metadata containing displayOrder values
 * @returns New sorted array of field keys
 */
export function sortFieldsByDisplayOrder<GE extends GlobalEntityKey>(
  fields: GlobalFieldKey<GE>[],
  metadata: Record<string, FieldMetadataEntry>
): GlobalFieldKey<GE>[] {
  // PATTERN: Return empty array if fields is falsy or not an array
  if (!fields || !Array.isArray(fields)) {
    return []
  }
  
  // WHY: Functional approach - pure function shouldn't mutate inputs
  // PATTERN: Spread operator creates new array
  return [...fields].sort((a, b) => {
    const metaA = metadata[String(a)]
    const metaB = metadata[String(b)]
    const rawA = metaA?.displayOrder
    const rawB = metaB?.displayOrder
    const orderA = rawA !== undefined && rawA !== null ? rawA : 0
    const orderB = rawB !== undefined && rawB !== null ? rawB : 0
    
    // PATTERN: Compare displayOrder values
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // PATTERN: Use localeCompare for string comparison
    return String(a).localeCompare(String(b))
  })
}
