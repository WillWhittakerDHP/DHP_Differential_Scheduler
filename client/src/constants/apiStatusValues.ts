const API_STATUS_HIT_CORE = 'hit' as const
const API_STATUS_ERROR_CORE = 'error' as const
const API_STATUS_NOT_CALLED_CORE = 'not_called' as const

export const API_STATUS_HIT = API_STATUS_HIT_CORE

export const API_STATUS_ERROR = API_STATUS_ERROR_CORE

export const API_STATUS_NOT_CALLED = API_STATUS_NOT_CALLED_CORE

export const API_STATUS_COLOR_SUCCESS = 'success' as const

export const API_STATUS_COLOR_ERROR = 'error' as const

export const API_STATUS_COLOR_DEFAULT = 'default' as const

export const API_STATUS_LABEL_HIT = 'Hit' as const

export const API_STATUS_LABEL_ERROR = 'Error' as const

export const API_STATUS_LABEL_NOT_CALLED = 'Not Called' as const

export type ApiStatusValue =
  | typeof API_STATUS_HIT_CORE
  | typeof API_STATUS_ERROR_CORE
  | typeof API_STATUS_NOT_CALLED_CORE
