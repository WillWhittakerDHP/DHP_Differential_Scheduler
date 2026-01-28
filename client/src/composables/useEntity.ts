/**
 * Entity CRUD Composables (facade)
 *
 * WHY: Keep the public API stable while splitting the old "god composable" into focused modules.
 */

export * from './entityCrud/useEntityCrud'
export * from './entityCrud/usePrimitiveMutation'

