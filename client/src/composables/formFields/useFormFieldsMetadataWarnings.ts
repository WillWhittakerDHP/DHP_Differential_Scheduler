import { ref, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import type { GlobalFieldKey } from '@/constants/primitives'
import { useNotification } from '@/composables/useNotification'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { createLogger } from '@/utils/logger'
import {
  resolveDisplayConfigWithMetadataWarnings,
  warnMissingMetadataEntriesForFieldList,
} from '@/utils/forms/formFieldsMetadataWarningResolution'

const logger = createLogger('useFormFieldsMetadataWarnings')

export interface UseFormFieldsMetadataWarningsOptions<GE extends GlobalEntityKey> {
  entityKey: GE
}

export interface UseFormFieldsMetadataWarningsReturn<GE extends GlobalEntityKey> {
  warnedFields: Ref<Set<string>>
  warnMissingMetadataEntries: (
    fieldKeys: GlobalFieldKey<GE>[],
    metadata: Record<string, FieldMetadataEntry> | undefined,
    isMetadataReady: boolean
  ) => void
  getFieldDisplayConfig: (
    fieldKey: string,
    metadata: Record<string, FieldMetadataEntry> | undefined,
    hasMetadataKeys: boolean,
    isMetadataReady: boolean
  ) => FieldContextTypeGrouped<GE, GlobalFieldKey<GE>>['state']['displayConfig']
}

/**
 * Metadata-missing warnings and display-config resolution for entity forms.
 * Keeps notification + fieldDisplayConfig branching out of useFormFields (import-graph fan-out).
 */
export function useFormFieldsMetadataWarnings<GE extends GlobalEntityKey>(
  options: UseFormFieldsMetadataWarningsOptions<GE>
): UseFormFieldsMetadataWarningsReturn<GE> {
  const { entityKey } = options
  const { warning: showWarning } = useNotification()
  const warnedFields = ref<Set<string>>(new Set())

  return {
    warnedFields,
    warnMissingMetadataEntries: (fieldKeys, metadata, isMetadataReady): void => {
      warnMissingMetadataEntriesForFieldList(
        entityKey,
        fieldKeys,
        metadata,
        isMetadataReady,
        warnedFields,
        showWarning,
        (message, meta) => {
          logger.warn(message, meta)
        }
      )
    },
    getFieldDisplayConfig: (fieldKey, metadata, hasMetadataKeys, isMetadataReady) =>
      resolveDisplayConfigWithMetadataWarnings({
        entityKey,
        fieldKey,
        metadata,
        hasMetadataKeys,
        isMetadataReady,
        warnedFields,
        showWarning,
        logWarn: (message, meta) => {
          logger.warn(message, meta)
        },
      }),
  }
}
