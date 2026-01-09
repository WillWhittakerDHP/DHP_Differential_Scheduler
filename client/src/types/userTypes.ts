/**
 * User Type Types
 * 
 * LEARNING: Type definitions for user types (state control blocks)
 * WHY: User types are BlockInstances with blockShapeRef pointing to state control block shapes (constituable: false)
 * PATTERN: GlobalEntityId | null matches the pattern used throughout the codebase
 */

import type { GlobalEntityId } from './entities'

/**
 * User type type
 * LEARNING: UserTypeBlock is a BlockInstance ID (GlobalEntityId) or null for generic annotations
 * WHY: User types are BlockInstances, so we use GlobalEntityId for type consistency
 * PATTERN: GlobalEntityId | null matches the pattern used throughout the codebase
 */
export type UserTypeBlock = GlobalEntityId | null;

