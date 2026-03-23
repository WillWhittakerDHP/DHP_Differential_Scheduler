import { deepMerge } from '@antfu/utils'
import type { App } from 'vue'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import defaults from './defaults'
import { icons } from './icons'
import { themes } from './theme'
import { buildVuetifyCookieThemeValues } from './buildVuetifyCookieThemeValues'

import '@core/scss/template/libs/vuetify/index.scss'
import 'vuetify/styles'

export default function (app: App): void {
  const cookieThemeValues = buildVuetifyCookieThemeValues()
  const optionTheme = deepMerge({ themes }, cookieThemeValues)

  const vuetify = createVuetify({
    aliases: {
      IconBtn: VBtn,
    },
    defaults,
    display: {
      thresholds: { md: 960, lg: 1280, xl: 1920, xxl: 2560 },
    },
    icons,
    theme: optionTheme,
  })

  app.use(vuetify)
}
