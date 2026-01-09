/**
 * WHY: Render Logger Utility

LEARNING: Provides collapsible console logging for render debugging
WHY: Groups all render-related logs together, making it easy to track render order and data availability
PATTERN: Creates a collapsible console group with sequential step tracking
 */

import { isDevModeEnabled } from '@/utils/env/devMode'

export interface RenderLogger {
  /**
   * Log a render step with optional data
   * @param step - Step description
   * @param data - Optional data to log
   */
  logStep: (step: string, data?: unknown) => void
  
  /**
   * Log data availability at a specific point
   * @param label - Label for the data
   * @param data - Data to log
   */
  logData: (label: string, data: unknown) => void
  
  /**
   * Log a render event
   * @param component - Component name
   * @param details - Render details
   */
  logRender: (component: string, details?: unknown) => void
  
  /**
   * End the log group
   */
  endGroup: () => void
}

/**
 * Create a render logger instance
 * 
 * LEARNING: Creates a collapsible console group for render debugging
 * WHY: Groups all logs together, making it easy to collapse and separate from other logs
 * PATTERN: Uses console.groupCollapsed() to create collapsible group
 * 
 * @param title - Title for the log group (e.g., "DynamicFormInputs - blockInstance")
 * @returns Render logger instance
 */
export function createRenderLogger(title: string): RenderLogger {
  // Only create logger in development mode
  if (!isDevModeEnabled()) {
    // Return no-op logger in production
    return {
      logStep: () => {},
      logData: () => {},
      logRender: () => {},
      endGroup: () => {}
    }
  }
  
  let stepNumber = 0
  const startTime = Date.now()
  
  // Create collapsible console group
  console.groupCollapsed(`🔵 [RENDER] ${title}`)
  
  return {
    logStep: (step: string, data?: unknown) => {
      stepNumber++
      const elapsed = Date.now() - startTime
      if (data !== undefined) {
        console.log(`  [${stepNumber}] ${step}`, data, `(+${elapsed}ms)`)
      } else {
        console.log(`  [${stepNumber}] ${step}`, `(+${elapsed}ms)`)
      }
    },
    
    logData: (label: string, data: unknown) => {
      stepNumber++
      const elapsed = Date.now() - startTime
      console.log(`  [${stepNumber}] DATA: ${label}`, data, `(+${elapsed}ms)`)
    },
    
    logRender: (component: string, details?: unknown) => {
      stepNumber++
      const elapsed = Date.now() - startTime
      if (details !== undefined) {
        console.log(`  [${stepNumber}] RENDER: ${component}`, details, `(+${elapsed}ms)`)
      } else {
        console.log(`  [${stepNumber}] RENDER: ${component}`, `(+${elapsed}ms)`)
      }
    },
    
    endGroup: () => {
      const totalElapsed = Date.now() - startTime
      console.log(`  [END] Total render time: ${totalElapsed}ms`)
      console.groupEnd()
    }
  }
}

