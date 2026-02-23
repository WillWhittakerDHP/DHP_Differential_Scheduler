/**
 * Layouts Plugin - Load Order: 4
 * 
 * 
 * DEPENDENCY: Requires Pinia (2.pinia) - uses defineStore for layout config store
 * LOAD ORDER: Must load after Pinia, before Vuetify (which uses @layouts utilities)
 */

import type { App } from 'vue'

import type { PartialDeep } from 'type-fest'
import { createLayouts } from '@layouts'

import { layoutConfig } from '@themeConfig'

import '@layouts/styles/index.scss'

export default function (app: App) {
  app.use(createLayouts(layoutConfig as PartialDeep<typeof layoutConfig, NonNullable<unknown>>))
}
