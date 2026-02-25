import type { Ref, ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

export interface UseStatusButtonToggleOptions<GE extends GlobalEntityKey> {
  entityKey: GE
  entityId: string | Ref<string> | ComputedRef<string>
  entity?: Ref<GlobalEntity<GE>> | ComputedRef<GlobalEntity<GE>> | GlobalEntity<GE>
  onToggle?: (fieldKey: string) => void
}

export interface UseStatusButtonToggleReturn<GE extends GlobalEntityKey> {
  toggleStatusButton: (fieldKey: GlobalFieldKey<GE>, event?: Event) => Promise<void>
}
