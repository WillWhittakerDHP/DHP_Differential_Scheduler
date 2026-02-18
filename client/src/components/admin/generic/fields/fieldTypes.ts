/**
 * Shared field component types
 *
 * LEARNING: Single Props shape for admin generic field inputs (Phase 1.3 type-similarity UNIFY)
 * WHY: Same interface across BooleanInput, DateInput, IconInput, NumberInput, PrimitiveInputs,
 *      SelectInputs, TextAreaInput, TextInput; reduces drift and audit noise
 * PATTERN: Central props type imported by each field component
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/useFieldContext'

/**
 * Props for field input components that render from field context
 */
export interface FieldInputProps {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  showLabel?: boolean
}
