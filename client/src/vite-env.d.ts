
/**
 * WHY: Vite Environment Types

LEARNING: Type definitions for Vite's import.meta.env
WHY: Provides TypeScript support for Vite environment variables
PATTERN: Reference vite/client types and extend ImportMetaEnv
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_INCLUDE_DEV_FLAGS?: string
  readonly VITE_VERBOSE_LOGGING?: string
  readonly VITE_DEBUG_SCOPES?: string
  readonly VITE_LOG_LEVEL?: string
  readonly VITE_AVAILABILITY_CACHE_TTL?: string
  readonly DEV?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly glob: (pattern: string | string[], options?: { eager?: boolean }) => Record<string, () => Promise<unknown> | unknown>
}

/**
 * Vue SFC Module Declaration
 * LEARNING: Declares .vue files as valid modules for TypeScript
 * WHY: TypeScript needs to know that .vue files can be imported
 * PATTERN: Module declaration for Vue Single File Components
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

/**
 * SVG Module Declaration
 * LEARNING: Declares .svg files as valid modules for TypeScript
 * WHY: TypeScript needs to know that .svg files can be imported
 * PATTERN: Module declaration for SVG assets
 */
declare module '*.svg' {
  const content: string
  export default content
}

/**
 * SVG Module Declaration (with ?raw query)
 * LEARNING: Declares .svg?raw files as valid modules for TypeScript
 * WHY: Vite allows importing SVG as raw string with ?raw query
 * PATTERN: Module declaration for raw SVG imports
 */
declare module '*.svg?raw' {
  const content: string
  export default content
}

/**
 * Image Module Declarations
 * LEARNING: Declares image files (.png, .jpg, .jpeg, .gif, .webp) as valid modules
 * WHY: TypeScript needs to know that image files can be imported
 * PATTERN: Module declaration for image assets
 */
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

/**
 * Third-party Module Declarations
 * LEARNING: Declares modules that may not have type definitions
 * WHY: Some packages don't provide TypeScript types or use internal paths
 */
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

/**
 * Vuetify Internal Module Declarations
 * LEARNING: Declares Vuetify internal modules that may be accessed directly
 * WHY: Some components access Vuetify internals for advanced functionality
 * NOTE: These are internal APIs and may change in Vuetify updates
 */
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


