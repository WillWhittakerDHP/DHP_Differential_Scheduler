/**
 * Pure helpers + small orchestrators for useSelectConfig.
 * WHY: Keeps composable body shallow so function-complexity audit does not count nested returns/branches.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import { RelationshipSelectModeEnum, RelationshipSelectTypeEnum } from '@/types/entity/formDataEnums'
import { asEmptyString } from '@/utils/safeDefaults'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import type { AdminObject } from '@/utils/transformers/globalToAdminTransformer'
import type { OptionsSelectConfigLike } from '@/utils/admin/selectTypeResolver'
import {
  unwrapInputConfig,
  getSelectConfigFromUnwrapped,
} from '@/utils/admin/selectTypeResolver'
import {
  assertSelectInputConfigNotPropertyTargetMode,
  ForbiddenSelectInputTargetModeError,
} from '@shared/utils/selectInputConfigCodec'
import type { SelectOption } from '@/types/selectOptions'

interface SelectConfigLogger {
  warn: (message: string, meta?: Record<string, unknown>) => void
  error: (message: string, meta?: Record<string, unknown>) => void
  debug: (message: string, meta?: Record<string, unknown>) => void
}

export function tryGetAdminEntityForSelect<GE extends GlobalEntityKey>(
  getEntity: (key: GE, id: GlobalEntityId) => AdminObject<GE> | undefined,
  entityKey: GE,
  entityId: GlobalEntityId,
  logger: SelectConfigLogger
): AdminObject<GE> | null {
  try {
    const entityValue = getEntity(entityKey, entityId)
    return entityValue ?? null
  } catch (err) {
    logger.warn('useSelectConfig: failed to get entity', {
      entityKey,
      entityId,
      err,
    })
    return null
  }
}

export function pickFieldMetadataEntry(
  fieldMetadata: Record<string, FieldMetadataEntry> | null | undefined,
  fieldKey: string
): FieldMetadataEntry | undefined {
  if (!fieldMetadata) {
    return undefined
  }
  return fieldMetadata[fieldKey]
}

export function isEnumTypeSelectField(entityKey: string, fieldKey: string): boolean {
  return (entityKey === 'blockShape' || entityKey === 'partShape') && fieldKey === 'type'
}

export function parseOptionsSelectConfigFromMeta(
  meta: FieldMetadataEntry | undefined,
  entityKey: string,
  fieldKey: string
): OptionsSelectConfigLike | undefined {
  if (!meta?.inputConfig || typeof meta.inputConfig !== 'object') {
    return undefined
  }

  const inputConfig = meta.inputConfig as Record<string, unknown>
  const rawOptions = inputConfig.options

  if (!Array.isArray(rawOptions)) {
    return undefined
  }

  const normalizedOptions = rawOptions
    .filter((option): option is Record<string, unknown> => typeof option === 'object' && option !== null)
    .map((option) => ({
      value: option.value === null ? null : String(asEmptyString(option.value as string | null | undefined)),
      label: String(asEmptyString(option.label as string | null | undefined)),
    }))

  const hasInvalidOption = normalizedOptions.some(
    (option) => (option.value !== null && option.value.length === 0) || option.label.length === 0
  )

  if (hasInvalidOption) {
    throw new Error(
      `[useSelectConfig] Invalid options format for ${entityKey}.${fieldKey}. ` +
        'Each option must include non-empty "label" property and "value" must be non-empty string or null.'
    )
  }

  return {
    options: normalizedOptions,
    selectMode: inputConfig.selectMode as RelationshipSelectModeEnum | undefined,
  }
}

export function mapOptionsSelectToSelectOptions(config: OptionsSelectConfigLike | undefined): SelectOption[] {
  if (!config) {
    return []
  }

  return config.options.map((option) => ({
    title: option.label,
    value: option.value === null ? '__NULL__' : option.value,
  }))
}

function resolveRelationshipOrVirtualSelectConfig(
  meta: FieldMetadataEntry,
  isEnumSelect: boolean,
  isOptionsSelect: boolean,
  entityKey: string,
  fieldKey: string,
  logger: SelectConfigLogger
): RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined {
  if (isEnumSelect || isOptionsSelect) {
    return undefined
  }

  if (!meta.inputConfig) {
    throw new Error(
      `[useSelectConfig] Missing inputConfig in FieldMetadataEntry for ${entityKey}.${fieldKey}. ` +
        'Select fields (renderAs: select/multiselect/reference) must have inputConfig configured.'
    )
  }

  let inputConfig = meta.inputConfig as Record<string, unknown>
  if (!('targetMode' in inputConfig) && 'relationshipSelect' in inputConfig) {
    const wrapped = inputConfig.relationshipSelect
    if (typeof wrapped === 'object' && wrapped !== null && 'targetMode' in wrapped) {
      logger.warn(
        `Wrapped inputConfig detected (stale relationshipSelect format) for ${entityKey}.${fieldKey}. ` +
          'inputConfig is wrapped in "relationshipSelect" key — fix in admin_metadata.',
        {
          entityKey,
          fieldKey,
          wrappedKeys: Object.keys(inputConfig),
        }
      )
    }
  }

  try {
    assertSelectInputConfigNotPropertyTargetMode(inputConfig)
  } catch (err) {
    if (err instanceof ForbiddenSelectInputTargetModeError) {
      logger.error(
        'Forbidden inputConfig.targetMode "property" for select field; use "primitive" and run metadata migration.',
        {
          entityKey,
          fieldKey,
        }
      )
    }
    throw err
  }

  inputConfig = unwrapInputConfig(inputConfig, entityKey, fieldKey)
  return getSelectConfigFromUnwrapped(inputConfig, entityKey, fieldKey) as
    | RelationshipFieldType<GlobalEntityKey>
    | VirtualFieldType<GlobalEntityKey>
}

export function computeMainSelectConfigValue(
  isMetadataLoaded: boolean,
  meta: FieldMetadataEntry | undefined,
  isEnumSelect: boolean,
  isOptionsSelect: boolean,
  entityKey: string,
  fieldKey: string,
  logger: SelectConfigLogger
): RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined {
  if (!isMetadataLoaded) {
    return undefined
  }

  if (!meta) {
    return undefined
  }

  return resolveRelationshipOrVirtualSelectConfig(meta, isEnumSelect, isOptionsSelect, entityKey, fieldKey, logger)
}

export function readAnnotationAssignmentSelect(meta: FieldMetadataEntry | undefined): boolean {
  if (!meta?.inputConfig || typeof meta.inputConfig !== 'object') {
    return false
  }
  const inputConfig = meta.inputConfig as Record<string, unknown>
  return inputConfig.selectType === RelationshipSelectTypeEnum.AnnotationAssignmentSelect
}

export function readAttendeeSelect(meta: FieldMetadataEntry | undefined): boolean {
  if (!meta?.inputConfig || typeof meta.inputConfig !== 'object') {
    return false
  }
  const inputConfig = meta.inputConfig as Record<string, unknown>
  return inputConfig.selectType === 'attendeeSelect'
}

export function selectChipsPropsForMultiple(isMultiple: boolean): Record<string, unknown> {
  if (isMultiple) {
    return {
      chips: true,
      'closable-chips': true,
    }
  }
  return {}
}
