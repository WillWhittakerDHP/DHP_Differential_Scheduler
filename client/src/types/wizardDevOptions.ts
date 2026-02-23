
import type { Ref } from 'vue'
import type { AppointmentResponse } from '@/types/appointment'

/** Common fetch shape for wizard dev dropdown and dev mode. */
export interface WizardDevOptionsBase {
  fetchAll: {
    data: Ref<AppointmentResponse[]>
    isLoading?: Ref<boolean>
  }
}
