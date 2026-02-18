/**
 * Relationship Router Validation Utilities
 * 
 * LEARNING: Extracted validation logic for relationship operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure validation functions that return validation results
 */

import type { ValidationResult } from '../../helpers/routerValidators.js'
import { ERROR_MESSAGES, RELATIONSHIP_REGISTRY, type RelationshipKind } from './relationshipConstants.js'

/**
 * Validate relationship kind
 * LEARNING: Extracted relationship kind validation logic
 * WHY: Reusable validation for relationship operations
 * PATTERN: Check relationship kind against registry, return validation result
 * 
 * @param value - Relationship kind value to validate
 * @returns true if value is valid RelationshipKind
 */
export function isValidRelationshipKind(value: string): value is RelationshipKind {
  return value in RELATIONSHIP_REGISTRY
}

/**
 * Normalize relationship kind
 * LEARNING: Normalizes relationship kind string to RelationshipKind type
 * WHY: Ensures relationship kind is valid and normalized
 * PATTERN: Check if valid, return normalized kind or throw error
 * 
 * @param value - Relationship kind value to normalize
 * @returns Normalized RelationshipKind
 * @throws Error if relationship kind is unknown
 */
export function normalizeRelationshipKind(value: string): RelationshipKind {
  if (value in RELATIONSHIP_REGISTRY) {
    return value as RelationshipKind
  }
  // No backward compatibility - throw error for unknown relationship kinds
  throw new Error(ERROR_MESSAGES.UNKNOWN_RELATIONSHIP_KIND + ': ' + value)
}

/**
 * Validate required fields for relationship creation
 * LEARNING: Extracted required field validation logic
 * WHY: Reusable validation for relationship operations
 * PATTERN: Check required fields, return validation result
 * 
 * @param data - Relationship data object
 * @returns ValidationResult indicating if required fields are present
 */
export function validateRequiredFields(data: {
  parentId?: unknown
  childId?: unknown
}): ValidationResult {
  if (!data.parentId || !data.childId) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
    }
  }
  
  return { valid: true }
}

/**
 * Validate parent and child are different
 * LEARNING: Extracted validation for instance components
 * WHY: Prevents self-referential relationships
 * PATTERN: Check if parent and child are the same, return validation result
 * 
 * @param parentId - Parent ID
 * @param childId - Child ID
 * @returns ValidationResult indicating if parent and child are different
 */
export function validateParentChildDifferent(parentId: string, childId: string): ValidationResult {
  if (parentId === childId) {
    return {
      valid: false,
      error: ERROR_MESSAGES.PARENT_CHILD_SAME,
    }
  }
  
  return { valid: true }
}
