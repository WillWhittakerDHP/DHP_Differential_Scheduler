/**

WHY: Transforms global data into booking format with...
 */
import type { ComputedRef } from 'vue'
import { computed, watchEffect } from 'vue'
import { useGlobal } from './useGlobal'
import { bookingTransformer } from '@/utils/transformers/globalToBookingTransformer'
import type { BookingData } from '@/utils/transformers/globalToBookingTransformer'
import { attachDebugToWindow } from '@/utils/debug/windowDebug'
import { createLogger } from '@/utils/logger'

export interface UseBookingReturn {
  bookingData: ComputedRef<BookingData | null>
  isLoading: boolean
  error: unknown | null
}

const logger = createLogger('useBooking')

let instanceCount = 0
let callCount = 0
const instanceCallSites: Array<{ count: number; stack: string }> = []

let bookingInstance: UseBookingReturn | null = null

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

function createBookingInstance(): UseBookingReturn {
  instanceCount++
  const callSite = getCallSiteInfo()
  instanceCallSites.push({ count: instanceCount, stack: callSite.stack })
  
  
  const { globalData } = useGlobal()
  // Legacy/test compatibility: expose simple primitives (not refs).
  const isLoading = false
  const error: unknown | null = null
  
  const bookingData = computed<BookingData | null>(() => {
    const data = globalData?.value
    
    if (!data) {
      return null
    }
    
    try {
      return bookingTransformer.transformGlobalToBooking(data)
    } catch (_error) {
      logger.error('Transform global to booking failed', { error: _error })
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
LEARNING: Transforms global data to booking-optimized...
 */
export function useBooking(): UseBookingReturn {
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

