/**
 * USE NOTIFICATION TESTS
 * 
 * Unit tests for useNotification composable.
 * Tests notification singleton pattern, show/hide functionality, and notification types.
 * Phase 5: High Priority Composables
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useNotification } from '../useNotification'

describe('useNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset notification state using the reset function
    const { reset } = useNotification()
    reset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('singleton pattern', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = useNotification()
      const instance2 = useNotification()
      
      // Should share same reactive state
      expect(instance1.notification).toBe(instance2.notification)
      expect(instance1.showNotification).toBe(instance2.showNotification)
    })
  })

  describe('show function', () => {
    it('should set notification and show snackbar', () => {
      const { notification, showNotification, show } = useNotification()
      
      show('Test message', 'info', 5000)
      
      expect(notification.value).toEqual({
        message: 'Test message',
        color: 'info',
        timeout: 5000,
      })
      expect(showNotification.value).toBe(true)
    })

    it('should use default timeout when not provided', () => {
      const { notification, show } = useNotification()
      
      show('Test message', 'info')
      
      expect(notification.value?.timeout).toBe(4000)
    })

    it('should update notification when called multiple times', () => {
      const { notification, show } = useNotification()
      
      show('First message', 'info')
      expect(notification.value?.message).toBe('First message')
      
      show('Second message', 'error')
      expect(notification.value?.message).toBe('Second message')
      expect(notification.value?.color).toBe('error')
    })
  })

  describe('success function', () => {
    it('should show success notification', () => {
      const { notification, showNotification, success } = useNotification()
      
      success('Operation successful')
      
      expect(notification.value).toEqual({
        message: 'Operation successful',
        color: 'success',
        timeout: 4000,
      })
      expect(showNotification.value).toBe(true)
    })

    it('should accept custom timeout', () => {
      const { notification, success } = useNotification()
      
      success('Operation successful', 6000)
      
      expect(notification.value?.timeout).toBe(6000)
    })
  })

  describe('error function', () => {
    it('should show error notification', () => {
      const { notification, showNotification, error } = useNotification()
      
      error('Operation failed')
      
      expect(notification.value).toEqual({
        message: 'Operation failed',
        color: 'error',
        timeout: 4000,
      })
      expect(showNotification.value).toBe(true)
    })

    it('should accept custom timeout', () => {
      const { notification, error } = useNotification()
      
      error('Operation failed', 6000)
      
      expect(notification.value?.timeout).toBe(6000)
    })
  })

  describe('warning function', () => {
    it('should show warning notification', () => {
      const { notification, showNotification, warning } = useNotification()
      
      warning('Warning message')
      
      expect(notification.value).toEqual({
        message: 'Warning message',
        color: 'warning',
        timeout: 4000,
      })
      expect(showNotification.value).toBe(true)
    })

    it('should accept custom timeout', () => {
      const { notification, warning } = useNotification()
      
      warning('Warning message', 6000)
      
      expect(notification.value?.timeout).toBe(6000)
    })
  })

  describe('info function', () => {
    it('should show info notification', () => {
      const { notification, showNotification, info } = useNotification()
      
      info('Info message')
      
      expect(notification.value).toEqual({
        message: 'Info message',
        color: 'info',
        timeout: 4000,
      })
      expect(showNotification.value).toBe(true)
    })

    it('should accept custom timeout', () => {
      const { notification, info } = useNotification()
      
      info('Info message', 6000)
      
      expect(notification.value?.timeout).toBe(6000)
    })
  })

  describe('close function', () => {
    it('should hide notification immediately', () => {
      const { showNotification, show, close } = useNotification()
      
      show('Test message', 'info')
      expect(showNotification.value).toBe(true)
      
      close()
      expect(showNotification.value).toBe(false)
    })

    it('should clear notification after animation delay', () => {
      const { notification, show, close } = useNotification()
      
      show('Test message', 'info')
      expect(notification.value).not.toBeNull()
      
      close()
      
      // Fast-forward time to trigger setTimeout
      vi.advanceTimersByTime(300)
      
      expect(notification.value).toBeNull()
    })

    it('should handle multiple close calls', () => {
      const { showNotification, show, close } = useNotification()
      
      show('Test message', 'info')
      close()
      close() // Should not cause errors
      
      expect(showNotification.value).toBe(false)
    })
  })

  describe('notification state', () => {
    it('should provide reactive notification ref', () => {
      const { notification, show } = useNotification()
      
      expect(notification.value).toBeNull()
      
      show('Test message', 'info')
      
      expect(notification.value).not.toBeNull()
      expect(notification.value?.message).toBe('Test message')
    })

    it('should provide reactive showNotification ref', () => {
      const { showNotification, show, close } = useNotification()
      
      expect(showNotification.value).toBe(false)
      
      show('Test message', 'info')
      expect(showNotification.value).toBe(true)
      
      close()
      expect(showNotification.value).toBe(false)
    })
  })

  describe('notification types', () => {
    it('should support all notification colors', () => {
      const { notification, success, error, warning, info } = useNotification()
      
      success('Success')
      expect(notification.value?.color).toBe('success')
      
      error('Error')
      expect(notification.value?.color).toBe('error')
      
      warning('Warning')
      expect(notification.value?.color).toBe('warning')
      
      info('Info')
      expect(notification.value?.color).toBe('info')
    })
  })
})

