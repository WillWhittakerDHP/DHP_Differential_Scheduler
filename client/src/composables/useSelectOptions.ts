/**
 * PATTERN: Select Options Composable

PATTERN: Composable that transforms entities ...
 */
import { computed } from 'vue'
import { useAdmin } from './admin/useAdmin'
import { createLogger } from '@/utils/logger'
import {
  buildSelectOptionsList,
  normalizeRawValueForSelect,
} from '@/utils/admin/selectOptionsNormalization'
import type {
  UseSelectOptionsOptions,
  UseSelectOptionsReturn,
} from '@/types/selectOptions'

export type {
  GroupedEntities,
  SelectOption,
  SelectOptionBase,
  UseSelectOptionsOptions,
  UseSelectOptionsReturn,
} from '@/types/selectOptions'

const logger = createLogger('useSelectOptions')

export function useSelectOptions(opts: UseSelectOptionsOptions): UseSelectOptionsReturn {
  const {
    filteredEntities,
    selectConfig,
    optionLabelKey,
    isMultiple,
    rawFieldValue,
    adminComp: providedAdminComp,
  } = opts

  const adminComp = providedAdminComp || useAdmin()

  const options = computed(() =>
    buildSelectOptionsList(
      filteredEntities.value,
      selectConfig.value,
      String(optionLabelKey.value),
      isMultiple.value,
      adminComp,
      logger
    )
  )

  const normalizedValue = computed(() =>
    normalizeRawValueForSelect(isMultiple.value, rawFieldValue.value)
  )

  return {
    options,
    normalizedValue,
  }
}
