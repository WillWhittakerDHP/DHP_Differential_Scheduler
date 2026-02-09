/**
 * Attendee Role Constants
 * 
 * LEARNING: Centralized constants for attendee role names used in appointment transformers
 * WHY: Eliminates magic strings and enables type-safe role matching
 * PATTERN: Exported const values for attendee and user role strings
 */

export const ATTENDEE_ROLE_CLIENT = 'Client' as const
export const ATTENDEE_ROLE_AGENT = 'Agent' as const
export const USER_ROLE_CLIENT = 'client' as const
export const USER_ROLE_AGENT = 'agent' as const
