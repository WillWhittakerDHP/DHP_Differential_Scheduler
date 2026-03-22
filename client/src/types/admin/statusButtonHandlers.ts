import type { Ref, ComputedRef } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { useStatusButtonToggle } from '@/composables/admin/useStatusButtonToggle'

export interface UseStatusButtonHandlersOptions<GE extends GlobalEntityKey> {
  filteredEntities: ComputedRef<GlobalEntity<GE>[]>
  entityKey: GE
}

export interface UseStatusButtonHandlersReturn<GE extends GlobalEntityKey> {
  statusButtonHandlers: Ref<Map<string, ReturnType<typeof useStatusButtonToggle<GE>>>>
  handleStatusButtonClick: (entityId: string, fieldKey: GlobalFieldKey<GE>, event: Event) => void
}
