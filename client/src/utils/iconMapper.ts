/**
 * WHY: Icon Mapper Utility

LEARNING: Maps database icon strings (Ant Design names) to Vuetify/Tabler icon names
WHY: Ensures icons display correctly regardless of format stored in database
PATTERN: Mapping function with fallback handling for null/undefined/unknown icons

Session 6.3: Icon Integration
Phase 6: Booking Wizard Logic Integration

NOTE: Database icons are primarily Tabler format, but supports Ant Design format
for backward compatibility and admin-entered values
 */

const iconMap: Record<string, string> = {
  // User Type icons (from seeds/migration)
  'DollarOutlined': 'tabler-currency-dollar',
  'ContactsOutlined': 'tabler-users',
  'HomeOutlined': 'tabler-home',
  'EyeOutlined': 'tabler-eye',
  
  'ShoppingCartOutlined': 'tabler-shopping-cart',
  'UserOutlined': 'tabler-user',
  'TeamOutlined': 'tabler-users',
  'SettingOutlined': 'tabler-settings',
  'EditOutlined': 'tabler-edit',
  'DeleteOutlined': 'tabler-trash',
  'PlusOutlined': 'tabler-plus',
  'MinusOutlined': 'tabler-minus',
  'CheckOutlined': 'tabler-check',
  'CloseOutlined': 'tabler-x',
  'InfoCircleOutlined': 'tabler-info-circle',
  'WarningOutlined': 'tabler-alert-triangle',
  'QuestionCircleOutlined': 'tabler-help-circle',
  
}

const DEFAULT_ICON = 'tabler-circle'

import { isDevModeEnabled } from '@/utils/env/devMode'

/**
 * Map database icon string to Vuetify/Tabler icon name
 * LEARNING: Handles icon format conversion with fallback for unknown icons
 * WHY: Ensures UI always has a valid icon to display, preventing empty icon slots
 * PATTERN: Check mapping first, then check if already Tabler format, then fallback
 * 
 * @param iconString - Icon string from database (Ant Design or Tabler format) or null/undefined
 * @returns Vuetify/Tabler icon name (e.g., "tabler-currency-dollar")
 */
export function getIcon(iconString: string | null | undefined): string {
  if (!iconString || iconString.trim() === '') {
    if (isDevModeEnabled()) {
      // Dev-only: could log missing icon here
    }
    return DEFAULT_ICON
  }
  
  const trimmedIcon = iconString.trim()
  
  // LEARNING: Check if icon is in mapping (Ant Design format)
  // PATTERN: Lookup in mapping record first
  if (iconMap[trimmedIcon]) {
    return iconMap[trimmedIcon]
  }
  
  // LEARNING: Check if icon is already Tabler format (starts with "tabler-")
  // WHY: Most icons in database are already Tabler format after migration
  // PATTERN: Return as-is if already Tabler format
  if (trimmedIcon.startsWith('tabler-')) {
    return trimmedIcon
  }
  
  // LEARNING: Fallback to default icon for unknown formats
  // PATTERN: Return default icon when format is unrecognized
  return DEFAULT_ICON
}

export function mapIcon(iconString: string | null | undefined): string {
  return getIcon(iconString)
}

