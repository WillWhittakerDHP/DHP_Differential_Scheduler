export const avatarText = (value: string) => {
  if (!value)
    return ''
  const nameArray = value.split(' ')

  return nameArray.map(word => word.charAt(0).toUpperCase()).join('')
}

export const kFormatter = (num: number) => {
  const regex = /\B(?=(\d{3})+(?!\d))/g

  return Math.abs(num) > 9999 ? `${Math.sign(num) * +((Math.abs(num) / 1000).toFixed(1))}k` : Math.abs(num).toFixed(0).replace(regex, ',')
}

/**
 * @deprecated Use useLocalTime.formatDateForDisplay() or formatDateTimeForDisplay() instead
 * This function uses local time methods directly and violates UTC/RFC3339 compliance.
 * All date formatting should go through useLocalTime composable at UI boundaries.
 */
export const formatDate = (value: string, formatting: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value)
    return value

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

/**
 * @deprecated Use useLocalTime.formatDateForDisplay() or formatDateTimeForDisplay() instead
 * This function uses local time methods directly and violates UTC/RFC3339 compliance.
 * All date formatting should go through useLocalTime composable at UI boundaries.
 */
export const formatDateToMonthShort = (value: string, toTimeForCurrentDay = true) => {
  // Deprecated - use useLocalTime composable instead
  const date = new Date(value)
  let formatting: Record<string, string> = { month: 'short', day: 'numeric' }

  if (toTimeForCurrentDay) {
    const today = new Date()
    if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      formatting = { hour: 'numeric', minute: 'numeric' }
    }
  }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

export const prefixWithPlus = (value: number) => value > 0 ? `+${value}` : value
