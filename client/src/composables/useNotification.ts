/**
 * PATTERN: Notification Composable

PATTERN: Singleton pattern with shared reactive...
 */
import { ref } from 'vue'

/**
 * LEARNING: Notification state interface
 */
interface Notification {
  message: string
  color: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

/**
 * WHY: Shared notification state (singleton pattern)
PATTERN: Module-level reac...
 */
const notification = ref<Notification | null>(null)
const showNotification = ref(false)

/**
 * WHY: Notification composable
PATTERN: Composable that returns shared reactive...
 */
export function useNotification() {
  /**
   * WHY: /**
WHY: Sets notification state and shows snackbar
PATTERN: Function th...
   */
  function show(message: string, color?: Notification['color'], timeout = 4000) {
    notification.value = { message, color: color !== undefined ? color : 'info', timeout }
    showNotification.value = true
  }

  /**
   */
  function success(message: string, timeout?: number) {
    show(message, 'success', timeout)
  }

  /**
   */
  function error(message: string, timeout?: number) {
    show(message, 'error', timeout)
  }

  /**
   */
  function warning(message: string, timeout?: number) {
    show(message, 'warning', timeout)
  }

  /**
   */
  function info(message: string, timeout?: number) {
    show(message, 'info', timeout)
  }

  /**
   * PATTERN: Function that resets shared reactive state
   */
  function close() {
    showNotification.value = false
    setTimeout(() => {
      notification.value = null
    }, 300)
  }

  /**
   * WHY: /**
LEARNING: Reset notification state immediately (for testing)
WHY: Cl...
   */
  function reset() {
    notification.value = null
    showNotification.value = false
  }

  return {
    notification,
    showNotification,
    show,
    success,
    error,
    warning,
    info,
    close,
    reset,
  }
}

