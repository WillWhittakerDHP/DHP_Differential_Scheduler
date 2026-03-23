/**
 * WHY: Keeps EntityCard.vue under vue-architecture script line limit.
 */
import { KEY_ENTER, KEY_SPACEBAR } from '@/components/admin/generic/entityCardConstants'
import { createLogger } from '@/utils/logger'

const logger = createLogger('entityCardTitleKeydown')

/** `setSelectionRange` exists on many inputs but throws for types like `number` (InvalidStateError). */
function setCaretPositionIfSupported(element: InputLikeElement, position: number): void {
  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase()
    const selectionSupported =
      type === '' ||
      type === 'text' ||
      type === 'search' ||
      type === 'url' ||
      type === 'tel' ||
      type === 'password'
    if (!selectionSupported) {
      return
    }
  }
  try {
    element.setSelectionRange(position, position)
  } catch (error: unknown) {
    logger.warn('Could not set selection range on title field', {
      error,
      tagName: element.tagName,
      inputType: element instanceof HTMLInputElement ? element.type : undefined,
    })
  }
}

interface InputLikeElement extends Element {
  value: string
  selectionStart: number | null
  selectionEnd: number | null
  setSelectionRange(start: number, end: number): void
}

/**
 * These controls reject arbitrary strings (e.g. `2367\\n` on number). Capture-phase interception
 * would block the real target from receiving the keydown, so we must not stopPropagation — native
 * handling runs and the expansion panel does not see a separate untrusted event.
 */
function mustUseNativeKeyboardHandling(editable: Element): boolean {
  if (editable instanceof HTMLSelectElement) {
    return true
  }
  if (!(editable instanceof HTMLInputElement)) {
    return false
  }
  const t = editable.type.toLowerCase()
  return (
    t === 'number' ||
    t === 'range' ||
    t === 'date' ||
    t === 'datetime-local' ||
    t === 'month' ||
    t === 'week' ||
    t === 'time' ||
    t === 'color' ||
    t === 'checkbox' ||
    t === 'radio' ||
    t === 'file'
  )
}

/** Space for panel-vs-field fix; newline only for textarea (single-line inputs cannot store `\\n`). */
function resolveInsertCharForTitleField(event: KeyboardEvent, editable: Element): string | null {
  const isEnter = event.key === KEY_ENTER || event.keyCode === 13
  if (isEnter) {
    return editable instanceof HTMLTextAreaElement ? '\n' : null
  }
  return ' '
}

interface EntityCardTitleKeydownReturn {
  handleTitleKeydown: (event: KeyboardEvent) => void
}

export function entityCardTitleKeydown(): EntityCardTitleKeydownReturn {
  const handleTitleKeydown = (event: KeyboardEvent): void => {
    if (!event.isTrusted) return
    const target = event.target as Element | null
    const key = event.key
    if (
      key !== ' ' &&
      key !== KEY_SPACEBAR &&
      key !== KEY_ENTER &&
      event.keyCode !== 32 &&
      event.keyCode !== 13
    ) {
      return
    }
    const editable = target?.closest?.('input, textarea, select, [contenteditable="true"]')
    if (!editable) return
    if (mustUseNativeKeyboardHandling(editable)) {
      return
    }
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
    if (synthetic.defaultPrevented || !('value' in editable) || !('setSelectionRange' in editable)) {
      return
    }
    function isInputLike(el: Element): el is InputLikeElement {
      return 'value' in el && 'setSelectionRange' in el
    }
    if (!isInputLike(editable)) return
    const insertChar = resolveInsertCharForTitleField(event, editable)
    if (insertChar === null) {
      return
    }
    const start = editable.selectionStart ?? editable.value.length
    const end = editable.selectionEnd ?? start
    const before = editable.value.slice(0, start)
    const after = editable.value.slice(end)
    editable.value = before + insertChar + after
    setCaretPositionIfSupported(editable, start + insertChar.length)
    editable.dispatchEvent(new Event('input', { bubbles: true }))
  }
  return { handleTitleKeydown }
}
