import {
  KEY_ENTER,
  KEY_SPACE,
  KEY_SPACEBAR,
  KEY_TAB,
  KEY_CODE_ENTER,
  KEY_CODE_SPACE,
  KEY_CODE_TAB,
} from '@/components/admin/generic/entityCardConstants'
import type { FieldKeyboardGuardType } from '@/types/admin/fieldKeyboardGuard'

function keyIsSpace(event: KeyboardEvent): boolean {
  return event.key === KEY_SPACE || event.key === KEY_SPACEBAR || event.keyCode === KEY_CODE_SPACE
}

function keyIsEnter(event: KeyboardEvent): boolean {
  return event.key === KEY_ENTER || event.keyCode === KEY_CODE_ENTER
}

function keyIsTab(event: KeyboardEvent): boolean {
  return event.key === KEY_TAB || event.keyCode === KEY_CODE_TAB
}

export function fieldKeyboardGuardHandleKeydown(
  fieldType: FieldKeyboardGuardType,
  event: KeyboardEvent,
  editable: boolean,
  onToggle?: (e: KeyboardEvent) => void,
  onEnter?: (e: KeyboardEvent) => void
): void {
  if (keyIsTab(event)) return

  const isSpace = keyIsSpace(event)
  const isEnter = keyIsEnter(event)

  if (fieldType === 'boolean') {
    fieldKeyboardGuardBooleanKeydown(event, editable, isSpace, isEnter, onToggle)
    return
  }
  if (fieldType === 'icon') {
    fieldKeyboardGuardIconKeydown(event, isSpace, isEnter)
    return
  }
  if (fieldType === 'select' || fieldType === 'date') {
    fieldKeyboardGuardSelectDateKeydown(event, editable, isSpace, isEnter)
    return
  }
  if (fieldType === 'text' || fieldType === 'number' || fieldType === 'textarea') {
    fieldKeyboardGuardTextLikeKeydown(event, editable, isSpace, isEnter, onEnter)
  }
}

function fieldKeyboardGuardBooleanKeydown(
  event: KeyboardEvent,
  editable: boolean,
  isSpace: boolean,
  isEnter: boolean,
  onToggle?: (e: KeyboardEvent) => void
): void {
  if (isSpace || isEnter) {
    event.preventDefault()
    event.stopPropagation()
    if (editable && onToggle) onToggle(event)
  } else {
    event.stopPropagation()
  }
}

function fieldKeyboardGuardIconKeydown(
  event: KeyboardEvent,
  isSpace: boolean,
  isEnter: boolean
): void {
  event.stopPropagation()
  if (isSpace || isEnter) event.preventDefault()
}

function fieldKeyboardGuardSelectDateKeydown(
  event: KeyboardEvent,
  editable: boolean,
  isSpace: boolean,
  isEnter: boolean
): void {
  if (editable) {
    event.stopPropagation()
    if (isSpace || isEnter) event.preventDefault()
  }
}

function fieldKeyboardGuardTextLikeKeydown(
  event: KeyboardEvent,
  editable: boolean,
  isSpace: boolean,
  isEnter: boolean,
  onEnter?: (e: KeyboardEvent) => void
): void {
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
