/**
 * WHY: Override state should use complementary color for visual distinction
 */
const COMPLEMENTARY_COLOR_MAP: Record<string, string> = {
  'secondary': 'info',      // Orange -> Blue
  'info': 'secondary',      // Blue -> Orange
  'yellow': 'purple',       // Yellow -> Purple
  'purple': 'yellow',       // Purple -> Yellow
  'success': 'error',       // Green -> Red
  'error': 'success',       // Red -> Green
  'primary': 'secondary',   // Indigo -> Orange (closest complementary)
  'grey': 'grey',           // Grey stays grey (neutral)
  'brown': 'info',          // Brown -> Blue (complementary to brown/orange)
  'default': 'grey',
}

export function getComplementaryColor(color: string): string {
  return COMPLEMENTARY_COLOR_MAP[color] || COMPLEMENTARY_COLOR_MAP['default']
}
