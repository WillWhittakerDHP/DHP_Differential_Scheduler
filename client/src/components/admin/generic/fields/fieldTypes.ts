/**
 * Shared field component types
 *
 *      SelectInputs, TextAreaInput, TextInput; reduces drift and audit noise
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'

/**
 * Props for field input components that render from field context
 */
export interface FieldInputProps {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}
