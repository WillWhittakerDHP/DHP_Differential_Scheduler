/**
 * LEARNING: Shared auth strategy contract for Feature 7 — strategies plug in here; routes stay thin.
 * WHY: Magic-link and password flows share one boundary so Phase 7.3+ does not reshape Express handlers.
 * PATTERN: Barrel — concrete exports live in core + placeholder modules (file-cohesion).
 */
export * from './strategyTypesCore.js'
export * from './strategyPlaceholder501.js'
