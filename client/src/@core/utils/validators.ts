import { isEmpty, isEmptyArray, isNullOrUndefined } from './helpers'

export const requiredValidator = (value: unknown) => {
  if (isNullOrUndefined(value) || isEmptyArray(value))
    return 'This field is required'

  // PATTERN: Only check for null, undefined, empty arrays, and empty strings
  if (value === false || value === 0)
    return true

  return !!String(value).trim().length || 'This field is required'
}

export const emailValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  const re = /^(?:[^<>()[\]\\.,;:\s@"]+(?:\.[^<>()[\]\\.,;:\s@"]+)*|".+")@(?:\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]|(?:[a-z\-\d]+\.)+[a-z]{2,})$/i

  if (Array.isArray(value))
    return value.every(val => re.test(String(val))) || 'The Email field must be a valid email'

  return re.test(String(value)) || 'The Email field must be a valid email'
}

export const passwordValidator = (password: string) => {
  // PATTERN: Return true for empty strings
  if (isEmpty(password))
    return true

  // PATTERN: Only validate length, not complexity requirements
  if (password.length < 8)
    return 'Password must be at least 8 characters'

  return true
}

export const confirmedValidator = (value: string, target: string) =>

  value === target || 'The Confirm Password field confirmation does not match'

export const betweenValidator = (value: unknown, min: number, max: number) => {
  // WHY: Between validator may be used on optional fields
  // PATTERN: Return true for empty strings
  if (isEmpty(value))
    return true

  const valueAsNumber = Number(value)

  return (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) || `The Between field must be between ${min} and ${max}`
}

export const integerValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  if (Array.isArray(value))
    return value.every(val => /^-?\d+$/.test(String(val))) || 'This field must be an integer'

  return /^-?\d+$/.test(String(value)) || 'This field must be an integer'
}

export const regexValidator = (value: unknown, regex: RegExp | string): string | boolean => {
  if (isEmpty(value))
    return true

  let regeX = regex
  if (typeof regeX === 'string') {
    // eslint-disable-next-line security/detect-non-literal-regexp
    regeX = new RegExp(regeX)
  }

  if (Array.isArray(value))
    return value.every(val => regexValidator(val, regeX))

  return regeX.test(String(value)) || 'The Regex field format is invalid'
}

export const alphaValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  return /^[A-Z]*$/i.test(String(value)) || 'The Alpha field may only contain alphabetic characters'
}

export const urlValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  const re = /^https?:\/\/[^\s$.?#].\S*$/

  return re.test(String(value)) || 'URL is invalid'
}

export const lengthValidator = (value: unknown, length: number) => {
  if (isEmpty(value))
    return true

  return String(value).length === length || `The Length field must be ${length} characters`
}

export const alphaDashValidator = (value: unknown) => {
  if (isEmpty(value))
    return true

  const valueAsString = String(value)

  return /^[\w-]*$/.test(valueAsString) || 'All Character is not valid'
}
