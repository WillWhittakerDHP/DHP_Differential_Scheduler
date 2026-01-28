/**
 * Availability Types
 * 
 * LEARNING: Shared types for availability-related functionality
 * WHY: Centralizes type definitions used across multiple composables and utilities
 * PATTERN: Shared type definitions for availability calculations
 * 
 * P1-2: Extracted PropertyDetails to shared types
 */

/**
 * Property details structure for availability calculations
 * LEARNING: Property details that may affect availability calculations
 * WHY: Different properties may require different time allocations or adjustments
 * PATTERN: Optional fields for property characteristics
 */
export interface PropertyDetails {
  squareFootage?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits?: number | null
}
