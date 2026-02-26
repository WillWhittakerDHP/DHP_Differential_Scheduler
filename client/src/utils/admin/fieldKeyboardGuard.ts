/**
 * Keyboard guard for admin field types (space/enter/tab). Used by useFieldInputHandlers, useSelectHandlers, BooleanInput, IconInput.
 */
import type { ComputedRef } from 'vue'
import {
  KEY_ENTER,
  KEY_SPACE,
  KEY_SPACEBAR,
  KEY_TAB,
  KEY_CODE_ENTER,
  KEY_CODE_SPACE,
  KEY_CODE_TAB,
} from '@/components/admin/generic/entityCardConstants'
import type {
  UseFieldKeyboardGuardOptions,
  UseFieldKeyboardGuardReturn,
} from '@/types/admin/fieldKeyboardGuard'

export type { FieldKeyboardGuardType, UseFieldKeyboardGuardOptions, UseFieldKeyboardGuardReturn } from '@/types/admin/fieldKeyboardGuard'

function resolveEditable(isEditable: ComputedRef<boolean> | boolean): boolean {
  return typeof isEditable === 'boolean' ? isEditable : isEditable.value
}

export function fieldKeyboardGuard(options: UseFieldKeyboardGuardOptions): UseFieldKeyboardGuardReturn {
  const { fieldType, isEditable, onToggle, onEnter } = options

  const handleKeydown = (event: KeyboardEvent): void => {
    const editable = resolveEditable(isEditable)
    const key = event.key
    const isSpace = key === KEY_SPACE || key === KEY_SPACEBAR || event.keyCode === KEY_CODE_SPACE
    const isEnter = key === KEY_ENTER || event.keyCode === KEY_CODE_ENTER
    const isTab = key === KEY_TAB || event.keyCode === KEY_CODE_TAB

    if (isTab) return

    if (fieldType === 'boolean') {
      if (isSpace || isEnter) {
        event.preventDefault()
        event.stopPropagation()
        if (editable && onToggle) onToggle(event)
      } else {
        event.stopPropagation()
      }
      return
    }

    if (fieldType === 'icon') {
      event.stopPropagation()
      if (isSpace || isEnter) event.preventDefault()
      return
    }

    if (fieldType === 'select' || fieldType === 'date') {
      if (editable) {
        event.stopPropagation()
        if (isSpace || isEnter) event.preventDefault()
      }
      return
    }

    if (fieldType === 'text' || fieldType === 'number' || fieldType === 'textarea') {
      if (!editable) return
      if (isSpace) {
        event.stopPropagation()
        return
      }
      if (isEnter) {
        event.stopPropagation()
        if (onEnter) onEnter(event)
        return
      }
      event.stopPropagation()
    }
  }

  return { handleKeydown }
}
