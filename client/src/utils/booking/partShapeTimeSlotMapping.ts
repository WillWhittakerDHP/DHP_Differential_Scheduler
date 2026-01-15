/**
 * Part Shape to Time Slot Category Mapping
 * 
 * LEARNING: Maps part shape names to time slot category keys for AppointmentSlot structure
 * WHY: Groups parts by their conceptual role (earlyArrival, dataCollection, etc.) for time slot calculations
 * PATTERN: Case-insensitive name matching with fallback to part properties
 * 
 * Note: This is a hardcoded mapping for now. Future enhancement could make this configurable.
 */

import type { BookingPartInstance } from '@/utils/transformers/globalToBookingTransformer'

/**
 * Time slot category keys that correspond to AppointmentSlot properties
 * LEARNING: These keys match the properties in AppointmentSlot interface
 * WHY: Ensures type safety and consistency between mapping and type definitions
 */
export type TimeSlotCategoryKey = 
  | 'earlyArrival'
  | 'dataCollection'
  | 'reportWriting'
  | 'clientPresentation'

/**
 * Mapping from part shape name (case-insensitive) to time slot category key
 * LEARNING: Normalizes part shape names to category keys
 * WHY: Allows flexible naming while maintaining consistent category structure
 * PATTERN: Case-insensitive matching with normalized keys
 */
const PART_SHAPE_NAME_TO_CATEGORY: Record<string, TimeSlotCategoryKey> = {
  'earlyarrival': 'earlyArrival',
  'early-arrival': 'earlyArrival',
  'early_arrival': 'earlyArrival',
  'datacollection': 'dataCollection',
  'data-collection': 'dataCollection',
  'data_collection': 'dataCollection',
  'reportwriting': 'reportWriting',
  'report-writing': 'reportWriting',
  'report_writing': 'reportWriting',
  'clientpresentation': 'clientPresentation',
  'client-presentation': 'clientPresentation',
  'client_presentation': 'clientPresentation',
}

/**
 * Map part shape name to time slot category key
 * LEARNING: Normalizes part shape name to category key using case-insensitive matching
 * WHY: Provides consistent categorization regardless of naming conventions
 * PATTERN: Normalize name (lowercase, remove spaces) and lookup in mapping table
 * 
 * @param partShapeName - Part shape name from partInstance.partShape
 * @returns Time slot category key, or null if no mapping found
 */
export function mapPartShapeToCategory(partShapeName: string | null | undefined): TimeSlotCategoryKey | null {
  if (!partShapeName) return null
  
  // Normalize: lowercase, remove spaces, hyphens, underscores
  const normalized = partShapeName
    .toLowerCase()
    .replace(/[\s\-_]/g, '')
  
  return PART_SHAPE_NAME_TO_CATEGORY[normalized] || null
}

/**
 * Get time slot category for a part instance
 * LEARNING: Maps part instance to category using part shape name, with fallback to part properties
 * WHY: Provides categorization even when part shape name doesn't match known categories
 * PATTERN: Try part shape name mapping first, then fallback to property-based heuristics
 * 
 * @param partInstance - BookingPartInstance to categorize
 * @returns Time slot category key, or null if cannot be categorized
 */
export function getPartInstanceCategory(partInstance: BookingPartInstance): TimeSlotCategoryKey | null {
  // LEARNING: Try mapping by part shape name first
  // WHY: Part shape names are the primary way to categorize parts
  // PATTERN: Use partShape name to lookup category
  const categoryFromName = mapPartShapeToCategory(partInstance.partShape)
  if (categoryFromName) {
    return categoryFromName
  }
  
  // LEARNING: Fallback to property-based heuristics
  // WHY: Some parts may not have explicit shape names but can be categorized by properties
  // PATTERN: Use onSite and clientPresent flags to infer category
  // Note: This is a simple heuristic - can be enhanced based on business rules
  if (partInstance.clientPresent === true) {
    // Parts where client is present are likely clientPresentation
    return 'clientPresentation'
  }
  
  if (partInstance.onSite === true) {
    // Parts that are on-site but client not present are likely dataCollection
    return 'dataCollection'
  }
  
  // No category found
  return null
}

/**
 * Check if a category key is a valid time slot category
 * LEARNING: Type guard for TimeSlotCategoryKey
 * WHY: Ensures type safety when working with category keys
 * PATTERN: Check if key exists in known categories
 * 
 * @param key - String to check
 * @returns True if key is a valid TimeSlotCategoryKey
 */
export function isValidTimeSlotCategory(key: string): key is TimeSlotCategoryKey {
  return ['earlyArrival', 'dataCollection', 'reportWriting', 'clientPresentation'].includes(key)
}
