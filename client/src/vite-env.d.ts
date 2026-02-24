
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_APP_STAGE?: string
  readonly VITE_INCLUDE_DEV_FLAGS?: string
  readonly VITE_VERBOSE_LOGGING?: string
  readonly VITE_DEBUG_SCOPES?: string
  readonly VITE_LOG_LEVEL?: string
  /** When set (e.g. "1" or "true"), logger appends caller file:line for debug/warn/error. Dev-only. */
  readonly VITE_LOG_CALLSITE?: string
  readonly VITE_AVAILABILITY_CACHE_TTL?: string
  readonly DEV?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly glob: (pattern: string | string[], options?: { eager?: boolean }) => Record<string, () => Promise<unknown> | unknown>
}

/**
LEARNING: Declares .vue files as valid module...
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

/**
LEARNING: Declares .svg files as valid modules fo...
 */
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.svg?raw' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module 'shepherd.js' {
  export class Shepherd {
    static activeTour?: {
      cancel(): void
    }
    constructor(options?: unknown)
    addStep(options?: unknown): unknown
    start(): void
  }
  const ShepherdClass: typeof Shepherd
  export default ShepherdClass
}

declare module 'shiki' {
  export function getSingletonHighlighter(options?: {
    themes?: string[]
    langs?: string[]
  }): Promise<{
    codeToHtml: (code: string, options?: { lang?: string; theme?: string }) => string
  }>
}

declare module 'vuetify/lib/components/VField/VField' {
  import type { Component } from 'vue'
  export const VField: Component & {
    filterProps: (props: Record<string, unknown>) => Record<string, unknown>
  }
  export function makeVFieldProps(defaults?: Record<string, unknown>): Record<string, unknown>
}

declare module 'vuetify/lib/components/VInput/VInput' {
  import type { Component } from 'vue'
  export const VInput: Component & {
    filterProps: (props: Record<string, unknown>) => Record<string, unknown>
  }
  export function makeVInputProps(defaults?: Record<string, unknown>): Record<string, unknown>
}

declare module 'vuetify/lib/util/helpers' {
  export function filterInputAttrs(attrs: Record<string, unknown>): [Record<string, unknown>, Record<string, unknown>]
}


