/**
 * LEARNING: Complementary Color Mapping Utility
 * WHY: Provides complementary color mappings for status button override states
 * PATTERN: Maps Vuetify color names to their complementary colors
 * 
 * Complementary color pairs (opposite on color wheel):
 * - Orange -> Blue
 * - Yellow -> Purple
 * - Green -> Red
 * - Blue -> Orange
 * - Red -> Green
 * - Purple -> Yellow
 * - Indigo (primary) -> Orange (secondary)
 * - Grey -> Grey (neutral, no complement)
 * - Brown -> Blue (complementary to brown/orange)
 */

/**
 * LEARNING: Map color name to its complementary color
 * WHY: Override state should use complementary color for visual distinction
 * PATTERN: Simple mapping object for color pairs
 */
export const COMPLEMENTARY_COLOR_MAP: Record<string, string> = {
  // Primary colors and their complements
  'secondary': 'info',      // Orange -> Blue
  'info': 'secondary',      // Blue -> Orange
  'yellow': 'purple',       // Yellow -> Purple
  'purple': 'yellow',       // Purple -> Yellow
  'success': 'error',       // Green -> Red
  'error': 'success',       // Red -> Green
  'primary': 'secondary',   // Indigo -> Orange (closest complementary)
  'grey': 'grey',           // Grey stays grey (neutral)
  'brown': 'info',          // Brown -> Blue (complementary to brown/orange)
  // Default fallback
  'default': 'grey',
}

/**
 * LEARNING: Get complementary color for a given color name
 * WHY: StatusButton override state needs complementary color
 * PATTERN: Lookup in map with fallback
 * 
 * @param color - Vuetify color name (e.g., 'success', 'secondary', 'info')
 * @returns Complementary color name
 */
export function getComplementaryColor(color: string): string {
  return COMPLEMENTARY_COLOR_MAP[color] || COMPLEMENTARY_COLOR_MAP['default']
}
