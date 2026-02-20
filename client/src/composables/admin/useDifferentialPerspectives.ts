/**
 * Composable for differential perspectives (major/minor attendees and labels)
 * WHY: Extracts differential form bindings from BusinessControlsTab
 * PATTERN: Writable computeds that ensure differentialPerspectives exists on set
 * @audit-allow loop-mutation:assignProp - Vue reactive form pattern (writable computed setters)
 */
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
  majorStateLabel: WritableComputedRef<string>
  minorStateLabel: WritableComputedRef<string>
} {
  const { formData } = params
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
    get: () => formData.value?.differentialPerspectives?.majorLabel ?? DEFAULTS.majorLabel,
    set: (value: string) => {
      ensureDifferentialPerspectives()
      if (formData.value?.differentialPerspectives) {
        formData.value.differentialPerspectives.majorLabel = value
      }
    }
  })

  const minorLabel = computed({
    get: () => formData.value?.differentialPerspectives?.minorLabel ?? DEFAULTS.minorLabel,
    set: (value: string) => {
      ensureDifferentialPerspectives()
      if (formData.value?.differentialPerspectives) {
        formData.value.differentialPerspectives.minorLabel = value
      }
    }
  })

  const differentialGraphDefaultLabel = computed({
    get: () =>
      formData.value?.differentialPerspectives?.differentialGraphDefaultLabel ??
      DEFAULTS.differentialGraphDefaultLabel,
    set: (value: string) => {
      ensureDifferentialPerspectives()
      if (formData.value?.differentialPerspectives) {
        formData.value.differentialPerspectives.differentialGraphDefaultLabel = value
      }
    }
  })

  const majorStateLabel = computed({
    get: () => formData.value?.differentialPerspectives?.majorStateLabel ?? '',
    set: (value: string) => {
      ensureDifferentialPerspectives()
      if (formData.value?.differentialPerspectives) {
        formData.value.differentialPerspectives.majorStateLabel = value
      }
    }
  })

  const minorStateLabel = computed({
    get: () => formData.value?.differentialPerspectives?.minorStateLabel ?? '',
    set: (value: string) => {
      ensureDifferentialPerspectives()
      if (formData.value?.differentialPerspectives) {
        formData.value.differentialPerspectives.minorStateLabel = value
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
    majorStateLabel,
    minorStateLabel
  }
}
