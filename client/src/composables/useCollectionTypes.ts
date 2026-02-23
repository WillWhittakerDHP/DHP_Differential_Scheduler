import type { ComputedRef } from 'vue'

/** Shared shape for entities with string id. Used by collection CRUD and transformers. */
export type WithId = { id: string }

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
