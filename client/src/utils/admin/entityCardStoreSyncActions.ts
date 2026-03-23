import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export function shouldResetFormOnStoreChange<GE extends GlobalEntityKey>(params: {
  newStoreEntity: GlobalEntity<GE>
  oldStoreEntity: GlobalEntity<GE> | undefined
  lastEntityId: string
  initialEntity: GlobalEntity<GE> | undefined
}): { reset: boolean; nextLastId: string } {
  const { newStoreEntity, oldStoreEntity, lastEntityId, initialEntity } = params
  const newEntityId = newStoreEntity.id
  const entityIdChanged = newEntityId !== lastEntityId
  const isInitialLoad = oldStoreEntity === undefined
  const storeEntityJustLoaded = oldStoreEntity === undefined && newStoreEntity !== initialEntity
  const shouldReset = entityIdChanged || isInitialLoad || storeEntityJustLoaded
  return {
    reset: shouldReset,
    nextLastId: shouldReset ? newEntityId : lastEntityId,
  }
}

export function listChangedEntityFieldKeys<GE extends GlobalEntityKey>(
  oldStoreEntity: GlobalEntity<GE>,
  newStoreEntity: GlobalEntity<GE>,
  formFieldKeys: string[]
): (keyof GlobalEntity<GE>)[] {
  const entityKeys = Object.keys(newStoreEntity) as (keyof GlobalEntity<GE>)[]
  return entityKeys.filter((key): key is keyof GlobalEntity<GE> => {
    if (!formFieldKeys.includes(String(key))) {
      return false
    }
    const oldValue = oldStoreEntity[key]
    const newValue = newStoreEntity[key]
    return JSON.stringify(oldValue) !== JSON.stringify(newValue)
  })
}
