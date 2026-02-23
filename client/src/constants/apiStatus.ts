
export const API_STATUS_HIT = 'hit' as const

export const API_STATUS_ERROR = 'error' as const

export const API_STATUS_NOT_CALLED = 'not_called' as const

export const API_STATUS_COLOR_SUCCESS = 'success' as const

export const API_STATUS_COLOR_ERROR = 'error' as const

export const API_STATUS_COLOR_DEFAULT = 'default' as const

export const API_STATUS_LABEL_HIT = 'Hit' as const

export const API_STATUS_LABEL_ERROR = 'Error' as const

export const API_STATUS_LABEL_NOT_CALLED = 'Not Called' as const

export type ApiStatusValue = typeof API_STATUS_HIT | typeof API_STATUS_ERROR | typeof API_STATUS_NOT_CALLED

export const API_STATUS_COLOR_MAP: Record<ApiStatusValue, string> = {
  [API_STATUS_HIT]: API_STATUS_COLOR_SUCCESS,
  [API_STATUS_ERROR]: API_STATUS_COLOR_ERROR,
  [API_STATUS_NOT_CALLED]: API_STATUS_COLOR_DEFAULT,
}

export const API_STATUS_LABEL_MAP: Record<ApiStatusValue, string> = {
  [API_STATUS_HIT]: API_STATUS_LABEL_HIT,
  [API_STATUS_ERROR]: API_STATUS_LABEL_ERROR,
  [API_STATUS_NOT_CALLED]: API_STATUS_LABEL_NOT_CALLED,
}
