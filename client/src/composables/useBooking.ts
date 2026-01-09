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
// Import Vue booking transformer (no React dependencies)
import { bookingTransformer } from '@/utils/transformers/globalToBookingTransformer'
import type { BookingData } from '@/utils/transformers/globalToBookingTransformer'
import { isDevModeEnabled } from '@/utils/env/devMode'

// DIAGNOSTICS: Track instance creation
let instanceCount = 0
let callCount = 0
const instanceCallSites: Array<{ count: number; stack: string }> = []

// SINGLETON: Shared instance created on first call
let bookingInstance: ReturnType<typeof createBookingInstance> | null = null

/**
 * Helper to extract call site info from stack trace
 */
function getCallSiteInfo(): { caller: string; stack: string } {
  const stack = new Error().stack || ''
  const lines = stack.split('\n')
  // Skip first 3 lines: Error, getCallSiteInfo, useBooking
  // Look for the actual caller (usually line 4 or 5)
  const callerLine = lines[3] || lines[4] || 'unknown'
  return {
    caller: callerLine.trim(),
    stack: stack
  }
}

/**
 * Create the actual composable instance
 * LEARNING: Separated from useBooking to enable singleton pattern
 * WHY: Allows creating instance once and reusing it
 */
function createBookingInstance() {
  instanceCount++
  const callSite = getCallSiteInfo()
  instanceCallSites.push({ count: instanceCount, stack: callSite.stack })
  
  
  const { globalData } = useGlobal()
  // Legacy/test compatibility: expose simple primitives (not refs).
  // NOTE: Loading/error are currently managed at the globalData layer.
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
    
    // Transform globalData to bookingData
    // The transformer expects GlobalData format, which matches the type from useGlobal
    try {
      const transformed = bookingTransformer.transformGlobalToBooking(data)
      return transformed
    } catch (error) {
      return null
    }
  })
  
  // NOTE: Watcher is created once per singleton, not per component call
  watchEffect(() => {
    // Access bookingData to establish reactivity
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
  
  // SINGLETON: Create instance on first call, reuse afterwards
  if (!bookingInstance) {
    bookingInstance = createBookingInstance()
  }
  
  return bookingInstance
}

// DIAGNOSTICS: Export instance count for debugging
if (isDevModeEnabled()) {
  interface WindowWithDebug extends Window {
    __useBookingDebug?: {
      instanceCount: () => number
      callCount: () => number
      callSites: () => Array<{ count: number; stack: string }>
      reset: () => void
    }
  }
  (window as WindowWithDebug).__useBookingDebug = {
    instanceCount: () => instanceCount,
    callCount: () => callCount,
    callSites: () => instanceCallSites,
    reset: () => {
      instanceCount = 0
      callCount = 0
      instanceCallSites.length = 0
      bookingInstance = null
    }
  }
}

