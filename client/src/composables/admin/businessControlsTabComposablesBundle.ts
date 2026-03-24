/**
 * PATTERN: Single composables entry for business controls tab — reduces @/composables/ import fan-out (composable-health).
 * Split re-exports for file-cohesion max-exports.
 */
export * from './businessControlsTab/bundlePartA'
export * from './businessControlsTab/bundlePartB'
