/**
 * TEST HELPERS
 * 
 * Shared utility functions for testing across the client codebase.
 * Provides date comparison, async helpers, and custom matchers.
 */

import { expect } from 'vitest'

export function expectDatesClose(
  actual: Date | string,
  expected: Date | string,
  toleranceMs: number = 1000
) {
  const actualDate = new Date(actual)
  const expectedDate = new Date(expected)
  const diff = Math.abs(actualDate.getTime() - expectedDate.getTime())
  
  expect(diff).toBeLessThanOrEqual(toleranceMs)
}

export async function waitFor(
  condition: () => boolean,
  options: {
    timeout?: number
    interval?: number
  } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options
  const startTime = Date.now()
  
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}

/**
 * Flush all pending promises
 */
export async function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export function createMockAsyncFn<T>(returnValue: T) {
  return vi.fn().mockResolvedValue(returnValue)
}

export function createMockAsyncErrorFn(error: Error | string) {
  const errorObj = typeof error === 'string' ? new Error(error) : error
  return vi.fn().mockRejectedValue(errorObj)
}

export function expectSortedBy<T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
) {
  for (let i = 0; i < array.length - 1; i++) {
    const current = array[i][key]
    const next = array[i + 1][key]
    
    if (order === 'asc') {
      expect(current).toBeLessThanOrEqual(next)
    } else {
      expect(current).toBeGreaterThanOrEqual(next)
    }
  }
}

export function expectUniqueValues<T>(array: T[], key?: keyof T) {
  const values = key ? array.map(item => item[key]) : array
  const uniqueValues = new Set(values)
  
  expect(uniqueValues.size).toBe(array.length)
}

export function expectDeepEqualWithTolerance(
  actual: any,
  expected: any,
  tolerance: number = 0.001
) {
  if (typeof actual === 'number' && typeof expected === 'number') {
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance)
  } else if (typeof actual === 'object' && typeof expected === 'object') {
    const actualKeys = Object.keys(actual)
    const expectedKeys = Object.keys(expected)
    
    expect(actualKeys.length).toBe(expectedKeys.length)
    
    for (const key of actualKeys) {
      expectDeepEqualWithTolerance(actual[key], expected[key], tolerance)
    }
  } else {
    expect(actual).toEqual(expected)
  }
}

export function mockLocalStorage() {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

export function spyOnConsole(method: 'log' | 'error' | 'warn' | 'info' = 'error') {
  return vi.spyOn(console, method).mockImplementation(() => {})
}

export function suppressConsole() {
  const spies = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  }
  
  return () => {
    Object.values(spies).forEach(spy => spy.mockRestore())
  }
}

