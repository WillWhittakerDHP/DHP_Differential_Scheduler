/**
 * Date range + computed availability injection keys.
 * @see bookingInjectionKeys barrel for stable import path.
 */
import type { InjectionKey } from 'vue'
import type { Ref } from 'vue'
import type { DisplayedMonth } from '@/types/booking/dateRangeDecider'
import type { UseComputedAvailabilityReturn } from '@/types/booking/computedAvailability'

export const displayedMonthKey: InjectionKey<Ref<DisplayedMonth>> = Symbol('displayedMonth')
export const updateDisplayedMonthKey: InjectionKey<(month: DisplayedMonth) => void> =
  Symbol('updateDisplayedMonth')
export const appointmentDurationKey: InjectionKey<Ref<number | null>> =
  Symbol('appointmentDuration')
export const computedAvailabilityKey: InjectionKey<UseComputedAvailabilityReturn> =
  Symbol('computedAvailability')
