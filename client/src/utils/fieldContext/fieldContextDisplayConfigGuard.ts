import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldDisplayConfig } from '@/composables/fieldContext/types'

export interface FieldContextDisplayConfigLog {
  error(message: string, meta?: Record<string, unknown>): void
}

type ProvidedDisplayConfigReady<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> = Partial<
  FieldDisplayConfig<GE, FieldKey>
> & {
  label: string
  fieldType: NonNullable<FieldDisplayConfig<GE, FieldKey>['fieldType']>
}

/**
 * Throws after logging when label or fieldType are missing (metadata must supply both).
 */
export function assertFieldContextDisplayConfigPresent<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  providedDisplayConfig: Partial<FieldDisplayConfig<GE, FieldKey>>,
  entityKey: GE,
  fieldKey: FieldKey,
  logError: FieldContextDisplayConfigLog['error']
): asserts providedDisplayConfig is ProvidedDisplayConfigReady<GE, FieldKey> {
  const hasProvidedLabel =
    providedDisplayConfig.label !== undefined && providedDisplayConfig.label !== null
  const hasProvidedFieldType =
    providedDisplayConfig.fieldType !== undefined && providedDisplayConfig.fieldType !== null

  if (hasProvidedLabel && hasProvidedFieldType) {
    return
  }

  const err = new Error(
    `[useFieldContextState] Missing required displayConfig for ${String(entityKey)}.${String(fieldKey)}. ` +
      `Expected label and fieldType from metadata. Field must be configured in /admin-metadata.`
  )
  logError('Missing required displayConfig', { entityKey, fieldKey, error: err })
  throw err
}

/**
 * Normalizes partial metadata display config into the field-context shape (after guard passes).
 */
export function normalizeFieldDisplayConfigFromProvided<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  providedDisplayConfig: ProvidedDisplayConfigReady<GE, FieldKey>
): FieldDisplayConfig<GE, FieldKey> {
  return {
    label: providedDisplayConfig.label,
    placeholder: providedDisplayConfig.placeholder ?? undefined,
    helpText: providedDisplayConfig.helpText ?? undefined,
    required: providedDisplayConfig.required === true,
    disabled: providedDisplayConfig.disabled === true,
    readOnly: providedDisplayConfig.readOnly === true,
    fieldType: providedDisplayConfig.fieldType,
    displayOrder: providedDisplayConfig.displayOrder,
  }
}
