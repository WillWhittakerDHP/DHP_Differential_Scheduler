/**
 * WHY: `*Constants.ts` filename so constants-consolidation treats this file as a constants module
 * (client/src/constants/*.ts without "Constants" suffix is scanned as non-constants and triggers false HOIST).
 * Matches server `relationshipConstants` ERROR_MESSAGES.RELATIONSHIP_ALREADY_EXISTS (409 duplicate FK).
 */
export const RELATIONSHIP_ALREADY_EXISTS = 'Relationship already exists' as const
