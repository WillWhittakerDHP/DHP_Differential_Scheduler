/**
 * Optimistic update helpers for AnnotationAssignment mutations.
 *
 * LEARNING: Annotation assignments impact *two* client-side data surfaces:
 * - The relationship query cache: `['blockInstanceAnnotations', blockInstanceId]`
 * - The hydrated GlobalData cache: `['globalData']` → `blockInstance.annotations` + derived `blockInstance.description`
 *
 * WHY: `globalData` embeds annotations directly on `blockInstance` for fast reads (and legacy `description` support),
 * so updating only the relationship list would leave the UI stale.
 *
 * PATTERN: Keep these helpers pure (old -> next) so composables can:
 * - snapshot previous cache values in `onMutate`
 * - apply optimistic updates via `queryClient.setQueryData`
 * - rollback safely in `onError`
 *
 * NOTE: This file currently contains only documentation. Implementation functions were removed as unused.
 */

