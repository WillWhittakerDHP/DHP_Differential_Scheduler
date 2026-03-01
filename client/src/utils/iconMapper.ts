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
PATTERN: Check mapp...
 */
export function getIcon(iconString: string | null | undefined): string {
  if (!iconString || iconString.trim() === '') {
    if (isDevModeEnabled()) {
      void 0 /* dev: optional debug logging can be added here */
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

