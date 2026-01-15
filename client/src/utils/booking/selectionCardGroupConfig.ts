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
  // If fewer than 5 items, fit all on one row (each card takes equal space)
  if (itemCount < 5) {
    // Calculate columns per card: 12 / itemCount, rounded to nearest integer
    // For 1-4 items: 12/1=12, 12/2=6, 12/3=4, 12/4=3
    const colsPerCard = Math.floor(12 / itemCount)
    return {
      cols: colsPerCard.toString(),
      sm: colsPerCard.toString(),
      md: colsPerCard.toString(),
      lg: colsPerCard.toString()
    }
  }
  
  // For 5+ items, use standard responsive grid (3-4 cards per row)
  return {
    cols: '12',  // Mobile: 1 per row
    sm: '6',     // Small: 2 per row
    md: '4',     // Medium: 3 per row
    lg: '3'      // Large: 4 per row
  }
}


