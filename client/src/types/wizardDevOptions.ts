/**
 * Wizard Dev Options Types
 *
 * LEARNING: Shared base for dev panel and appointment dropdown (TYPE_SIMILARITY_PROPOSAL § 1.14).
 * WHY: UseAppointmentDropdownOptions and UseWizardDevModeOptions share fetchAll shape.
 */

import type { Ref } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'

/** Common fetch shape for wizard dev dropdown and dev mode. */
export interface WizardDevOptionsBase {
  fetchAll: {
    data: Ref<AppointmentResponse[]>
    isLoading?: Ref<boolean>
  }
}
