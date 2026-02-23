import { ref, type Ref } from 'vue'


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


