/**
 * EntityCard: provide save + autosave-disable keys for descendants.
 */
import { provide } from 'vue'
import { ENTITY_CARD_SAVE_KEY, ENTITY_CARD_DISABLE_AUTOSAVE_KEY } from '@/components/admin/generic/entityCardConstants'

export interface UseEntityCardProvidesParams {
  handleSave: () => void | Promise<void>
  isNew: boolean
  disableAutoSave: boolean
}

export function useEntityCardProvides(params: UseEntityCardProvidesParams): void {
  const { handleSave, isNew, disableAutoSave } = params
  provide(ENTITY_CARD_SAVE_KEY, {
    handleSave,
    isNew,
    disableAutoSave,
  })
  provide(ENTITY_CARD_DISABLE_AUTOSAVE_KEY, disableAutoSave)
}
