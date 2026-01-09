/**
 * Admin Types
 * 
 * LEARNING: Type definitions for admin interface
 * WHY: Type safety for admin components and operations
 * PATTERN: Centralized type definitions
 */

/**
 * Display field type
 * LEARNING: Defines how fields are displayed in forms
 * WHY: Type-safe field type definitions
 * PATTERN: Union type for field display types
 */
export type DisplayFieldType = 
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'textarea'
  | 'select'
  | 'multiselect'

