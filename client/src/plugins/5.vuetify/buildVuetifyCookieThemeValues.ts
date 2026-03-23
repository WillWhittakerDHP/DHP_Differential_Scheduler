/**
 * WHY: Flatten vuetify plugin factory nesting (function-complexity audit).
 */

import { cookieRef } from '@layouts/stores/config'
import { themeConfig } from '@themeConfig'
import { resolveVuetifyTheme } from '@core/utils/vuetify'
import { staticPrimaryColor, staticPrimaryDarkenColor } from './theme'

export function buildVuetifyCookieThemeValues(): {
  defaultTheme: string
  themes: {
    light: { colors: Record<string, string> }
    dark: { colors: Record<string, string> }
  }
} {
  return {
    defaultTheme: resolveVuetifyTheme(themeConfig.app.theme),
    themes: {
      light: {
        colors: {
          primary: cookieRef('lightThemePrimaryColor', staticPrimaryColor).value,
          'primary-darken-1': cookieRef('lightThemePrimaryDarkenColor', staticPrimaryDarkenColor).value,
        },
      },
      dark: {
        colors: {
          primary: cookieRef('darkThemePrimaryColor', staticPrimaryColor).value,
          'primary-darken-1': cookieRef('darkThemePrimaryDarkenColor', staticPrimaryDarkenColor).value,
        },
      },
    },
  }
}
