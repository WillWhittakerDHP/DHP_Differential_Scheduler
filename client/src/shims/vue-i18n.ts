import { ref, type Ref } from 'vue'

/**
 * Minimal `vue-i18n` shim
 *
 * but `vue-i18n` is not currently installed as a dependency.
 *
 * decide whether to add full `vue-i18n` support later.
 *
 * IMPORTANT:
 * - This does NOT provide real translation; it only tracks `locale`.
 * - If/when we add `vue-i18n`, remove the tsconfig/vite alias and this shim.
 */

type UseI18nOptions = {
  useScope?: 'global' | 'local'
}

const globalLocale = ref('en')

export function useI18n(_options?: UseI18nOptions): { locale: Ref<string>; t: (key: string) => string } {
  return { 
    locale: globalLocale,
    t: (key: string) => key // Mock translation function
  }
}


