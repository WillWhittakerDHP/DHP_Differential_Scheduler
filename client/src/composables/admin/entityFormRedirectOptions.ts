/**
 * Shared options for entity form composables that support redirect after submit.
 * WHY: Single canonical shape for redirectRouteName; block and part instance forms extend.
 */

export interface UseEntityFormRedirectOptions {
  redirectRouteName?: string
}
