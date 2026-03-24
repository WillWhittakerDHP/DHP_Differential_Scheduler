/**
 * PATTERN: Single composables entry for post-fetch phase — reduces @/composables/ import fan-out (composable-health).
 * Re-exports use relative paths; split across submodules for file-cohesion max-exports.
 */
export * from './availabilityOrchestratorPostFetch/composablesExports'
export * from './availabilityOrchestratorPostFetch/wiresAndTypesExports'
