import { ref, type Ref } from 'vue'
import { APP_STAGE } from '@shared/constants/appStageConstants'

type UseI18nOptions = {
  useScope?: 'global' | typeof APP_STAGE.LOCAL
}

const globalLocale = ref('en')

export function useI18n(_options?: UseI18nOptions): { locale: Ref<string>; t: (key: string) => string } {
  return { 
    locale: globalLocale,
    t: (key: string) => key // Mock translation function
  }
}


