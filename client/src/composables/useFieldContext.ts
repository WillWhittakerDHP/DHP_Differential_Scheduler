/**
 * useFieldContext (facade)
 *
 * WHY: Keep the public API stable while splitting the old "god composable" into `fieldContext/` modules.
 * PATTERN: query/state/actions separation is implemented in `src/composables/fieldContext/`.
 */

export * from '@/composables/fieldContext/types'
export * from '@/composables/fieldContext/useFieldContext'

 
