/**
 * WHY: Orchestration composable for BookingWizard.vue to keep component script thin (vue-architecture audit).
 * PATTERN: Encapsulates all wizard composable wiring and returns only what the template needs.
 */
import { computed, provide, onMounted, onBeforeUnmount } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'
import { useAppointment } from '@/composables/useAppointment'
import { useProperty } from '@/composables/useProperty'
import { useUser } from '@/composables/useUser'
import { useNotification } from '@/composables/useNotification'
import { useWizardNavigation } from '@/composables/booking/useWizardNavigation'
import { useWizardStepValidation } from '@/composables/booking/useWizardStepValidation'
import { useAppointmentDataCollection } from '@/utils/booking/appointmentDataCollection'
import { useWizardDisplay } from '@/composables/booking/useWizardDisplay'
import { useWizardStepContent } from '@/composables/booking/useWizardStepContent'
import { useWizardSubmission } from '@/composables/booking/useWizardSubmission'
import { useThemeMode } from '@/composables/useThemeMode'
import { WIZARD_STEPS } from '@/configs/wizardSteps'
import { useAppointmentLoader } from '@/composables/booking/useAppointmentLoader'
import { useWizardStepDataRefs } from '@/composables/booking/useWizardStepDataRefs'
import { useWizardValidationErrors } from '@/composables/booking/useWizardValidationErrors'
import { useWizardAppointmentManagement } from '@/composables/booking/useWizardAppointmentManagement'
import { createWizardAppointmentRefs } from '@/utils/booking/wizardAppointmentHandlerBuilders'
import { useAppointmentDropdown } from '@/composables/booking/useAppointmentDropdown'
import { useWizardDevMode } from '@/composables/booking/useWizardDevMode'
import { isDevModeEnabled } from '@/utils/env/devMode'
import { useWizardDateAvailability } from '@/composables/booking/useWizardDateAvailability'
import { wizardKey, loadedWizardStateKey, bookingFlowReadyKey } from '@/keys/bookingInjectionKeys'
import { resetBookingWizardSettingsSingleton } from '@/composables/booking/useBookingWizardSettingsSingleton'
import { useBookingFlow } from '@/composables/booking/useBookingFlow'
import type { UseBookingWizardReturn } from '@/types/wizard'
import { useConfirmationStepData } from '@/composables/booking/useConfirmationStepData'
import {
  useBookingProgressSummaryStrip,
  type UseBookingProgressSummaryStripReturn,
} from '@/composables/booking/useBookingProgressSummaryStrip'
import { resolveBookingWizardLogoUrl } from '@/utils/booking/resolveBookingWizardLogoUrl'
import { createLogger } from '@/utils/logger'

const wizardLogoLogger = createLogger('useBookingWizardSetup')

export interface UseBookingWizardSetupReturn {
  steps: typeof WIZARD_STEPS
  activeStep: ReturnType<typeof useWizardNavigation>['activeStep']
  completedSteps: ReturnType<typeof useWizardNavigation>['completedSteps']
  isLastStep: ReturnType<typeof useWizardNavigation>['isLastStep']
  handleNext: ReturnType<typeof useWizardValidationErrors>['handleNext']
  handlePrev: ReturnType<typeof useWizardNavigation>['handlePrev']
  handleStepClick: ReturnType<typeof useWizardNavigation>['handleStepClick']
  isStepAccessible: ReturnType<typeof useWizardNavigation>['isStepAccessible']
  stepSubtitles: ReturnType<typeof useWizardDisplay>['stepSubtitles']
  getStepContent: ReturnType<typeof useWizardStepContent>['getStepContent']
  isQuoteMode: ComputedRef<boolean>
  toggleQuoteMode: () => void
  wizardMode: Ref<import('@/types/wizard').WizardMode>
  /** From `bookingFlow.wizardSettings.flags`; configured in Admin Wizard tab. */
  useDhpColors: ComputedRef<boolean>
  /** Resolved href for header logo, or null when unset / not loadable in booking shell. */
  wizardLogoSrc: ComputedRef<string | null>
  handleWizardLogoError: () => void
  handleSubmit: ReturnType<typeof useWizardSubmission>['handleSubmit']
  isUpdateSubmit: ReturnType<typeof useWizardSubmission>['isUpdateSubmit']
  isDevMode: boolean
  fetchAll: ReturnType<typeof useAppointment>['fetchAll']
  create: ReturnType<typeof useAppointment>['create']
  update: ReturnType<typeof useAppointment>['update']
  isLoadingAppointment: ReturnType<typeof useWizardAppointmentManagement>['isLoadingAppointment']
  loadedAppointmentId: ReturnType<typeof useWizardAppointmentManagement>['loadedAppointmentId']
  handleLoadAppointment: ReturnType<typeof useWizardAppointmentManagement>['handleLoadAppointment']
  handleUpdateAppointment: ReturnType<typeof useWizardAppointmentManagement>['handleUpdateAppointment']
  stepItemClass: (index: number) => (string | Record<string, boolean>)[]
  stepItemStyle: (index: number) => { cursor: string; opacity: number }
  progressSummaryStrip: UseBookingProgressSummaryStripReturn
}

export function useBookingWizardSetup(): UseBookingWizardSetupReturn {
  const bookingFlow = useBookingFlow()
  provide(bookingFlowReadyKey, bookingFlow.isBookingFlowReady)

  const wizardGrouped = useBookingWizard()
  const wizard: UseBookingWizardReturn = {
    ...wizardGrouped.state,
    ...wizardGrouped.actions,
    ...wizardGrouped.computed,
  }
  provide(wizardKey, wizard)

  onBeforeUnmount(() => {
    resetBookingWizardSettingsSingleton()
  })

  const steps = WIZARD_STEPS
  const stepDataRefs = useWizardStepDataRefs()
  const { validateStep } = useWizardStepValidation({ stepDataRefs, wizard })

  const { error: showError, success } = useNotification()

  const {
    activeStep,
    completedSteps,
    isLastStep,
    handleNext: baseHandleNext,
    handlePrev,
    handleStepClick: baseHandleStepClick,
    getStepState,
    isStepAccessible,
  } = useWizardNavigation({ steps, validateStep, showError })

  const { handleNext } = useWizardValidationErrors({
    activeStep,
    validateStep,
    baseHandleNext,
    showError,
    propertyDetailsStepData: stepDataRefs.propertyDetailsStepData,
    propertyDetailsStepValidate: stepDataRefs.propertyDetailsStepValidate,
    propertyDetailsFieldErrors: stepDataRefs.propertyDetailsFieldErrors,
    contactsStepValidate: stepDataRefs.contactsStepValidate,
    availabilityStepValidate: stepDataRefs.availabilityStepValidate,
    selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
  })

  const handleStepClick = baseHandleStepClick

  const wizardAppointmentRefs = createWizardAppointmentRefs()

  const { create, update, fetchAll, fetchRandom } = useAppointment()
  const { loadAppointmentById } = useAppointmentLoader()
  const { create: createProperty } = useProperty()
  const { create: createUser } = useUser()
  const { bookingData } = bookingFlow
  const { appointmentDropdownItems } = useAppointmentDropdown({ fetchAll })

  const { summaryData, priceData } = useConfirmationStepData({
    wizard: {
      selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
      selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
      selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
      selectedLineItemBlocks: wizard.selectedLineItemBlocks,
      selectedUserTypeBlock: wizard.selectedUserTypeBlock,
    },
    propertyDetailsStepData: stepDataRefs.propertyDetailsStepData,
    availabilityStepData: stepDataRefs.availabilityStepData,
    bookingData,
  })

  const progressSummaryStrip = useBookingProgressSummaryStrip({
    activeStep,
    summaryData,
    priceData,
    selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
  })

  const { collectAppointmentData } = useAppointmentDataCollection({
    wizard: {
      selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
      selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks,
      selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks,
      selectedCouponBlocks: wizard.selectedCouponBlocks,
      selectedLineItemBlocks: wizard.selectedLineItemBlocks,
      selectedUserTypeBlock: wizard.selectedUserTypeBlock,
      isQuoteMode: wizard.isQuoteMode,
      wizardMode: wizard.wizardMode,
    },
    propertyDetailsStepData: stepDataRefs.propertyDetailsStepData,
    contactsStepData: stepDataRefs.contactsStepData,
    availabilityStepData: stepDataRefs.availabilityStepData,
    createProperty,
    createUser,
    showError,
    loadedAppointmentStatus: wizardAppointmentRefs.loadedAppointmentStatus,
  })

  const {
    loadedWizardState,
    loadedAppointmentId,
    currentAppointmentId,
    selectedAppointmentId,
    isLoadingAppointment,
    handleLoadAppointment,
    handleUpdateAppointment,
    handleResetWizard,
  } = useWizardAppointmentManagement(
    {
      ...stepDataRefs,
      wizard,
      bookingData,
      loadAppointmentById,
      fetchRandom,
      collectAppointmentData,
      // @audit-allow:hardcoding:fieldMapping - pass TanStack mutation handles into appointment management composable
      updateAppointment: { mutateAsync: update.mutateAsync, isPending: update.isPending },
      activeStep,
      completedSteps,
      showError,
      success,
    },
    wizardAppointmentRefs
  )

  provide(loadedWizardStateKey, loadedWizardState)

  const route = useRoute()
  const router = useRouter()
  onMounted(() => {
    const loadId = route.query.loadAppointmentId as string | undefined
    const mode = route.query.mode as string | undefined
    if (loadId && (mode === 'quote' || mode === 'reschedule')) {
      void handleLoadAppointment(loadId).then(() => {
        if (mode === 'quote') wizard.setWizardMode('quote')
        router.replace({ path: '/booking' })
      })
    }
  })

  const { stepSubtitles } = useWizardDisplay({
    steps,
    selectedServiceTypeBlocks: wizard.selectedServiceTypeBlocks,
    loadedWizardState,
  })

  const { getStepContent } = useWizardStepContent()

  const {
    flags: {
      useBrandColors: useDhpBrandColors,
      brandPrimaryHex,
      brandSecondaryHex,
      logoUrl: wizardLogoUrl,
      brandModePaletteDeltas,
      brandWarningPaletteAdjusters,
    },
  } = bookingFlow.wizardSettings

  const wizardLogoSrc = computed(() => resolveBookingWizardLogoUrl(wizardLogoUrl.value))

  function handleWizardLogoError(): void {
    wizardLogoLogger.warn('Booking wizard logo image failed to load (src hidden from user)')
  }

  useThemeMode({
    wizard,
    useDhpColors: useDhpBrandColors,
    brandPrimaryHex,
    brandSecondaryHex,
    brandModePaletteDeltas,
    brandWarningPaletteAdjusters,
  })

  const isQuoteMode = computed(() => wizard.isQuoteMode.value)
  const toggleQuoteMode = (): void => {
    wizard.setWizardMode(wizard.wizardMode.value === 'quote' ? 'new' : 'quote')
  }

  const { handleSubmit, isUpdateSubmit } = useWizardSubmission({
    collectAppointmentData,
    createAppointment: create,
    currentAppointmentId,
    // @audit-allow:hardcoding:fieldMapping - pass TanStack mutation handle into submission composable
    updateAppointment: { mutateAsync: update.mutateAsync },
    activeStep,
    completedSteps,
    showError,
    success,
  })

  void useWizardDateAvailability({ stepDataRefs, activeStep, currentAppointmentId })

  const isDevMode = isDevModeEnabled()
  useWizardDevMode({
    wizard,
    isDevMode,
    selectedAppointmentId,
    appointmentDropdownItems,
    loadedAppointmentId,
    isLoadingAppointment,
    fetchAll,
    handleLoadAppointment,
    handleUpdateAppointment,
    handleResetWizard,
    // @audit-allow:hardcoding:fieldMapping - expose update pending flag for dev mode UI
    updateAppointment: { isPending: update.isPending },
  })

  const stepItemClass = (index: number): (string | Record<string, boolean>)[] => [
    'stepper-item',
    getStepState(index),
    { 'step-disabled': !isStepAccessible(index) },
  ]
  const stepItemStyle = (index: number): { cursor: string; opacity: number } => {
    const accessible = isStepAccessible(index)
    return { cursor: accessible ? 'pointer' : 'not-allowed', opacity: accessible ? 1 : 0.5 }
  }

  return {
    steps,
    activeStep,
    completedSteps,
    isLastStep,
    handleNext,
    handlePrev,
    handleStepClick,
    isStepAccessible,
    stepSubtitles,
    getStepContent,
    isQuoteMode,
    toggleQuoteMode,
    wizardMode: wizard.wizardMode,
    useDhpColors: useDhpBrandColors,
    wizardLogoSrc,
    handleWizardLogoError,
    handleSubmit,
    isUpdateSubmit,
    isDevMode,
    fetchAll,
    create,
    update,
    isLoadingAppointment,
    loadedAppointmentId,
    handleLoadAppointment,
    handleUpdateAppointment,
    stepItemClass,
    stepItemStyle,
    progressSummaryStrip,
  }
}
