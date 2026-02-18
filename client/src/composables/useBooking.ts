/**
 * Booking Composable
 * 
 * LEARNING: Provides booking-optimized data transformation
 * WHY: Transforms global data into booking format with embedded part profiles
 * PATTERN: Composable that transforms globalData using booking transformer
 * COMPARISON: React uses BookingContext. Vue uses composables + transformer
 */

import { computed, watchEffect } from 'vue'
import { useGlobal } from './useGlobal'
import { bookingTransformer } from '@/utils/transformers/globalToBookingTransformer'
import type { BookingData } from '@/utils/transformers/globalToBookingTransformer'
import { attachDebugToWindow } from '@/utils/debug/windowDebug'

let instanceCount = 0
let callCount = 0
const instanceCallSites: Array<{ count: number; stack: string }> = []

let bookingInstance: ReturnType<typeof createBookingInstance> | null = null

function getCallSiteInfo(): { caller: string; stack: string } {
  const rawStack = new Error().stack
  const stack = rawStack !== undefined && rawStack !== null ? rawStack : ''
  const lines = stack.split('\n')
  const callerLine = lines[3] || lines[4] || 'unknown'
  return {
    caller: callerLine.trim(),
    stack: stack
  }
}

function createBookingInstance() {
  instanceCount++
  const callSite = getCallSiteInfo()
  instanceCallSites.push({ count: instanceCount, stack: callSite.stack })
  
  
  const { globalData } = useGlobal()
  // Legacy/test compatibility: expose simple primitives (not refs).
  const isLoading = false
  const error: unknown | null = null
  
  /**
   * Transform global data to booking data
   * LEARNING: Computed property that transforms globalData reactively
   * WHY: Matches React's bookingData structure for debugging
   * PATTERN: Use computed to reactively transform data
   * 
   * NOTE: The transformer expects GlobalData format from React app.
   * Vue's globalData structure should match, but relationships may need
   * transformation if types differ (FetchedRelationship vs GlobalRelationship)
   */
  const bookingData = computed<BookingData | null>(() => {
    const data = globalData?.value
    
    if (!data) {
      return null
    }
    
    try {
      return bookingTransformer.transformGlobalToBooking(data)
    } catch (_error) {
      return null
    }
  })
  
  watchEffect(() => {
    void bookingData.value
  })
  
  return {
    bookingData,
    isLoading,
    error,
  }
}

/**
 * Booking composable
 * LEARNING: Transforms global data to booking-optimized format
 * WHY: Provides booking data with embedded part profiles for efficient access
 * PATTERN: Singleton pattern - creates instance on first call, reuses it afterwards
 * 
 * @returns Booking data and transformation utilities
 */
export function useBooking() {
  callCount++
  
  if (!bookingInstance) {
    bookingInstance = createBookingInstance()
  }
  
  return bookingInstance
}

attachDebugToWindow('__useBookingDebug', {
  instanceCount: () => instanceCount,
  callCount: () => callCount,
  callSites: () => instanceCallSites,
  reset: () => {
    instanceCount = 0
    callCount = 0
    instanceCallSites.length = 0
    bookingInstance = null
  }
})

