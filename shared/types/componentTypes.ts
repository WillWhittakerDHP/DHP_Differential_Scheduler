/**
 * Shared component config types
 *
 * WHY: Entity registry (server) and component UI (client) use the same config shape
 * PATTERN: Types in shared; entity-specific config lives in client/server
 */

export type ComponentStrategy = 'sum' | 'merge' | 'first' | 'every' | 'custom'

export interface ComponentConfig {
  enabled: boolean
  componentRules?: Record<string, ComponentStrategy>
}
