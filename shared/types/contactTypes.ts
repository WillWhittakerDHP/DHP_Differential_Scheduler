/**
 * Shared Contact Types
 *
 * WHY: Single source of truth for contact payloads; prevents type drift (TYPE_SIMILARITY_PROPOSAL § 1.4)
 * PATTERN: Shared types directory for cross-cutting concerns
 */

/**
 * Minimal contact info shape (email, name).
 * WHY: ContactInfo, UserResponse/Request, ParsedClient, and wizard contact steps extend or intersect this.
 */
export interface ContactInfoBase {
  email: string
  firstName: string
  lastName: string
  phone?: string | null
}
