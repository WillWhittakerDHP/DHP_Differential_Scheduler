/**
 * WHY: User Type Types

LEARNING: Type definitions for user types (state contro...
 */
import type { GlobalEntityId } from '@shared/types/primitiveBrands'

/**
 * PATTERN: User type type
PATTERN: GlobalEntityId | null matches the pattern used t...
 */
export type UserTypeBlock = GlobalEntityId | null;

