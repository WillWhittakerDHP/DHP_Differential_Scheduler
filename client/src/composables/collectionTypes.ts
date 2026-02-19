/**
 * Shared types for data collection composables (business and global).
 * WHY: Single canonical definitions used by both collection layers; brand by type param.
 */

import type { ComputedRef } from 'vue'

export type UpdateByIdPayload<UpdatePayload> = {
  id: string
  data: UpdatePayload
}

export type CollectionQueryResult<CollectionItem> = {
  data: ComputedRef<CollectionItem[]>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
}

export type CollectionByIdQueryResult<CollectionItem> = {
  data: ComputedRef<CollectionItem | undefined>
  isLoading: ComputedRef<boolean>
  error: ComputedRef<unknown | undefined>
}

export type CollectionEndpoints = {
  listEndpoint: () => string
  byIdEndpoint: (id: string) => string
}
