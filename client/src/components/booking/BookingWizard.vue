<script setup lang="ts">
// PATTERN: Thin component; orchestration in useBookingWizardSetup (vue-architecture audit).
import { computed } from 'vue'
import { useBookingWizardSetup } from '@/composables/booking/useBookingWizardSetup'
import { buildQuoteLink } from '@/utils/booking/buildClientLinks'
import { useNotification } from '@/composables/useNotification'
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'

const {
  steps,
  activeStep,
  completedSteps: _completedSteps,
  isLastStep,
  handleNext,
  handlePrev,
  handleStepClick,
  isStepAccessible,
  stepSubtitles,
  getStepContent,
  isQuoteMode,
  toggleQuoteMode,
  wizardMode,
  useDhpColors,
  handleSubmit,
  isUpdateSubmit,
  isDevMode,
  fetchAll,
  create,
  update,
  isLoadingAppointment,
  handleLoadAppointment,
  loadedAppointmentId,
  stepItemClass,
  stepItemStyle,
} = useBookingWizardSetup()

const { success, error: showError } = useNotification()

/** When viewing an existing quote, show Copy quote link instead of Submit. */
const showCopyQuoteLink = computed(
  () => isQuoteMode.value && !!loadedAppointmentId.value && isLastStep.value
)

const submitButtonLabel = computed(() => {
  if (!isLastStep.value) return 'Next'
  if (create.isPending.value || update.isPending.value) return isUpdateSubmit.value ? 'Updating...' : 'Creating...'
  return isUpdateSubmit.value ? 'Update appointment' : 'Submit'
})

async function handleCopyQuoteLink(): Promise<void> {
  const id = loadedAppointmentId.value
  if (!id) return
  try {
    const url = buildQuoteLink(id)
    await window.navigator.clipboard.writeText(url)
    success(APPOINTMENTS_TABLE_UI.LINK_COPIED)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to copy link')
  }
}
</script>

<template>
  <VCard
    class="booking-wizard"
    :class="{
      'quote-mode-active': isQuoteMode && !useDhpColors,
      'reschedule-mode-active': wizardMode === 'reschedule' && !useDhpColors,
      'dhp-colors-active': useDhpColors,
    }"
  >
    
    <VContainer fluid class="pa-0">
      <VRow density="compact" class="wizard-layout">
        <!-- Stepper Header (Top) -->
        <VCol cols="12" class="stepper-column">
          <VCardText
            class="stepper-header"
            :class="{
              'quote-mode-active': isQuoteMode && !useDhpColors,
              'reschedule-mode-active': wizardMode === 'reschedule' && !useDhpColors,
              'dhp-colors-active': useDhpColors,
            }"
          >
            <VList class="horizontal-stepper" density="compact">
              <VListItem
                v-for="(step, index) in steps"
                :key="index"
                :class="stepItemClass(index)"
                :style="stepItemStyle(index)"
                @click="isStepAccessible(index) ? handleStepClick(index) : null"
              >
                <template #prepend>
                  <VAvatar
                    :color="index <= activeStep ? 'primary' : 'default'"
                    :variant="index === activeStep ? 'flat' : 'tonal'"
                    size="48"
                    rounded
                    class="stepper-avatar"
                  >
                    <span class="step-number">{{ index + 1 }}</span>
                  </VAvatar>
                </template>
                
                <!-- WHY: Shows only avatars during development for cleaner UI -->
                <!-- PATTERN: Conditional rendering based on devMode flag -->
                <VListItemTitle v-if="!isDevMode" class="stepper-title">
                  {{ step.title }}
                </VListItemTitle>
                <VListItemSubtitle v-if="!isDevMode" class="stepper-subtitle">
                  {{ stepSubtitles[index] }}
                </VListItemSubtitle>
              </VListItem>
            </VList>
            
            <!-- WHY: Quote mode toggle; brand colors are configured in Admin → Business Controls → Wizard -->
            <!-- PATTERN: VBtn with toggle state -->
            <VRow class="mt-4 align-center justify-center" density="compact">
              <VCol cols="auto">
                <VBtn
                  color="primary"
                  :variant="isQuoteMode ? 'flat' : 'outlined'"
                  prepend-icon="tabler-currency-dollar"
                  size="small"
                  @click="toggleQuoteMode"
                  class="quote-mode-button"
                >
                  {{ isQuoteMode ? 'I want to book' : 'I want a quote' }}
                </VBtn>
              </VCol>
              <VCol v-if="isDevMode" cols="auto" class="ml-2">
                <VBtn
                  color="secondary"
                  variant="outlined"
                  size="small"
                  prepend-icon="tabler-file-upload"
                  :loading="fetchAll.isLoading.value || isLoadingAppointment"
                  @click="handleLoadAppointment('random')"
                >
                  Load Random Appointment
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCol>

        <!-- Step Content (Below Stepper) -->
        <VCol cols="12" class="content-column">
          <VCardText class="step-content">
            <component :is="getStepContent(activeStep)" v-if="getStepContent(activeStep)" />
            
            <!-- Navigation Footer -->
            <div class="d-flex justify-space-between mt-6">
              <VBtn
                variant="tonal"
                color="secondary"
                :disabled="activeStep === 0"
                prepend-icon="tabler-arrow-left"
                @click="handlePrev"
              >
                Previous
              </VBtn>
              
              <div class="d-flex gap-3">
                <!-- ENACTMENT(Feature 7): Enable when authentication is implemented -->
                <VTooltip v-if="isLastStep" location="top">
                  <template #activator="{ props: tooltipProps }">
                    <div v-bind="tooltipProps">
                      <VBtn
                        variant="outlined"
                        color="warning"
                        prepend-icon="tabler-clock-pause"
                        disabled
                      >
                        Hold Slot
                      </VBtn>
                    </div>
                  </template>
                  <span>Hold requires authentication (Feature 7)</span>
                </VTooltip>

                <VBtn
                  v-if="showCopyQuoteLink"
                  color="primary"
                  prepend-icon="tabler-link"
                  @click="handleCopyQuoteLink"
                >
                  {{ APPOINTMENTS_TABLE_UI.COPY_QUOTE_LINK }}
                </VBtn>
                <VBtn
                  v-else
                  :color="isLastStep ? 'success' : 'primary'"
                  :prepend-icon="isLastStep ? 'tabler-check' : undefined"
                  :append-icon="!isLastStep ? 'tabler-arrow-right' : undefined"
                  :loading="isLastStep && (create.isPending.value || update.isPending.value)"
                  :disabled="isLastStep && (create.isPending.value || update.isPending.value)"
                  @click="isLastStep ? handleSubmit() : handleNext()"
                >
                  {{ submitButtonLabel }}
                </VBtn>
              </div>
            </div>
          </VCardText>
        </VCol>
      </VRow>
    </VContainer>
  </VCard>
</template>

<style scoped lang="scss" src="./BookingWizard.scss"></style>
