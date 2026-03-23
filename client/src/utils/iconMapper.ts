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
  
  // PATTERN: Lookup in mapping record first
  if (iconMap[trimmedIcon]) {
    return iconMap[trimmedIcon]
  }
  
  // WHY: Most icons in database are already Tabler format after migration
  // PATTERN: Return as-is if already Tabler format
  if (trimmedIcon.startsWith('tabler-')) {
    return trimmedIcon
  }
  
  // PATTERN: Return default icon when format is unrecognized
  return DEFAULT_ICON
}
