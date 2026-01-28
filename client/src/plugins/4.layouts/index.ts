/**
 * Layouts Plugin - Load Order: 4
 * 
 * LEARNING: Vuexy layout system integration
 * WHY: Provides layout components and configuration (vertical/horizontal nav, etc.)
 * PATTERN: Export default function that registers layouts with app
 * 
 * DEPENDENCY: Requires Pinia (2.pinia) - uses defineStore for layout config store
 * LOAD ORDER: Must load after Pinia, before Vuetify (which uses @layouts utilities)
 */

import type { App } from 'vue'

import type { PartialDeep } from 'type-fest'
import { createLayouts } from '@layouts'

import { layoutConfig } from '@themeConfig'

// Styles
import '@layouts/styles/index.scss'

export default function (app: App) {
  // ℹ️ We generate layout config from our themeConfig so you don't have to write config twice
  app.use(createLayouts(layoutConfig as PartialDeep<typeof layoutConfig, NonNullable<unknown>>))
}
