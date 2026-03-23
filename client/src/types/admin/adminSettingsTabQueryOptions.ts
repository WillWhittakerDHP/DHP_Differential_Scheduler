import type { Ref } from 'vue'

/** Optional gate for admin settings composables (e.g. tab active → skip fetch until enabled). */
export interface AdminSettingsTabQueryOptions {
  enabled?: Ref<boolean>
}
