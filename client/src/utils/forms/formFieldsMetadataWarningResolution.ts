/**
 * Metadata warning + display-config resolution for entity forms.
 * WHY: Module-level functions are measured separately by function-complexity audit; composable stays thin.
 */
import type { Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/buildFieldContextReturn'
import {
  defaultTextDisplayConfig,
  displayConfigFromMetadataEntry,
} from '@/utils/forms/fieldDisplayConfigFromMetadata'
import { applyPrimitiveDisplayOverlay } from '@/utils/forms/applyPrimitiveDisplayOverlay'

export type FormFieldsMetadataDisplayConfig<GE extends GlobalEntityKey> =
  FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>['state']['displayConfig']

export interface MetadataWarningLog {
  warn(message: string, meta?: Record<string, unknown>): void
}

function warnCatalogEmptyOnce<GE extends GlobalEntityKey>(
  entityKey: GE,
  warnedFields: Ref<Set<string>>,
  showWarning: (message: string, durationMs: number) => void,
  logWarn: MetadataWarningLog['warn']
): void {
  const warningKey = `${entityKey}:metadata-empty`
  if (warnedFields.value.has(warningKey)) {
    return
  }
  logWarn(`Missing fieldMetadata for ${entityKey}. Field definitions are code-first; extend codeFirstMetadataCache if a field is missing.`, {
    entityKey,
  })
    showWarning(`Missing fieldMetadata for ${entityKey}. Extend codeFirstMetadataCache for this entity.`, 6000)
  warnedFields.value.add(warningKey)
}

function warnMissingFieldEntryOnce<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: string,
  warnedFields: Ref<Set<string>>,
  showWarning: (message: string, durationMs: number) => void,
  logWarn: MetadataWarningLog['warn']
): void {
  logWarn(
    `Missing FieldMetadataEntry for ${entityKey}.${fieldKey}. Add an entry in codeFirstMetadataCache before rendering.`
  )
  if (!warnedFields.value.has(fieldKey)) {
    showWarning(
      `Missing FieldMetadataEntry for ${entityKey}.${fieldKey}. Add an entry in codeFirstMetadataCache before rendering.`,
      6000
    )
    warnedFields.value.add(fieldKey)
  }
}

function warnMissingLabelOnce<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: string,
  meta: FieldMetadataEntry,
  warnedFields: Ref<Set<string>>,
  showWarning: (message: string, durationMs: number) => void,
  logWarn: MetadataWarningLog['warn']
): void {
  if (meta.label || warnedFields.value.has(`${fieldKey}:label`)) {
    return
  }
  logWarn(`Missing label in FieldMetadataEntry for ${entityKey}.${fieldKey}. Metadata should include label property.`, {
    entityKey,
    fieldKey,
  })
  showWarning(
    `Missing label in FieldMetadataEntry for ${entityKey}.${fieldKey}. Metadata should include label property.`,
    6000
  )
  warnedFields.value.add(`${fieldKey}:label`)
}

export function warnMissingMetadataEntriesForFieldList<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKeys: GlobalFieldKey<GE>[],
  metadata: Record<string, FieldMetadataEntry> | undefined,
  isMetadataReady: boolean,
  warnedFields: Ref<Set<string>>,
  showWarning: (message: string, durationMs: number) => void,
  logWarn: MetadataWarningLog['warn']
): void {
  if (!isMetadataReady || !metadata) {
    return
  }
  fieldKeys.forEach((fieldKey) => {
    const fieldKeyStr = String(fieldKey)
    if (fieldKeyStr in metadata || warnedFields.value.has(fieldKeyStr)) {
      return
    }
    logWarn(
      `Missing FieldMetadataEntry for ${entityKey}.${fieldKeyStr}. Add an entry in codeFirstMetadataCache before rendering.`
    )
    showWarning(
      `Missing FieldMetadataEntry for ${entityKey}.${fieldKeyStr}. Add an entry in codeFirstMetadataCache before rendering.`,
      6000
    )
    warnedFields.value.add(fieldKeyStr)
  })
}

export function resolveDisplayConfigWithMetadataWarnings<GE extends GlobalEntityKey>(params: {
  entityKey: GE
  fieldKey: string
  metadata: Record<string, FieldMetadataEntry> | undefined
  hasMetadataKeys: boolean
  isMetadataReady: boolean
  warnedFields: Ref<Set<string>>
  showWarning: (message: string, durationMs: number) => void
  logWarn: MetadataWarningLog['warn']
}): FormFieldsMetadataDisplayConfig<GE> {
  const { entityKey, fieldKey, metadata, hasMetadataKeys, isMetadataReady, warnedFields, showWarning, logWarn } =
    params

  if (!hasMetadataKeys) {
    if (isMetadataReady) {
      warnCatalogEmptyOnce(entityKey, warnedFields, showWarning, logWarn)
    }
    return defaultTextDisplayConfig<GE>(fieldKey)
  }
  if (!metadata) {
    return defaultTextDisplayConfig<GE>(fieldKey)
  }

  const meta = metadata[fieldKey]
  if (!meta) {
    if (isMetadataReady) {
      warnMissingFieldEntryOnce(entityKey, fieldKey, warnedFields, showWarning, logWarn)
    }
    return defaultTextDisplayConfig<GE>(fieldKey)
  }

  warnMissingLabelOnce(entityKey, fieldKey, meta, warnedFields, showWarning, logWarn)
  const fromMeta = displayConfigFromMetadataEntry<GE>(meta, fieldKey)
  return applyPrimitiveDisplayOverlay(entityKey, fieldKey, fromMeta)
}
