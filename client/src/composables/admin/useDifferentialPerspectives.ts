import { computed, type ComputedRef, type WritableComputedRef } from 'vue'
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { useGlobal } from '@/composables/useGlobal'
import { getAllUserTypeBlockIds } from '@/utils/eventAttendeeUtils'
import { BUSINESS_CONTROLS_TAB_STRINGS } from '@/configs/businessControlsTabStrings'
import type { UseDifferentialPerspectivesParams } from '@/types/availabilitySettingsParams'

export type { UseDifferentialPerspectivesParams }

const DEFAULTS = BUSINESS_CONTROLS_TAB_STRINGS.defaults

export function useDifferentialPerspectives(params: UseDifferentialPerspectivesParams): {
  availableUserTypeBlocks: ComputedRef<{ id: GlobalEntityId; title: string; value: GlobalEntityId }[]>
  majorAttendees: WritableComputedRef<GlobalEntityId[]>
  minorAttendees: WritableComputedRef<GlobalEntityId[]>
  majorLabel: WritableComputedRef<string>
  minorLabel: WritableComputedRef<string>
  differentialGraphDefaultLabel: WritableComputedRef<string>
  moveableFallbackLabel: WritableComputedRef<string>
  majorStateLabel: WritableComputedRef<string>
  minorStateLabel: WritableComputedRef<string>
  subStepLabelPickDay: WritableComputedRef<string>
  subStepLabelOptions: WritableComputedRef<string>
  subStepLabelPickTime: WritableComputedRef<string>
  subStepLabelConfirmMoveable: WritableComputedRef<string>
} {
  const { formData, wizardFormData } = params
  const { getGlobalData, getGlobalEntities } = useGlobal()

  const availableUserTypeBlocks = computed(() => {
    const globalData = getGlobalData()
    if (!globalData) return []

    const userTypeBlockIds = getAllUserTypeBlockIds(globalData)
    const blockInstances = getGlobalEntities('blockInstance')

    return userTypeBlockIds
      .map((id) => blockInstances.find((bi) => bi.id === id))
      .filter((bi): bi is NonNullable<typeof bi> => bi !== undefined)
      .map((bi) => ({
        id: bi.id,
        title: bi.name ?? `Block ${bi.id}`,
        value: bi.id
      }))
  })

  const ensureDifferentialPerspectives = (): NonNullable<AvailabilitySettings['differentialPerspectives']> => {
    if (!formData.value) return {}
    if (!formData.value.differentialPerspectives) {
      formData.value.differentialPerspectives = {}
    }
    return formData.value.differentialPerspectives
  }

  const majorAttendees = computed({
    get: () => formData.value?.differentialPerspectives?.majorAttendees ?? [],
    set: (value: GlobalEntityId[]) => {
      ensureDifferentialPerspectives()
      if (formData.value?.differentialPerspectives) {
        formData.value.differentialPerspectives.majorAttendees = value
      }
    }
  })

  const minorAttendees = computed({
    get: () => formData.value?.differentialPerspectives?.minorAttendees ?? [],
    set: (value: GlobalEntityId[]) => {
      ensureDifferentialPerspectives()
      if (formData.value?.differentialPerspectives) {
        formData.value.differentialPerspectives.minorAttendees = value
      }
    }
  })

  const majorLabel = computed({
    get: () =>
      wizardFormData?.value?.majorLabel ??
      formData.value?.differentialPerspectives?.majorLabel ??
      DEFAULTS.majorLabel,
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.majorLabel = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.majorLabel = value
        }
      }
    }
  })

  const minorLabel = computed({
    get: () =>
      wizardFormData?.value?.minorLabel ??
      formData.value?.differentialPerspectives?.minorLabel ??
      DEFAULTS.minorLabel,
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.minorLabel = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.minorLabel = value
        }
      }
    }
  })

  const differentialGraphDefaultLabel = computed({
    get: () =>
      wizardFormData?.value?.differentialGraphDefaultLabel ??
      formData.value?.differentialPerspectives?.differentialGraphDefaultLabel ??
      DEFAULTS.differentialGraphDefaultLabel,
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.differentialGraphDefaultLabel = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.differentialGraphDefaultLabel = value
        }
      }
    }
  })

  const moveableFallbackLabel = computed({
    get: () =>
      wizardFormData?.value?.moveableFallbackLabel ??
      formData.value?.differentialPerspectives?.moveableFallbackLabel ??
      DEFAULTS.moveableFallbackLabel,
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.moveableFallbackLabel = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.moveableFallbackLabel = value
        }
      }
    }
  })

  const majorStateLabel = computed({
    get: () =>
      wizardFormData?.value?.majorStateLabel ??
      formData.value?.differentialPerspectives?.majorStateLabel ??
      '',
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.majorStateLabel = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.majorStateLabel = value
        }
      }
    }
  })

  const minorStateLabel = computed({
    get: () =>
      wizardFormData?.value?.minorStateLabel ??
      formData.value?.differentialPerspectives?.minorStateLabel ??
      '',
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.minorStateLabel = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.minorStateLabel = value
        }
      }
    }
  })

  const subStepLabelPickDay = computed({
    get: () =>
      wizardFormData?.value?.subStepLabelPickDay ??
      formData.value?.differentialPerspectives?.subStepLabelPickDay ??
      DEFAULTS.subStepLabelPickDay,
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.subStepLabelPickDay = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.subStepLabelPickDay = value
        }
      }
    }
  })

  const subStepLabelOptions = computed({
    get: () =>
      wizardFormData?.value?.subStepLabelOptions ??
      formData.value?.differentialPerspectives?.subStepLabelOptions ??
      DEFAULTS.subStepLabelOptions,
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.subStepLabelOptions = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.subStepLabelOptions = value
        }
      }
    }
  })

  const subStepLabelPickTime = computed({
    get: () =>
      wizardFormData?.value?.subStepLabelPickTime ??
      formData.value?.differentialPerspectives?.subStepLabelPickTime ??
      DEFAULTS.subStepLabelPickTime,
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.subStepLabelPickTime = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.subStepLabelPickTime = value
        }
      }
    }
  })

  const subStepLabelConfirmMoveable = computed({
    get: () =>
      wizardFormData?.value?.subStepLabelConfirmMoveable ??
      formData.value?.differentialPerspectives?.subStepLabelConfirmMoveable ??
      DEFAULTS.subStepLabelConfirmMoveable,
    set: (value: string) => {
      if (wizardFormData?.value) {
        wizardFormData.value.subStepLabelConfirmMoveable = value
      } else {
        ensureDifferentialPerspectives()
        if (formData.value?.differentialPerspectives) {
          formData.value.differentialPerspectives.subStepLabelConfirmMoveable = value
        }
      }
    }
  })

  return {
    availableUserTypeBlocks,
    majorAttendees,
    minorAttendees,
    majorLabel,
    minorLabel,
    differentialGraphDefaultLabel,
    moveableFallbackLabel,
    majorStateLabel,
    minorStateLabel,
    subStepLabelPickDay,
    subStepLabelOptions,
    subStepLabelPickTime,
    subStepLabelConfirmMoveable
  }
}
