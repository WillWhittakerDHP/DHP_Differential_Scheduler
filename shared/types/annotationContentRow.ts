/**
 * One row in annotation instance `contentRows` (per user-type copy + generic row).
 * Shared by client admin UI, booking wizard resolution, and server sync/API.
 */
export interface AnnotationContentRow {
  userTypeBlockInstanceId: string | null
  text: string
}
