/**
 * Notification Composable
 * 
 * LEARNING: Provides snackbar notifications for success/error messages
 * WHY: Centralized notification system for user feedback
 * PATTERN: Singleton pattern with shared reactive state
 * COMPARISON: React uses Ant Design message. Vue uses VSnackbar with composable
 */

import { ref } from 'vue'

/**
 * LEARNING: Notification state interface
 * WHY: Type-safe notification structure
 * PATTERN: Interface for notification data
 */
interface Notification {
  message: string
  color: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

/**
 * LEARNING: Shared notification state (singleton pattern)
 * WHY: Allows multiple components to use the same notification instance
 * PATTERN: Module-level reactive state shared across all composable calls
 */
const notification = ref<Notification | null>(null)
const showNotification = ref(false)

/**
 * LEARNING: Notification composable
 * WHY: Provides reactive notification state and methods
 * PATTERN: Composable that returns shared reactive state and methods
 */
export function useNotification() {
  /**
   * LEARNING: Show notification helper
   * WHY: Sets notification state and shows snackbar
   * PATTERN: Function that updates shared reactive state
   */
  function show(message: string, color: Notification['color'] = 'info', timeout = 4000) {
    notification.value = { message, color, timeout }
    showNotification.value = true
  }

  /**
   * LEARNING: Success notification
   * WHY: Convenience method for success messages
   * PATTERN: Wrapper function with predefined color
   */
  function success(message: string, timeout?: number) {
    show(message, 'success', timeout)
  }

  /**
   * LEARNING: Error notification
   * WHY: Convenience method for error messages
   * PATTERN: Wrapper function with predefined color
   */
  function error(message: string, timeout?: number) {
    show(message, 'error', timeout)
  }

  /**
   * LEARNING: Warning notification
   * WHY: Convenience method for warning messages
   * PATTERN: Wrapper function with predefined color
   */
  function warning(message: string, timeout?: number) {
    show(message, 'warning', timeout)
  }

  /**
   * LEARNING: Info notification
   * WHY: Convenience method for info messages
   * PATTERN: Wrapper function with predefined color
   */
  function info(message: string, timeout?: number) {
    show(message, 'info', timeout)
  }

  /**
   * LEARNING: Close notification
   * WHY: Hides the snackbar
   * PATTERN: Function that resets shared reactive state
   */
  function close() {
    showNotification.value = false
    // Clear notification after animation
    setTimeout(() => {
      notification.value = null
    }, 300)
  }

  /**
   * LEARNING: Reset notification state immediately (for testing)
   * WHY: Clears notification state without animation delay
   * PATTERN: Immediate reset function for testing purposes
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

