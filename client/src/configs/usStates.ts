/**
 * US state options for address forms
 * LEARNING: Single source of truth for state dropdowns (wizard, admin, etc.)
 * WHY: Reusable across PropertyDetailsStep, BusinessControlsTab, and future address forms
 * P2 type-similarity: extends SelectOptionBase (same shape).
 */

import type { SelectOptionBase } from '@/composables/useSelectOptions'

export type USStateOption = SelectOptionBase

export const US_STATE_OPTIONS: readonly USStateOption[] = [
  { value: 'AL', title: 'Alabama' },
  { value: 'AK', title: 'Alaska' },
  { value: 'AZ', title: 'Arizona' },
  { value: 'AR', title: 'Arkansas' },
  { value: 'CA', title: 'California' },
  { value: 'CO', title: 'Colorado' },
  { value: 'CT', title: 'Connecticut' },
  { value: 'DE', title: 'Delaware' },
  { value: 'DC', title: 'District of Columbia' },
  { value: 'FL', title: 'Florida' },
  { value: 'GA', title: 'Georgia' },
  { value: 'HI', title: 'Hawaii' },
  { value: 'ID', title: 'Idaho' },
  { value: 'IL', title: 'Illinois' },
  { value: 'IN', title: 'Indiana' },
  { value: 'IA', title: 'Iowa' },
  { value: 'KS', title: 'Kansas' },
  { value: 'KY', title: 'Kentucky' },
  { value: 'LA', title: 'Louisiana' },
  { value: 'ME', title: 'Maine' },
  { value: 'MD', title: 'Maryland' },
  { value: 'MA', title: 'Massachusetts' },
  { value: 'MI', title: 'Michigan' },
  { value: 'MN', title: 'Minnesota' },
  { value: 'MS', title: 'Mississippi' },
  { value: 'MO', title: 'Missouri' },
  { value: 'MT', title: 'Montana' },
  { value: 'NE', title: 'Nebraska' },
  { value: 'NV', title: 'Nevada' },
  { value: 'NH', title: 'New Hampshire' },
  { value: 'NJ', title: 'New Jersey' },
  { value: 'NM', title: 'New Mexico' },
  { value: 'NY', title: 'New York' },
  { value: 'NC', title: 'North Carolina' },
  { value: 'ND', title: 'North Dakota' },
  { value: 'OH', title: 'Ohio' },
  { value: 'OK', title: 'Oklahoma' },
  { value: 'OR', title: 'Oregon' },
  { value: 'PA', title: 'Pennsylvania' },
  { value: 'RI', title: 'Rhode Island' },
  { value: 'SC', title: 'South Carolina' },
  { value: 'SD', title: 'South Dakota' },
  { value: 'TN', title: 'Tennessee' },
  { value: 'TX', title: 'Texas' },
  { value: 'UT', title: 'Utah' },
  { value: 'VT', title: 'Vermont' },
  { value: 'VA', title: 'Virginia' },
  { value: 'WA', title: 'Washington' },
  { value: 'WV', title: 'West Virginia' },
  { value: 'WI', title: 'Wisconsin' },
  { value: 'WY', title: 'Wyoming' },
] as const
