// Ported from [Nuxt](https://github.com/nuxt/nuxt/blob/main/packages/nuxt/src/app/composables/cookie.ts)

import { isRef, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { CookieParseOptions, CookieSerializeOptions } from 'cookie-es'
import { parse, serialize } from 'cookie-es'
import { destr } from 'destr'

type _CookieOptions = Omit<CookieSerializeOptions & CookieParseOptions, 'decode' | 'encode'>

export interface CookieOptions<T = unknown> extends _CookieOptions {
  decode?(value: string): T
  encode?(value: T): string
  default?: () => T | Ref<T>
  watch?: boolean | 'shallow'
}

export type CookieRef<T> = Ref<T>

/**
 * LEARNING: Defaults must be generic because `decode` returns `T`.
 * WHY: Cookie values are strings at rest; decoding is caller-defined (and typed as `T`).
 * NOTE: The `as T` cast is unavoidable here because runtime decoding can't prove `T`.
 */
function createCookieDefaults<T>(): CookieOptions<T> {
  return {
    path: '/',
    watch: true,
    decode: (val: string) => destr(decodeURIComponent(val)) as T,
    encode: (val: T) => encodeURIComponent(typeof val === 'string' ? val : JSON.stringify(val)),
  }
}

export const useCookie = <T = string | null | undefined>(name: string, _opts?: CookieOptions<T>): CookieRef<T> => {
  const opts: CookieOptions<T> = { ...createCookieDefaults<T>(), ...(_opts ?? {}) }
  const cookies = parse(document.cookie)

  const rawValue = cookies[name]
  const defaultValue = opts.default?.()
  const resolvedDefaultValue = isRef(defaultValue) ? defaultValue.value : defaultValue

  const cookie = ref<T | undefined>(
    rawValue !== undefined
      ? opts.decode?.(rawValue)
      : resolvedDefaultValue
  )

  watch(cookie, () => {
    document.cookie = serializeCookie(name, cookie.value, opts)
  })

  return cookie as CookieRef<T>
}

function serializeCookie<T>(
  name: string,
  value: T | undefined,
  opts: CookieOptions<T>
): string {
  // LEARNING: Strip non-`cookie-es` options before passing to serialize.
  // WHY: Our CookieOptions includes decode/encode/default/watch which `cookie-es` doesn't understand.
  const { decode: _decode, encode: _encode, default: _default, watch: _watch, ...serializeOpts } = opts

  if (value === null || value === undefined)
    return serialize(name, '', { ...(serializeOpts as CookieSerializeOptions), maxAge: -1 })

  const encoded = opts.encode ? opts.encode(value) : String(value)
  return serialize(name, encoded, { ...(serializeOpts as CookieSerializeOptions), maxAge: 60 * 60 * 24 * 30 })
}
