import type { Ref, ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

export interface UseStatusButtonToggleOptions<GE extends GlobalEntityKey> {
  entityKey: GE
  entityId: string | Ref<string> | ComputedRef<string>
  onToggle?: (fieldKey: string) => void
}

export interface UseStatusButtonToggleReturn<GE extends GlobalEntityKey> {
  toggleStatusButton: (fieldKey: GlobalFieldKey<GE>, event?: Event) => Promise<void>
}
