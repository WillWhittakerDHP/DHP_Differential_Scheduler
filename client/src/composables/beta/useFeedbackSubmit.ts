/**
 */
import { ref, reactive, watch } from 'vue'
import type { VForm } from 'vuetify/components'
import { betaFeedback } from '@/utils/beta/betaFeedback'
import { captureBrowserContext } from '@/utils/beta/captureBrowserContext'
import { useNotification } from '@/composables/useNotification'
import type { Ref } from 'vue'
import type { FeedbackCategory, FeedbackSeverity } from '@/types/betaFeedback'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useFeedbackSubmit')

export interface UseFeedbackSubmitOptions {
  modelValue: () => boolean
  onClose: () => void
}

export interface UseFeedbackSubmitReturn {
  formRef: Ref<InstanceType<typeof VForm> | null>
  form: {
    reporterName: string
    reporterEmail: string
    category: FeedbackCategory
    severity: FeedbackSeverity
    title: string
    description: string
    tags: string[]
    stepsToReproduce: string
    expectedBehavior: string
    actualBehavior: string
  }
  sending: Ref<boolean>
  submitError: Ref<string>
  handleSubmit: () => Promise<void>
}

export function useFeedbackSubmit(options: UseFeedbackSubmitOptions): UseFeedbackSubmitReturn {
  const { submitFeedback } = betaFeedback()
  const { success, error: showError } = useNotification()
  const formRef = ref<InstanceType<typeof VForm> | null>(null)
  const sending = ref(false)
  const submitError = ref('')

  const form = reactive({
    reporterName: '',
    reporterEmail: '',
    category: 'general' as FeedbackCategory,
    severity: 'medium' as FeedbackSeverity,
    title: '',
    description: '',
    tags: [] as string[],
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
  })

  watch(
    () => options.modelValue(),
    (isOpen) => {
      if (isOpen) submitError.value = ''
    }
  )

  async function handleSubmit(): Promise<void> {
    const valid = await formRef.value?.validate()
    if (!valid?.valid) return
    submitError.value = ''
    sending.value = true
    try {
      const { pageUrl, browserInfo, screenSize } = captureBrowserContext()
      await submitFeedback({
        reporterName: form.reporterName.trim(),
        reporterEmail: form.reporterEmail?.trim() || undefined,
        category: form.category,
        severity: form.severity,
        title: form.title.trim(),
        description: form.description.trim(),
        pageUrl: pageUrl || undefined,
        browserInfo: browserInfo || undefined,
        screenSize: screenSize || undefined,
        stepsToReproduce:
          form.category === 'bug' && form.stepsToReproduce?.trim()
            ? form.stepsToReproduce.trim()
            : undefined,
        expectedBehavior:
          form.category === 'bug' && form.expectedBehavior?.trim()
            ? form.expectedBehavior.trim()
            : undefined,
        actualBehavior:
          form.category === 'bug' && form.actualBehavior?.trim()
            ? form.actualBehavior.trim()
            : undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
      })
      success('Thank you! Your feedback has been submitted.')
      options.onClose()
      form.reporterName = ''
      form.reporterEmail = ''
      form.title = ''
      form.description = ''
      form.tags = []
      form.stepsToReproduce = ''
      form.expectedBehavior = ''
      form.actualBehavior = ''
    } catch (err) {
      logger.error('Failed to submit feedback', { err })
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : null
      submitError.value = message || 'Failed to submit feedback. Please try again.'
      showError(submitError.value)
    } finally {
      sending.value = false
    }
  }

  return {
    formRef,
    form,
    sending,
    submitError,
    handleSubmit,
  }
}
