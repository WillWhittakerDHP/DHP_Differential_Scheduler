/**
 * User Router Constants
 * 
 * LEARNING: Centralized constants for user router operations
 * WHY: Eliminates magic strings, improves maintainability, enables type safety
 * PATTERN: Const objects with categorized constants
 */

/**
 * Error messages for user operations
 * LEARNING: Centralized error messages for consistent API responses
 * WHY: Single source of truth for error messages, easier to maintain and translate
 * PATTERN: Const object with error message values organized by operation type
 */
export const ERROR_MESSAGES = {
  // User CRUD operations
  FETCH_USERS: 'Failed to fetch users',
  FETCH_USER: 'Error fetching user',
  USER_NOT_FOUND: 'User not found',
  CREATE_USER: 'Failed to create user',
  UPDATE_USER: 'Failed to update user',
  PATCH_USER: 'Failed to patch user',
  DELETE_USER: 'Failed to delete user',
  
  // Validation errors
  VALIDATION_FAILED: 'Validation failed',
} as const
