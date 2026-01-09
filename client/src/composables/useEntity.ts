/**
 * Entity CRUD Composables (facade)
 *
 * WHY: Keep the public API stable while splitting the old "god composable" into focused modules.
 */

export * from '@/composables/entityCrud/useEntityCrud'
export * from '@/composables/entityCrud/usePrimitiveMutation'

