/**
 * WHY: Global keyboard shortcuts (Ctrl/Cmd+Shift+D) require window-level event listeners;
 * Vue's @keydown only works on focused elements. SSR-guarded (typeof window check).
 */
import { onMounted, onUnmounted } from 'vue'

const KEY = 'keydown'
const CTRL_OR_META = (e: KeyboardEvent) => e.ctrlKey || e.metaKey

export function useKeyboardToggle(onToggle: () => void): void {
  function handleKeyDown(event: KeyboardEvent): void {
    if (CTRL_OR_META(event) && event.shiftKey && event.key === 'D') {
      event.preventDefault()
      onToggle()
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener(KEY, handleKeyDown)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(KEY, handleKeyDown)
    }
  })
}
