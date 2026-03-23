/**
 * Keyboard guard for admin field types (space/enter/tab). Used by useFieldInputHandlers, useSelectHandlers, BooleanInput, IconInput.
 */
import type { ComputedRef } from 'vue'
import type {
  UseFieldKeyboardGuardOptions,
  UseFieldKeyboardGuardReturn,
} from '@/types/admin/fieldKeyboardGuard'
import { fieldKeyboardGuardHandleKeydown } from '@/utils/admin/fieldKeyboardGuardHandlers'

export type { FieldKeyboardGuardType, UseFieldKeyboardGuardOptions, UseFieldKeyboardGuardReturn } from '@/types/admin/fieldKeyboardGuard'

function resolveEditable(isEditable: ComputedRef<boolean> | boolean): boolean {
  return typeof isEditable === 'boolean' ? isEditable : isEditable.value
}

export function fieldKeyboardGuard(options: UseFieldKeyboardGuardOptions): UseFieldKeyboardGuardReturn {
  const { fieldType, isEditable, onToggle, onEnter } = options

  const handleKeydown = (event: KeyboardEvent): void => {
    fieldKeyboardGuardHandleKeydown(fieldType, event, resolveEditable(isEditable), onToggle, onEnter)
  }

  return { handleKeydown }
}
