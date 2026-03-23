import { createLogger } from '@/utils/logger'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

const logger = createLogger('fieldInputSaveBlur')

function blurActiveTarget(target: EventTarget | null): void {
  const el = target as HTMLElement
  if (el && 'blur' in el && typeof el.blur === 'function') {
    el.blur()
  }
}

export async function persistFieldAfterBlurValidate<
  GE extends GlobalEntityKey,
  FieldKey extends GlobalFieldKey<GE>,
>(fieldContext: FieldContextTypeGrouped<GE, FieldKey>): Promise<void> {
  const isValid = await fieldContext.actions.validate()
  if (!isValid) {
    return
  }
  try {
    await fieldContext.actions.save()
  } catch (error) {
    logger.error('Field save failed', {
      fieldKey: String(fieldContext.state.fieldKey),
      entityId: String(fieldContext.state.entityId),
      error,
    })
  }
}

export async function persistFieldOnEnterWithBlur<
  GE extends GlobalEntityKey,
  FieldKey extends GlobalFieldKey<GE>,
>(
  fieldContext: FieldContextTypeGrouped<GE, FieldKey>,
  entityCardSaveContext: { isNew?: boolean; handleSave?: () => Promise<void> } | null | undefined,
  eventTarget: EventTarget | null
): Promise<void> {
  const isValid = await fieldContext.actions.validate()
  if (!isValid) {
    return
  }

  const run = async (): Promise<void> => {
    if (entityCardSaveContext?.isNew && entityCardSaveContext.handleSave) {
      await entityCardSaveContext.handleSave()
    } else {
      await fieldContext.actions.save()
    }
    fieldContext.actions.setFocus(false)
    blurActiveTarget(eventTarget)
  }

  try {
    await run()
  } catch (error) {
    const msg =
      entityCardSaveContext?.isNew && entityCardSaveContext.handleSave
        ? 'Failed to save new entity card on blur'
        : 'Failed to save field on blur'
    logger.warn(msg, { error, fieldKey: fieldContext.state.fieldKey })
  }
}
