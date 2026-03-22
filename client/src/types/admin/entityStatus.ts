import type { ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityStatusOptions {
  entityKey: GlobalEntityKey
  entity: ComputedRef<GlobalEntity<GlobalEntityKey>>
}

export interface UseEntityStatusReturn {
  isComposer: ComputedRef<boolean>
  isComponent: ComputedRef<boolean>
  isComposable: ComputedRef<boolean>
  componentCount: ComputedRef<number>
  composerName: ComputedRef<string | null>
}
