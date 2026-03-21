
import { setCredentials } from '../../../config/googleOAuth.js'

export function setCalendarCredentials(tokens: {
  access_token?: string | null
  refresh_token?: string | null
  expiry_date?: number | null
}): void {
  setCredentials(tokens)
}
