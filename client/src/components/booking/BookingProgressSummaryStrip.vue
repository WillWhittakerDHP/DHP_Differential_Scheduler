<script setup lang="ts">
import { computed } from 'vue'
import type { PriceData } from '@/types/wizardStepData'
import { useWizardSettings } from '@/composables/admin/useWizardSettings'
import BookingWizardPriceDetailsMenu from '@/components/booking/BookingWizardPriceDetailsMenu.vue'

const props = defineProps<{
  stripVisible: boolean
  showAddress: boolean
  showPrice: boolean
  showSlot: boolean
  showFeeDetails: boolean
  serviceLine: string
  addressLine: string
  feePreviewLabel: string
  slotLines: string[]
  priceData: PriceData
}>()

const {
  flags: { showApplyCoupon },
} = useWizardSettings()

const showAddressRow = computed(
  () => props.showAddress && props.addressLine !== ''
)

const showSlotBlock = computed(() => props.showSlot && props.slotLines.length > 0)
</script>

<template>
  <div
    v-if="stripVisible"
    class="booking-progress-summary-strip"
    role="region"
    aria-label="Booking progress"
  >
    <div class="booking-progress-summary-strip__inner">
      <div class="text-body-medium font-weight-medium text-high-emphasis booking-progress-summary-strip__service">
        {{ serviceLine }}
      </div>
      <div
        v-if="showAddressRow"
        class="text-body-medium text-medium-emphasis booking-progress-summary-strip__address text-truncate"
      >
        {{ addressLine }}
      </div>
      <div v-if="showPrice" class="booking-progress-summary-strip__price">
        <BookingWizardPriceDetailsMenu
          v-if="showFeeDetails"
          :fee-preview-label="feePreviewLabel"
          :price-data="priceData"
          :show-apply-coupon="showApplyCoupon"
        />
        <div
          v-else
          class="text-body-large text-medium-emphasis booking-progress-summary-strip__price-plain"
        >
          {{ feePreviewLabel }}
        </div>
      </div>
      <div v-if="showSlotBlock" class="booking-progress-summary-strip__slots">
        <div
          v-for="(line, idx) in slotLines"
          :key="idx"
          class="text-body-small text-medium-emphasis"
        >
          {{ line }}
        </div>
      </div>
    </div>
  </div>
</template>
