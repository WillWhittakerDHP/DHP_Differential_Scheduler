/**
 * WHY: Select Config Composable

WHY: Components should be thin UI wrappers - c...
 */
import { computed } from 'vue'
import { useAdmin } from '@/composables/admin/useAdmin'
import { createLogger } from '@/utils/logger'
import { useEntityMetadata } from './useEntityMetadata'
import {
  resolveSelectMultiple,
  resolveOptionEntityKey,
} from '@/utils/admin/selectTypeResolver'
import { resolveOptionLabelKey } from '@/utils/admin/selectConfigResolvers'
import type { FieldContextGroupedOptions } from '@/types/admin/fieldContextGroupedOptions'
import type { UseSelectConfigReturn } from '@/types/admin/selectConfig'
import {
  tryGetAdminEntityForSelect,
  pickFieldMetadataEntry,
  isEnumTypeSelectField,
  parseOptionsSelectConfigFromMeta,
  mapOptionsSelectToSelectOptions,
  computeMainSelectConfigValue,
  readAnnotationAssignmentSelect,
  readAttendeeSelect,
  selectChipsPropsForMultiple,
} from '@/utils/admin/selectConfigFromFieldMetadata'

const logger = createLogger('useSelectConfig')

const selectConfigLogger = {
  warn: (message: string, meta?: Record<string, unknown>): void => logger.warn(message, meta),
  error: (message: string, meta?: Record<string, unknown>): void => logger.error(message, meta),
  debug: (message: string, meta?: Record<string, unknown>): void => logger.debug(message, meta),
}

/**
 * WHY: Select Config Composable

WHY: Moves business logic out of components in...
 */
export function useSelectConfig(options: FieldContextGroupedOptions): UseSelectConfigReturn {
  const { fieldContext } = options
  const admin = useAdmin()
  const entityKeyStr = String(fieldContext.state.entityKey)
  const fieldKeyStr = String(fieldContext.state.fieldKey)

  const isMetadataLoaded = computed(() => admin.isMetadataLoaded.value)

  const entity = computed(() =>
    tryGetAdminEntityForSelect(
      admin.getEntity,
      fieldContext.state.entityKey,
      fieldContext.state.entityId,
      selectConfigLogger
    )
  )

  const { fieldMetadata } = useEntityMetadata(fieldContext.state.entityKey, entity)

  const fieldMetadataEntry = computed(() => pickFieldMetadataEntry(fieldMetadata.value, fieldKeyStr))

  const isEnumSelect = computed(() => isEnumTypeSelectField(entityKeyStr, fieldKeyStr))

  const optionsSelectConfig = computed(() =>
    parseOptionsSelectConfigFromMeta(fieldMetadataEntry.value, entityKeyStr, fieldKeyStr)
  )

  const isOptionsSelect = computed(() => Boolean(optionsSelectConfig.value))

  const optionsSelectOptions = computed(() => mapOptionsSelectToSelectOptions(optionsSelectConfig.value))

  const selectConfig = computed(() =>
    computeMainSelectConfigValue(
      isMetadataLoaded.value,
      fieldMetadataEntry.value,
      isEnumSelect.value,
      isOptionsSelect.value,
      entityKeyStr,
      fieldKeyStr,
      selectConfigLogger
    )
  )

  const isAnnotationAssignmentSelect = computed(() => readAnnotationAssignmentSelect(fieldMetadataEntry.value))

  const isAttendeeSelect = computed(() => readAttendeeSelect(fieldMetadataEntry.value))

  const isAccumulationLinksField = computed(
    () => entityKeyStr === 'blockInstance' && fieldKeyStr === 'accumulationLinks'
  )

  const isMultiple = computed(() => {
    // WHY: Accumulator links are a collection of time-characteristic gates, even if config is partial.
    if (isAccumulationLinksField.value) {
      return true
    }
    return resolveSelectMultiple(
      isEnumSelect.value,
      optionsSelectConfig.value,
      selectConfig.value,
      entityKeyStr,
      fieldKeyStr
    )
  })

  const chipsProps = computed(() => selectChipsPropsForMultiple(isMultiple.value))

  const optionEntityKey = computed(() =>
    resolveOptionEntityKey(
      isEnumSelect.value,
      isOptionsSelect.value,
      selectConfig.value,
      entityKeyStr,
      fieldKeyStr
    )
  )

  const optionLabelKey = computed(() => resolveOptionLabelKey())

  return {
    selectConfig,
    isEnumSelect,
    isOptionsSelect,
    optionsSelectOptions,
    isAnnotationAssignmentSelect,
    isAttendeeSelect,
    isMultiple,
    chipsProps,
    optionEntityKey,
    optionLabelKey,
  }
}
