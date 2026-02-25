/**
 * PATTERN: Title row keydown handler for EntityCard (space/enter in inputs).
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { KEY_ENTER } from '@/components/admin/generic/entityCardConstants'

export interface EntityCardTitleKeydownReturn {
  handleTitleKeydown: (event: KeyboardEvent) => void
}

export function entityCardTitleKeydown(): EntityCardTitleKeydownReturn {
  const handleTitleKeydown = (event: KeyboardEvent): void => {
    if (!event.isTrusted) return
    const target = event.target as Element | null
    const key = event.key
    if (
      key !== ' ' &&
      key !== 'Spacebar' &&
      key !== KEY_ENTER &&
      event.keyCode !== 32 &&
      event.keyCode !== 13
    ) {
      return
    }
    const editable = target?.closest?.('input, textarea, select, [contenteditable="true"]')
    if (!editable) return
    event.stopPropagation()
    event.preventDefault()
    const synthetic = new KeyboardEvent('keydown', {
      key: event.key,
      code: event.code,
      keyCode: event.keyCode,
      which: event.which,
      bubbles: false,
      cancelable: true,
    })
    editable.dispatchEvent(synthetic)
    if (
      synthetic.defaultPrevented ||
      !('value' in editable) ||
      !('setSelectionRange' in editable)
    ) {
      return
    }
    interface InputLikeElement extends Element {
      value: string
      selectionStart: number | null
      selectionEnd: number | null
      setSelectionRange(start: number, end: number): void
    }
    function isInputLike(el: Element): el is InputLikeElement {
      return 'value' in el && 'setSelectionRange' in el
    }
    if (!isInputLike(editable)) return
    const start = editable.selectionStart ?? editable.value.length
    const end = editable.selectionEnd ?? start
    const char = event.key === KEY_ENTER ? '\n' : ' '
    const before = editable.value.slice(0, start)
    const after = editable.value.slice(end)
    editable.value = before + char + after
    editable.setSelectionRange(start + char.length, start + char.length)
    editable.dispatchEvent(new Event('input', { bubbles: true }))
  }
  return { handleTitleKeydown }
}
