<script setup lang="ts">
import type { PriceData } from '@/types/wizardStepData'

defineProps<{
  feePreviewLabel: string
  priceData: PriceData
  showApplyCoupon: boolean
}>()
</script>

<template>
  <VMenu
    location="bottom"
    :close-on-content-click="true"
    transition="scale-transition"
    max-width="320"
  >
    <template #activator="{ props: menuProps }">
      <div
        v-bind="menuProps"
        class="text-body-large text-medium-emphasis booking-wizard-price-details-activator cursor-pointer"
      >
        {{ feePreviewLabel }}
      </div>
    </template>
    <VCard class="fee-popover-card pa-3" min-width="280">
      <h6 class="text-headline-small mb-3">Price Details</h6>
      <div class="d-flex flex-column gap-2">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-large">Bag Total</span>
          <span class="text-body-large text-medium-emphasis">
            ${{ priceData.bagTotal.toFixed(2) }}
          </span>
        </div>
        <div v-if="showApplyCoupon" class="d-flex justify-space-between align-center">
          <span class="text-body-large">Coupon Discount</span>
          <span class="text-body-large text-medium-emphasis">
            {{ priceData.couponDiscount > 0 ? `-$${priceData.couponDiscount.toFixed(2)}` : '—' }}
          </span>
        </div>
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-large">Order Total</span>
          <span class="text-body-large text-medium-emphasis">
            ${{ priceData.orderTotal.toFixed(2) }}
          </span>
        </div>
        <template v-for="(lineItem, idx) in priceData.lineItems ?? []" :key="idx">
          <div class="d-flex justify-space-between align-center">
            <span class="text-body-large">{{ lineItem.label }}</span>
            <span class="text-body-large text-medium-emphasis">
              ${{ lineItem.amount.toFixed(2) }}
            </span>
          </div>
        </template>
      </div>
      <VDivider class="my-2" />
      <div class="d-flex justify-space-between align-center">
        <span class="text-body-large font-weight-medium">Total</span>
        <span class="text-body-large font-weight-medium">
          ${{ priceData.finalTotal.toFixed(2) }}
        </span>
      </div>
    </VCard>
  </VMenu>
</template>
