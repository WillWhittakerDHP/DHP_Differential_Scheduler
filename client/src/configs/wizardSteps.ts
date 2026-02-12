/**
 * Wizard Step Configuration
 *
 * LEARNING: Centralized step configuration for booking wizard
 * WHY: Extracts hardcoded step config from component to reusable config file
 * PATTERN: Array of step objects with metadata (icon, title, subtitle)
 *
 * Component-Composable Alignment: Extracted from BookingWizard.vue
 */

import { APPOINTMENTS_TABLE_UI } from '@/constants/appointmentsTableConstants'

/**
 * Wizard Step Configuration Interface
 * LEARNING: Defines structure for wizard step metadata
 * WHY: Provides type safety for step configuration
 * PATTERN: Interface with icon, title, and subtitle properties
 */
export interface WizardStepConfig {
  /** Icon name (Tabler icon) */
  icon: string
  /** Step title */
  title: string
  /** Step subtitle/description */
  subtitle: string
}

/**
 * Wizard Steps Configuration
 * LEARNING: Array of step configurations matching Jose's wizard structure
 * WHY: Centralized step configuration with icons, titles, and subtitles
 * PATTERN: Array of step objects with metadata
 */
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

