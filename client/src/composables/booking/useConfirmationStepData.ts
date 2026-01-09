/**
 * useConfirmationStepData Composable
 * 
 * LEARNING: Extracts confirmation step data aggregation and fee calculation logic from ConfirmationStep component
 * WHY: Moves data aggregation and business logic to composable
 * PATTERN: Composable that aggregates wizard state and step data, calculates fees
 */

import { computed, watch, type Ref, type ComputedRef } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import { buildConfirmationPriceData, buildConfirmationSummaryData } from '@/utils/booking/confirmationStepData'
import { isDevModeEnabled } from '@/utils/env/devMode'

/**
 * Summary data structure
 */
export interface SummaryData {
  serviceType: string
  propertyType: string
  address: string
  squareFootage: string
}

/**
 * Price data structure
 */
export interface PriceData {
  totalFee: number
  currency: string
  bagTotal: number
  couponDiscount: number
  orderTotal: number
  deliveryCharges: number
  deliveryFree: boolean
  finalTotal: number
}

/**
 * Step data interfaces (matching BookingWizard.vue)
 */
interface AvailabilityStepData {
  selectedDate: { start: string | null; end: string | null }
  selectedTimeSlots: Array<{ time: string; duration: number }> | null
}

interface PropertyDetailsStepData {
  address: string
  unit: string
  city: string
  state: string
  zipCode: string
  propertySize: number | null
  numberOfUnits: number | null
  mlsNumber: string
  squareFootage: number | null
  bedrooms: number | null
  bathrooms: number | null
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits: number | null
}

/**
 * useConfirmationStepData composable parameters
 */
export interface UseConfirmationStepDataParams {
  wizard: {
    selectedServices: Ref<BookingBlockInstance[]>
    selectedPropertyTypeBlocks: Ref<BookingBlockInstance[]>
    selectedOptionTypeBlocks: Ref<BookingBlockInstance[]>
    selectedUserTypeBlock: Ref<BookingBlockInstance | null>
  }
  propertyDetailsStepData?: Ref<PropertyDetailsStepData> | null
  availabilityStepData?: Ref<AvailabilityStepData> | null
}

/**
 * useConfirmationStepData composable return type
 */
export interface UseConfirmationStepDataReturn {
  summaryData: ComputedRef<SummaryData>
  priceData: ComputedRef<PriceData>
}

/**
 * useConfirmationStepData composable
 * 
 * LEARNING: Aggregates wizard state and step data for confirmation display
 * WHY: Extracts data aggregation and fee calculation from component to composable
 * PATTERN: Composable that aggregates data from wizard and steps, calculates fees
 */
export function useConfirmationStepData(
  params: UseConfirmationStepDataParams
): UseConfirmationStepDataReturn {
  const {
    wizard,
    propertyDetailsStepData,
    // availabilityStepData available for future scheduling display
  } = params

  /**
   * LEARNING: Aggregate summary data from wizard state and step data
   * WHY: Combines data from multiple sources for display
   * PATTERN: Computed property that aggregates wizard selections and step data
   */
  const summaryData = computed<SummaryData>(() => {
    return buildConfirmationSummaryData(
      {
        selectedServices: wizard.selectedServices.value,
        selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks.value,
        selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
      },
      propertyDetailsStepData?.value ?? null
    )
  })

  /**
   * LEARNING: Calculate price data from wizard selections
   * WHY: Aggregates pricing information from selected services and options
   * PATTERN: Computed property that calculates fees based on selections
   * 
   * LEARNING: Pass additionalUnits (ADU count) to fee calculation
   * WHY: Some services need to be multiplied by ADU count when allowMultiple is true
   * PATTERN: Extract additionalUnits from propertyDetailsStepData and pass to buildConfirmationPriceData
   * 
   * FIX: Explicitly access value to ensure reactivity tracking
   * WHY: Optional chaining may break reactivity tracking in Vue computed properties
   * PATTERN: Extract stepDataValue first, then access nested properties
   */
  const priceData = computed<PriceData>(() => {
    // Explicitly access value to ensure reactivity tracking
    const stepDataValue = propertyDetailsStepData?.value
    const aduCount = stepDataValue?.additionalUnits ?? null
    
    return buildConfirmationPriceData({
      selectedServices: wizard.selectedServices.value,
      selectedPropertyTypeBlocks: wizard.selectedPropertyTypeBlocks.value,
      selectedOptionTypeBlocks: wizard.selectedOptionTypeBlocks.value,
    }, aduCount)
  })

  /**
   * DEBUG: Track ADU changes and priceData recalculations
   * WHY: Helps identify reactivity issues and dependency tracking problems
   * PATTERN: Development-only logging with watch statements
   */
  if (isDevModeEnabled()) {
    // Watch for additionalUnits changes
    watch(
      () => propertyDetailsStepData?.value?.additionalUnits,
      (newVal, oldVal) => {
        console.log('[useConfirmationStepData] additionalUnits changed:', { 
          oldVal, 
          newVal,
          stepDataValue: propertyDetailsStepData?.value 
        })
      }
    )
    
    // Watch for priceData recalculations
    watch(
      priceData,
      (newVal) => {
        const stepDataValue = propertyDetailsStepData?.value
        const aduCount = stepDataValue?.additionalUnits ?? null
        console.log('[useConfirmationStepData] priceData recalculated:', {
          totalFee: newVal.totalFee,
          aduCount,
          stepDataExists: !!stepDataValue
        })
      },
      { deep: true }
    )
    
    // Watch for stepData ref changes
    watch(
      () => propertyDetailsStepData?.value,
      (newVal, oldVal) => {
        console.log('[useConfirmationStepData] propertyDetailsStepData.value changed:', {
          oldAdditionalUnits: oldVal?.additionalUnits,
          newAdditionalUnits: newVal?.additionalUnits,
          refChanged: oldVal !== newVal
        })
      },
      { deep: true }
    )
  }

  return {
    summaryData,
    priceData
  }
}

