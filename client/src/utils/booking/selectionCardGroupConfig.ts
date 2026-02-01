import type { SelectionCardConfig, GridColumns } from '@/components/booking/types/selectionCardTypes'

export function shouldUseSelectionGroupWrapper(config: SelectionCardConfig): boolean {
  return config.selectionGroup !== 'none'
}

export function getSelectionGroupComponentName(config: SelectionCardConfig): string {
  return config.selectionGroup || 'VRadioGroup'
}

export function buildSelectionCardGridColumnProps(config: SelectionCardConfig): Record<string, string | number> {
  const cols = config.gridColumns || {}
  const result: Record<string, string | number> = {}

  if (cols.cols !== undefined) result.cols = cols.cols
  if (cols.sm !== undefined) result.sm = cols.sm
  if (cols.md !== undefined) result.md = cols.md
  if (cols.lg !== undefined) result.lg = cols.lg
  if (cols.xl !== undefined) result.xl = cols.xl

  return result
}

/**
 * Calculate grid columns based on item count
 * LEARNING: Returns grid columns that fit all items on one row if count < 5, otherwise wraps
 * WHY: Allows cards to fit on one row when there are fewer than 5 items
 * PATTERN: Dynamic grid calculation based on item count
 */
export function calculateGridColumnsForItemCount(itemCount: number): GridColumns {
  if (itemCount < 5) {
    const colsPerCard = Math.floor(12 / itemCount)
    return {
      cols: colsPerCard.toString(),
      sm: colsPerCard.toString(),
      md: colsPerCard.toString(),
      lg: colsPerCard.toString()
    }
  }
  
  return {
    cols: '12',  // Mobile: 1 per row
    sm: '6',     // Small: 2 per row
    md: '4',     // Medium: 3 per row
    lg: '3'      // Large: 4 per row
  }
}


