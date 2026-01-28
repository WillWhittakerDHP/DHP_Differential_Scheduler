/**
 * LEARNING: Appointment Dropdown Items
 * WHY: Encapsulates appointment dropdown formatting logic
 * PATTERN: Composable for formatting appointments array to dropdown items
 * 
 * Used by:
 * - BookingWizard.vue
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'

export interface UseAppointmentDropdownOptions {
  fetchAll: {
    data: Ref<AppointmentResponse[]>
  }
}

export interface UseAppointmentDropdownReturn {
  appointmentDropdownItems: ComputedRef<Array<{ text: string; value: string }>>
}

/**
 * LEARNING: Format appointments array to dropdown items
 * WHY: Provides formatted list of appointments for dropdown selection
 * PATTERN: Transform appointments array to dropdown format with address display
 */
export function useAppointmentDropdown(
  options: UseAppointmentDropdownOptions
): UseAppointmentDropdownReturn {
  const { fetchAll } = options

  const appointmentDropdownItems = computed(() => {
    const appointments = fetchAll.data.value || []
    
    // LEARNING: Use map to create items array instead of forEach with push mutations
    // WHY: Functional approach avoids forEach with array mutations
    // PATTERN: Map appointments to items array, prepend "Random Appointment" option
    const items = [
      { text: 'Random Appointment', value: 'random' },
      ...appointments.map((appointment) => {
        const address = appointment.propertyVersion?.address
        const addressText = address 
          ? `${address.address || ''}${address.unit ? ` ${address.unit}` : ''}, ${address.city || ''}, ${address.state || ''}`.trim()
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
