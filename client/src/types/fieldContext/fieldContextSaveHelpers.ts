import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { UseFieldContextStateReturn } from '@/types/fieldContext/fieldContextState'
import type { QueryClient } from '@tanstack/vue-query'

export interface SaveComponentEntityParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  state: UseFieldContextStateReturn<GE, FieldKey>
  currentEntity: { id?: string; name?: string; entityKey?: string } | undefined
}

export interface SaveRelationshipFieldParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  state: UseFieldContextStateReturn<GE, FieldKey>
  currentEntity: { id?: string; name?: string; entityKey?: string } | undefined
  fieldKeyString: string
  queryClient: QueryClient
}

export interface SaveRegularFieldParams<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  state: UseFieldContextStateReturn<GE, FieldKey>
  queryClient: QueryClient
}
