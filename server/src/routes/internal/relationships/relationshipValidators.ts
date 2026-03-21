
import type { ValidationResult } from '../../helpers/routerValidators.js'
import { ERROR_MESSAGES, RELATIONSHIP_REGISTRY, type RelationshipKind } from './relationshipConstants.js'

/**
 * Validate relationship kind
 * 
 * @param value - Relationship kind value to validate
 * @returns true if value is valid RelationshipKind
 */
export function isValidRelationshipKind(value: string): value is RelationshipKind {
  return value in RELATIONSHIP_REGISTRY
}

export function normalizeRelationshipKind(value: string): RelationshipKind {
  if (value in RELATIONSHIP_REGISTRY) {
    return value as RelationshipKind
  }
  // No backward compatibility - throw error for unknown relationship kinds
  throw new Error(ERROR_MESSAGES.UNKNOWN_RELATIONSHIP_KIND + ': ' + value)
}

/**
 * Validate required fields for relationship creation
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
