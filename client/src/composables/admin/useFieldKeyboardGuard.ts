/**
 * LEARNING: Unified keyboard event containment for form fields
 * WHY: Prevents spacebar/enter from bubbling to parent containers (e.g. expansion panels)
 *      and ensures consistent behavior across all field types.
 * PATTERN: Single composable used by useFieldInputHandlers, useSelectHandlers, BooleanInput, IconInput
 *
 * Used by:
 * - useFieldInputHandlers (text, number, textarea, date)
 * - useSelectHandlers (select)
 * - BooleanInput.vue (boolean)
 * - IconInput.vue (icon)
 */

import type { ComputedRef } from 'vue'

export type FieldKeyboardGuardType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'boolean'
  | 'icon'
  | 'date'

export interface UseFieldKeyboardGuardOptions {
  fieldType: FieldKeyboardGuardType
  isEditable: ComputedRef<boolean> | boolean
  onToggle?: (event: KeyboardEvent) => void
  onEnter?: (event: KeyboardEvent) => void
}

export interface UseFieldKeyboardGuardReturn {
  handleKeydown: (event: KeyboardEvent) => void
}

function resolveEditable(isEditable: ComputedRef<boolean> | boolean): boolean {
  return typeof isEditable === 'boolean' ? isEditable : isEditable.value
}

/**
 * LEARNING: Keyboard guard prevents field keyboard events from reaching parent containers.
 * WHY: Expansion panels and cards may react to Space/Enter; typing or toggling in a field
 *      must not trigger those. Tab is intentionally not stopped so focus can move.
 */
export function useFieldKeyboardGuard(
  options: UseFieldKeyboardGuardOptions
): UseFieldKeyboardGuardReturn {
  const { fieldType, isEditable, onToggle, onEnter } = options

  const handleKeydown = (event: KeyboardEvent): void => {
    const editable = resolveEditable(isEditable)
    const key = event.key
    const isSpace = key === ' ' || key === 'Spacebar' || event.keyCode === 32
    const isEnter = key === 'Enter' || event.keyCode === 13
    const isTab = key === 'Tab' || event.keyCode === 9

    // PATTERN: Never stop Tab so focus navigation between fields works
    if (isTab) {
      return
    }

    if (fieldType === 'boolean') {
      if (isSpace || isEnter) {
        event.preventDefault()
        event.stopPropagation()
        if (editable && onToggle) {
          onToggle(event)
        }
      } else {
        event.stopPropagation()
      }
      return
    }

    if (fieldType === 'icon') {
      // Readonly click-only field: contain all keyboard events
      event.stopPropagation()
      if (isSpace || isEnter) {
        event.preventDefault()
      }
      return
    }

    if (fieldType === 'select' || fieldType === 'date') {
      if (editable) {
        event.stopPropagation()
        if (isSpace || isEnter) {
          event.preventDefault()
        }
      }
      return
    }

    // text, number, textarea
    if (fieldType === 'text' || fieldType === 'number' || fieldType === 'textarea') {
      if (!editable) {
        return
      }
      if (isSpace) {
        // Allow default (type space) but prevent parent from receiving
        event.stopPropagation()
        return
      }
      if (isEnter) {
        event.stopPropagation()
        if (onEnter) {
          onEnter(event)
        }
        return
      }
      // Contain other keys (Escape, Arrow keys, etc.) so parent does not react
      event.stopPropagation()
    }
  }

  return { handleKeydown }
}
