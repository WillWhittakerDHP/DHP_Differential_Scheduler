/**
 * WHY: Pure steps for store → form sync (useEntityCardStoreSync nesting audit).
 */

import type { FormContext } from 'vee-validate'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import {
  listChangedEntityFieldKeys,
  shouldResetFormOnStoreChange,
} from '@/utils/admin/entityCardStoreSyncActions'

export type EntityCardStoreSyncStep<GE extends GlobalEntityKey> =
  | { kind: 'skip' }
  | { kind: 'reset'; nextLastId: string; values: GlobalEntity<GE> }
  | { kind: 'patch'; changedFields: (keyof GlobalEntity<GE>)[]; values: GlobalEntity<GE> }

export function planEntityCardStoreSync<GE extends GlobalEntityKey>(params: {
  newStoreEntity: GlobalEntity<GE>
  oldStoreEntity: GlobalEntity<GE> | undefined
  lastEntityId: string
  initialEntity: GlobalEntity<GE> | undefined
  formFieldKeys: string[]
}): EntityCardStoreSyncStep<GE> {
  const { newStoreEntity, oldStoreEntity, lastEntityId, initialEntity, formFieldKeys } = params

  const { reset, nextLastId } = shouldResetFormOnStoreChange({
    newStoreEntity,
    oldStoreEntity,
    lastEntityId,
    initialEntity,
  })

  if (reset) {
    return { kind: 'reset', nextLastId, values: { ...newStoreEntity } }
  }

  if (!oldStoreEntity) {
    return { kind: 'skip' }
  }

  const changedFields = listChangedEntityFieldKeys(oldStoreEntity, newStoreEntity, formFieldKeys)
  if (changedFields.length === 0) {
    return { kind: 'skip' }
  }

  return { kind: 'patch', changedFields, values: newStoreEntity }
}

export function applyEntityCardStoreSyncStep<GE extends GlobalEntityKey>(
  step: EntityCardStoreSyncStep<GE>,
  form: FormContext
): void {
  if (step.kind === 'skip') {
    return
  }
  if (step.kind === 'reset') {
    form.resetForm({ values: { ...step.values } })
    return
  }
  step.changedFields.forEach((fieldKey) => {
    form.setFieldValue(String(fieldKey), step.values[fieldKey])
  })
}
