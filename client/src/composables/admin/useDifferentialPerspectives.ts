import { computed, type ComputedRef, type WritableComputedRef } from 'vue'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { useGlobal } from '@/composables/useGlobal'
import { buildDifferentialAttendeeSelectItems } from '@/utils/admin/buildDifferentialAttendeeSelectItems'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import type { UseDifferentialPerspectivesParams } from '@/types/availabilitySettingsParams'
import {
  ensureDifferentialPerspectivesBucket,
  readWizardOrFormLabel,
  writeWizardOrFormLabel,
  type DifferentialLabelKey,
} from '@/utils/admin/differentialPerspectiveBindings'

export type { UseDifferentialPerspectivesParams }

const DEFAULTS = BUSINESS_CONTROLS_TAB_STRINGS.defaults

export interface UseDifferentialPerspectivesReturn {
  availableUserTypeBlocks: ComputedRef<{ id: GlobalEntityId; title: string; value: GlobalEntityId }[]>
  majorAttendees: WritableComputedRef<GlobalEntityId[]>
  minorAttendees: WritableComputedRef<GlobalEntityId[]>
  majorLabel: WritableComputedRef<string>
  minorLabel: WritableComputedRef<string>
  differentialGraphDefaultLabel: WritableComputedRef<string>
  minimizerFallbackLabel: WritableComputedRef<string>
  majorStateLabel: WritableComputedRef<string>
  minorStateLabel: WritableComputedRef<string>
  subStepLabelPickDay: WritableComputedRef<string>
  subStepLabelOptions: WritableComputedRef<string>
  subStepLabelPickTime: WritableComputedRef<string>
  subStepLabelConfirmMinimizer: WritableComputedRef<string>
  minimizerNoFeasibleCompletionSlotsMessage: WritableComputedRef<string>
}

export function useDifferentialPerspectives(params: UseDifferentialPerspectivesParams): UseDifferentialPerspectivesReturn {
  const { formData, wizardFormData } = params
  const { getGlobalData } = useGlobal()

  const availableUserTypeBlocks = computed(() => {
    const globalData = getGlobalData()
    if (!globalData) {
      return []
    }
    const major = formData.value?.differentialPerspectives?.majorAttendees ?? []
    const minor = formData.value?.differentialPerspectives?.minorAttendees ?? []
    const selectedIds = [...major, ...minor]
    return buildDifferentialAttendeeSelectItems(globalData, selectedIds)
  })

  const majorAttendees = computed({
    get: () => formData.value?.differentialPerspectives?.majorAttendees ?? [],
    set: (value: GlobalEntityId[]) => {
      const dp = ensureDifferentialPerspectivesBucket(formData)
      if (dp) {
        dp.majorAttendees = value
      }
    },
  })

  const minorAttendees = computed({
    get: () => formData.value?.differentialPerspectives?.minorAttendees ?? [],
    set: (value: GlobalEntityId[]) => {
      const dp = ensureDifferentialPerspectivesBucket(formData)
      if (dp) {
        dp.minorAttendees = value
      }
    },
  })

  const labelRef = (key: DifferentialLabelKey, defaultValue: string): WritableComputedRef<string> =>
    computed({
      get: () =>
        readWizardOrFormLabel(wizardFormData?.value, formData.value?.differentialPerspectives, key, defaultValue),
      set: (value: string) => writeWizardOrFormLabel(wizardFormData, formData, key, value),
    })

  const majorLabel = labelRef('majorLabel', DEFAULTS.majorLabel)
  const minorLabel = labelRef('minorLabel', DEFAULTS.minorLabel)
  const differentialGraphDefaultLabel = labelRef('differentialGraphDefaultLabel', DEFAULTS.differentialGraphDefaultLabel)
  const minimizerFallbackLabel = labelRef('minimizerFallbackLabel', DEFAULTS.minimizerFallbackLabel)
  const majorStateLabel = labelRef('majorStateLabel', '')
  const minorStateLabel = labelRef('minorStateLabel', '')
  const subStepLabelPickDay = labelRef('subStepLabelPickDay', DEFAULTS.subStepLabelPickDay)
  const subStepLabelOptions = labelRef('subStepLabelOptions', DEFAULTS.subStepLabelOptions)
  const subStepLabelPickTime = labelRef('subStepLabelPickTime', DEFAULTS.subStepLabelPickTime)
  const subStepLabelConfirmMinimizer = labelRef('subStepLabelConfirmMinimizer', DEFAULTS.subStepLabelConfirmMinimizer)
  const minimizerNoFeasibleCompletionSlotsMessage = labelRef(
    'minimizerNoFeasibleCompletionSlotsMessage',
    DEFAULTS.minimizerNoFeasibleCompletionSlotsMessage
  )

  return {
    availableUserTypeBlocks,
    majorAttendees,
    minorAttendees,
    majorLabel,
    minorLabel,
    differentialGraphDefaultLabel,
    minimizerFallbackLabel,
    majorStateLabel,
    minorStateLabel,
    subStepLabelPickDay,
    subStepLabelOptions,
    subStepLabelPickTime,
    subStepLabelConfirmMinimizer,
    minimizerNoFeasibleCompletionSlotsMessage,
  }
}
