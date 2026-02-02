/**
 * useDriveTimeDataSource Composable
 * 
 * LEARNING: Manages drive time data source selection and state
 * WHY: Allows switching between default (static), API, both, or none for testing
 * PATTERN: Shared state composable with persistent refs, similar to useFreeBusyDataSource
 */

import { ref, type Ref } from 'vue'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useDriveTimeDataSource')

/**
 * Data source modes for drive time data
 * LEARNING: Different modes for different testing/production scenarios
 * 
 * - 'default': Use static fallback values from settings only (no API calls)
 * - 'api': Use Google Maps API only (fail if unavailable, no fallback)
 * - 'both': Use API with fallback to default on error (current behavior)
 * - 'none': No drive time constraints applied
 */
export type DriveTimeDataSource = 'default' | 'api' | 'both' | 'none'

/**
 * Return type for useDriveTimeDataSource composable
 */
export interface UseDriveTimeDataSourceReturn {
  /** Current data source mode */
  dataSource: Ref<DriveTimeDataSource>
}

// Shared state - persists across component instances
// LEARNING: Module-level refs are shared across all uses of this composable
// WHY: Dev panel selection should affect all components using drive times
const sharedDataSource = ref<DriveTimeDataSource>('both')

/**
 * useDriveTimeDataSource composable
 * 
 * LEARNING: Provides shared state for data source selection
 * WHY: Multiple components need consistent data source behavior
 * PATTERN: Composable with shared module-level state
 */
export function useDriveTimeDataSource(): UseDriveTimeDataSourceReturn {
  return {
    dataSource: sharedDataSource
  }
}
