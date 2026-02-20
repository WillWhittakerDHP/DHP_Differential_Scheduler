/**
 * Shared Contact Types
 *
 * LEARNING: Base types for contact/attendee shapes shared between client and server
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
