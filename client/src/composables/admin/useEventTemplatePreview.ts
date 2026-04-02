/**
 * WHY: Sample preview is always local; real preview calls internal API when an appointment is selected.
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { isAxiosError } from 'axios'
import { watchDebounced } from '@vueuse/core'
import { buildSampleInviteContextFromTemplateVariables } from '@shared/utils/buildSampleInviteContext'
import { resolveEventTemplates } from '@shared/utils/eventTemplateResolver'
import type { EventInstancePreviewResponseBody } from '@shared/types/eventInstancePreview'
import apiClient from '@/utils/api'
import { getEventInstancePreviewEndpoint } from '@/utils/api/eventInstancePreviewApi'
import { createLogger } from '@/utils/logger'
import type { EventInstanceTemplateStrings } from '@/types/admin/eventInstanceTemplateStrings'

const logger = createLogger('useEventTemplatePreview')

interface EventInstancePreviewDraftSlice extends EventInstanceTemplateStrings {
  eventShapeRef: string
  id?: string
}

interface UseEventTemplatePreviewParams {
  draft: Ref<EventInstancePreviewDraftSlice>
}

export interface UseEventTemplatePreviewReturn {
  samplePreview: ComputedRef<EventInstancePreviewResponseBody>
  selectedAppointmentId: Ref<string | null>
  realPreview: Ref<EventInstancePreviewResponseBody | null>
  realPreviewLoading: Ref<boolean>
  realPreviewError: Ref<string | null>
  refreshRealPreview: () => Promise<void>
}

export function useEventTemplatePreview(params: UseEventTemplatePreviewParams): UseEventTemplatePreviewReturn {
  const templates = computed(() => ({
    titleTemplate: params.draft.value.titleTemplate,
    descriptionTemplate: params.draft.value.descriptionTemplate,
    locationTemplate: params.draft.value.locationTemplate,
  }))

  const samplePreview = computed((): EventInstancePreviewResponseBody => {
    const ctx = buildSampleInviteContextFromTemplateVariables()
    return resolveEventTemplates(
      {
        titleTemplate: templates.value.titleTemplate,
        descriptionTemplate: templates.value.descriptionTemplate,
        locationTemplate: templates.value.locationTemplate,
      },
      ctx
    )
  })

  const selectedAppointmentId = ref<string | null>(null)
  const realPreview = ref<EventInstancePreviewResponseBody | null>(null)
  const realPreviewLoading = ref(false)
  const realPreviewError = ref<string | null>(null)

  async function refreshRealPreview(): Promise<void> {
    const appointmentId = selectedAppointmentId.value
    if (appointmentId == null || appointmentId === '') {
      realPreview.value = null
      realPreviewError.value = null
      return
    }

    const shapeRef = params.draft.value.eventShapeRef
    if (shapeRef === '') {
      realPreviewError.value = 'Select an event shape before real preview.'
      realPreview.value = null
      return
    }

    const eventInstanceId = params.draft.value.id
    if (eventInstanceId == null || eventInstanceId === '') {
      realPreview.value = null
      realPreviewError.value =
        'Save this event instance before real preview against an appointment (preview uses the stored segment).'
      return
    }

    realPreviewLoading.value = true
    realPreviewError.value = null
    try {
      const { data } = await apiClient.post<EventInstancePreviewResponseBody>(getEventInstancePreviewEndpoint(), {
        appointmentId,
        eventInstanceId,
        titleTemplate: templates.value.titleTemplate,
        descriptionTemplate: templates.value.descriptionTemplate,
        locationTemplate: templates.value.locationTemplate,
      })
      realPreview.value = data
    } catch (e) {
      logger.warn('Real event instance preview request failed', { error: e })
      let message = 'Real preview failed'
      if (isAxiosError(e)) {
        const data = e.response?.data as { error?: string } | undefined
        message = typeof data?.error === 'string' ? data.error : e.message
      } else if (e instanceof Error) {
        message = e.message
      }
      realPreviewError.value = message
      realPreview.value = null
    } finally {
      realPreviewLoading.value = false
    }
  }

  watchDebounced(
    () => params.draft.value,
    () => {
      void refreshRealPreview()
    },
    { debounce: 400, maxWait: 2000, deep: true, immediate: true }
  )

  watchDebounced(
    selectedAppointmentId,
    () => {
      void refreshRealPreview()
    },
    { debounce: 200, immediate: true }
  )

  return {
    samplePreview,
    selectedAppointmentId,
    realPreview,
    realPreviewLoading,
    realPreviewError,
    refreshRealPreview,
  }
}
