/**
 * WHY: Component-logic audit - move watch and async handleSave out of BetaFeedbackDetailModal.
 */
import { ref, watch } from 'vue'
import type { BetaFeedback, FeedbackStatus } from '@/types/betaFeedback'
import { betaFeedback } from '@/utils/beta/betaFeedback'
import { useNotification } from '@/composables/useNotification'
import { createLogger } from '@/utils/logger'
import { asEmptyString } from '@/utils/safeDefaults'

const logger = createLogger('BetaFeedbackDetailModal')

export function useFeedbackDetail(
  getFeedback: () => BetaFeedback | null,
  emit: { (e: 'update:modelValue', value: boolean): void; (e: 'saved'): void }
): {
  localStatus: ReturnType<typeof ref<FeedbackStatus>>
  localResolutionNotes: ReturnType<typeof ref<string>>
  saving: ReturnType<typeof ref<boolean>>
  saveError: ReturnType<typeof ref<string>>
  handleSave: () => Promise<void>
} {
  const { updateFeedback } = betaFeedback()
  const { success, error: showError } = useNotification()
  const localStatus = ref<FeedbackStatus>('new')
  const localResolutionNotes = ref('')
  const saving = ref(false)
  const saveError = ref('')

  watch(
    getFeedback,
    (f) => {
      if (f) {
        localStatus.value = f.status
        localResolutionNotes.value = asEmptyString(f.resolutionNotes)
        saveError.value = ''
      }
    },
    { immediate: true }
  )

  async function handleSave(): Promise<void> {
    const feedback = getFeedback()
    if (!feedback) return
    saving.value = true
    saveError.value = ''
    try {
      await updateFeedback(feedback.id, {
        status: localStatus.value,
        resolutionNotes: localResolutionNotes.value || null,
      })
      success('Feedback updated')
      emit('saved')
      emit('update:modelValue', false)
    } catch (err) {
      logger.error('Failed to update feedback', { err })
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : null
      saveError.value = message || 'Failed to update feedback'
      showError(saveError.value)
    } finally {
      saving.value = false
    }
  }

  return {
    localStatus,
    localResolutionNotes,
    saving,
    saveError,
    handleSave,
  }
}
