/** App stage values shared by client and server (env, feature flags). */
export const APP_STAGE = {
  LOCAL: 'local',
  STAGING: 'staging',
  ALPHA: 'alpha',
  BETA: 'beta',
  PRODUCTION: 'production',
} as const

export type AppStageValue = (typeof APP_STAGE)[keyof typeof APP_STAGE]
