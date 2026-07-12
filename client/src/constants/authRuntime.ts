/**
 * Client auth runtime — mirrors server AUTH_STRATEGY.
 * When `none`, admin routes skip login and the API uses dev bypass user.
 */
export type ClientAuthStrategy = 'none' | 'magic_link' | 'password'

export function readClientAuthStrategy(): ClientAuthStrategy {
  const raw = import.meta.env.VITE_AUTH_STRATEGY
  if (raw === 'magic_link' || raw === 'password' || raw === 'none') {
    return raw
  }
  return 'none'
}

export function isAuthDisabled(): boolean {
  return readClientAuthStrategy() === 'none'
}
