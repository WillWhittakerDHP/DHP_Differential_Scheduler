
import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'

export interface WizardStepConfig {
  /** Icon name (Tabler icon) */
  icon: string
  /** Step title */
  title: string
  /** Step subtitle/description */
  subtitle: string
  /**
   * When true, step requires user to complete the required-confirmation modal before advancing.
   * Wiring to block advance until modal is confirmed is follow-up; see booking/modals/README.md.
   */
  confirmModal?: boolean
}

export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    icon: 'tabler-users',
    title: 'Service Selection',
    subtitle: 'Identifying your needs',
  },
  {
    icon: 'tabler-home',
    title: APPOINTMENTS_TABLE_UI.PROPERTY_TOOLTIP_TITLE,
    subtitle: 'Provide property info',
  },
  {
    icon: 'tabler-bookmarks',
    title: 'Appointment Availability',
    subtitle: 'Find a day/time slot',
  },
  {
    icon: 'tabler-map-pin',
    title: 'Personal Information',
    subtitle: 'Agent/Buyer information',
  },
  {
    icon: 'tabler-currency-dollar',
    title: 'Summary',
    subtitle: 'Summary of services',
  },
]

