/**
 * Shared component config types
 *
 * LEARNING: ComponentConfig and ComponentStrategy shared between client and server (Phase 1.3 type-similarity UNIFY)
 * WHY: Entity registry (server) and component UI (client) use the same config shape
 * PATTERN: Types in shared; entity-specific config lives in client/server
 */

export type ComponentStrategy = 'sum' | 'merge' | 'first' | 'every' | 'custom'

export interface ComponentConfig {
  enabled: boolean
  componentRules?: Record<string, ComponentStrategy>
}
