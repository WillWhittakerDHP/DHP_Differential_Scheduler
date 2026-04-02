/**
 * Appointment route helpers — split by concern; import from submodules for targeted deps.
 *
 * PATTERN: Persistence-only appointment mutations (see `.project-manager/ARCHITECTURE.md` booking boundary / FEATURE_20 §4.5).
 * WHY: Server stores the client-submitted wizard payload; it does not re-run PartFinalizer or verify resolved booking totals.
 */
export * from './appointmentSettingsHelpers.js'
export * from './appointmentIncludeOptions.js'
export * from './appointmentPersistenceHelpers.js'
