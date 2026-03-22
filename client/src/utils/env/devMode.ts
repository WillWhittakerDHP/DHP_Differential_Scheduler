import { APP_STAGE } from '@shared/constants/appStageConstants'

export function isDevModeEnabled(): boolean {
  return import.meta.env.DEV || import.meta.env.VITE_INCLUDE_DEV_FLAGS === 'true'
}

export function getAppStage(): string {
  return import.meta.env.VITE_APP_STAGE || APP_STAGE.LOCAL
}

