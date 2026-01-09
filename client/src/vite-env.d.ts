/// <reference types="vite/client" />

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
  // Add other Vite environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
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


