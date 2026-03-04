<script setup lang="ts">
// PATTERN: Thin component; orchestration in useBookingWizardSetup (vue-architecture audit).
import { computed } from 'vue'
import { useBookingWizardSetup } from '@/composables/booking/useBookingWizardSetup'

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
  handleSubmit,
  isUpdateSubmit,
  isDevMode,
  fetchAll,
  create,
  update,
  isLoadingAppointment,
  handleLoadAppointment,
  stepItemClass,
  stepItemStyle,
} = useBookingWizardSetup()

const submitButtonLabel = computed(() => {
  if (!isLastStep.value) return 'Next'
  if (create.isPending.value || update.isPending.value) return isUpdateSubmit.value ? 'Updating...' : 'Creating...'
  return isUpdateSubmit.value ? 'Update appointment' : 'Submit'
})
</script>

<template>
  <VCard class="booking-wizard" :class="{ 'quote-mode-active': isQuoteMode }">
    
    <VContainer fluid class="pa-0">
      <VRow density="compact" class="wizard-layout">
        <!-- Stepper Header (Top) -->
        <VCol cols="12" class="stepper-column">
          <VCardText class="stepper-header" :class="{ 'quote-mode-active': isQuoteMode }">
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
            
            <!-- WHY: Allows users to toggle quote mode -->
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
