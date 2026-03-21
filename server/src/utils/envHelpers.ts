import { APP_STAGE, NODE_ENV, type AppStageValue } from '../constants/appConstants.js'

export function isProduction(): boolean {
  return process.env.NODE_ENV === NODE_ENV.PRODUCTION
}

export function getAppStage(): AppStageValue {
  return (process.env.APP_STAGE as AppStageValue) || APP_STAGE.LOCAL
}

export function isPreRelease(): boolean {
  const stage = getAppStage()
  return stage !== APP_STAGE.PRODUCTION
}
