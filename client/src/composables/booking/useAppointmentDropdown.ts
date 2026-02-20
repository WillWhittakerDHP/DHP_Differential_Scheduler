/**
 * LEARNING: Appointment Dropdown Items
 * WHY: Encapsulates appointment dropdown formatting logic
 * PATTERN: Composable for formatting appointments array to dropdown items
 * 
 * Used by:
 * - BookingWizard.vue
 */

import { computed, type ComputedRef } from 'vue'
import { asEmptyArray, asEmptyString } from '@/utils/safeDefaults'
import type { WizardDevOptionsBase } from '@/types/wizardDevOptions'

/** Extends shared base for single source of truth (TYPE_SIMILARITY 1.14). */
export type UseAppointmentDropdownOptions = WizardDevOptionsBase

export interface UseAppointmentDropdownReturn {
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
}

export function useAppointmentDropdown(
  options: UseAppointmentDropdownOptions
): UseAppointmentDropdownReturn {
  const { fetchAll } = options

  const appointmentDropdownItems = computed(() => {
    const appointments = asEmptyArray(fetchAll.data.value)
    
    // WHY: Functional approach avoids forEach with array mutations
    // PATTERN: Map appointments to items array, prepend "Random Appointment" option
    const items = [
      { text: 'Random Appointment', value: 'random' },
      ...appointments.map((appointment) => {
        const address = appointment.propertyVersion?.address
        const addressText = address 
          ? `${asEmptyString(address.address)}${address.unit ? ` ${address.unit}` : ''}, ${asEmptyString(address.city)}, ${asEmptyString(address.state)}`.trim()
          : `Appointment ${appointment.id.slice(0, 8)}`
        return {
          text: addressText || `Appointment ${appointment.id.slice(0, 8)}`,
          value: appointment.id
        }
      })
    ]
    
    return items
  })

  return {
    appointmentDropdownItems,
  }
}
