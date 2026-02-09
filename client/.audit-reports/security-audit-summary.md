# Security Audit Summary (Generated)

Generated from `.audit-reports/security-audit.json`.

## Summary

- Total errors: **49**
- Total warnings: **266**
- Files with issues: **78**

## Categories (sorted by priority)

| Category | Priority | Score | Errors | Warnings |
| --- | --- | ---: | ---: | ---: |
| Exposed Secrets | P0 | 1330 | 0 | 266 |
| CSRF Protection | P0 | 540 | 45 | 0 |
| IDOR Vulnerabilities | P0 | 48 | 4 | 0 |
| Dependency Vulnerabilities | P2 | 0 | 0 | 0 |
| Security Configuration | P2 | 0 | 0 | 0 |
| Authentication Patterns | P2 | 0 | 0 | 0 |

## Files with Issues (sorted by priority)

| File | Priority | Score | Categories | Issues |
| --- | --- | ---: | --- | ---: |
| `server/src/routes/internal/properties/propertyRouter.ts` | P0 | 180 | csrf, idor | 18 |
| `server/src/routes/internal/entities/entityRouter.ts` | P0 | 140 | csrf, idor | 14 |
| `server/src/routes/internal/appointments/appointmentRouter.ts` | P0 | 100 | csrf, idor | 10 |
| `server/src/routes/internal/relationships/relationshipRouter.ts` | P0 | 100 | csrf | 10 |
| `server/src/routes/internal/users/userRouter.ts` | P0 | 100 | csrf, idor | 10 |
| `server/src/db/migrations/20250130_rename_type_to_shape.mjs` | P0 | 96 | secrets | 32 |
| `server/src/routes/internal/businessRulesRouter.ts` | P0 | 80 | csrf | 8 |
| `server/src/routes/internal/businessSettingsRouter.ts` | P0 | 80 | csrf | 8 |
| `server/src/db/migrations/20250130_rename_profile_to_instance.js` | P0 | 72 | secrets | 24 |
| `server/src/db/migrations/20250130_rename_profile_to_instance.mjs` | P0 | 72 | secrets | 24 |
| `server/src/scripts/fix-missing-layout-configs.mjs` | P0 | 72 | secrets | 24 |
| `server/src/db/migrations/20260130_ensure_relationship_keys_removed_from_primitive_metadata.mjs` | P0 | 66 | secrets | 22 |
| `server/src/scripts/cleanup-relationship-keys-from-primitive-metadata.mjs` | P0 | 66 | secrets | 22 |
| `server/src/db/migrations/20260115_remove_activeparts_from_primitive_metadata.mjs` | P0 | 60 | secrets | 20 |
| `server/src/db/migrations/20260131_force_delete_relationship_keys_from_primitive_metadata.mjs` | P0 | 60 | secrets | 20 |
| `server/src/config/googleOAuth.ts` | P0 | 54 | secrets | 18 |
| `server/src/db/migrations/20260129_remove_relationship_keys_from_primitive_metadata.mjs` | P0 | 54 | secrets | 18 |
| `server/src/db/migrations/20260130_173500_fix_all_activeparts_references.mjs` | P0 | 54 | secrets | 18 |
| `server/src/scripts/fix-primitive-metadata-cleanup.mjs` | P0 | 54 | secrets | 18 |
| `server/src/routes/internal/admin-metadata/adminMetadataRouter.ts` | P0 | 52 | secrets, csrf | 8 |
| `server/src/db/migrations/20260115_migrate_field_metadata_to_new_tables.mjs` | P0 | 48 | secrets | 16 |
| `server/src/db/migrations/20260201_update_constituents_to_parts_in_relationship_metadata.mjs` | P0 | 48 | secrets | 16 |
| `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataRouter.ts` | P0 | 40 | csrf | 4 |
| `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataRouter.ts` | P0 | 40 | csrf | 4 |
| `server/src/db/migrations/20251202_rename_annotation_tables_to_shape_instance_pattern.mjs` | P0 | 36 | secrets | 12 |
| `server/src/db/migrations/20260204_000015_remove_shape_columns_from_event_assignments.mjs` | P0 | 36 | secrets | 12 |
| `server/src/scripts/manual-migrate-fieldmetadata.mjs` | P0 | 36 | secrets | 12 |
| `server/src/db/migrations/20260130_ensure_partassignments_in_input_config.mjs` | P0 | 30 | secrets | 10 |
| `server/src/app.ts` | P0 | 24 | secrets | 8 |
| `server/src/db/migrations/20251128_rename_relationship_tables.js` | P0 | 24 | secrets | 8 |
| `server/src/db/migrations/20260130_fix_activeparts_in_input_config.mjs` | P0 | 24 | secrets | 8 |
| `server/src/db/migrations/20260131154000_force_insert_event_shape_metadata.mjs` | P0 | 24 | secrets | 8 |
| `server/src/db/migrations/20260131160000_fix_event_shape_metadata_final.mjs` | P0 | 24 | secrets | 8 |
| `server/src/db/migrations/20260204_000016_standardize_event_assignments_to_parent_child.mjs` | P0 | 24 | secrets | 8 |
| `server/src/db/migrations/20260204_000020_remove_legacy_attendee_columns.mjs` | P0 | 24 | secrets | 8 |
| `server/src/api/api.routes.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/external/calendarRoutes.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/external/mapsRoutes.ts` | P0 | 20 | csrf | 2 |
| `server/src/routes/internal/availabilityRouter.ts` | P0 | 20 | csrf | 2 |
| `server/src/db/migrations/20260108_rename_relationships_to_domain_terms.mjs` | P0 | 18 | secrets | 6 |
| `server/src/db/migrations/20260130_fix_all_active_assignments_in_metadata.mjs` | P0 | 18 | secrets | 6 |
| `server/src/db/migrations/20260130_fix_dependent_instance_naming.mjs` | P0 | 18 | secrets | 6 |
| `server/src/db/migrations/20260130_rename_active_tables_to_assignments.mjs` | P0 | 18 | secrets | 6 |
| `server/src/scripts/backfill-input-config-from-selectable.mjs` | P0 | 18 | secrets | 6 |
| `server/src/scripts/check-specific-shape.mjs` | P0 | 18 | secrets | 6 |
| `server/src/db/migrations/20251202_rename_descriptions_to_annotations.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260106_120000_convert_single_fks_to_arrays.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260107_02_deprecate_properties_table.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260127_rename_active_constituents_to_active_parts.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260127_rename_valid_constituents_to_valid_parts.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260129132124_update_metadata_constituable_to_canhaveparts.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260130_create_event_tables.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260130_create_valid_annotation_table.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260130_update_activeparts_to_partassignments_in_metadata.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260131153000_fix_missing_event_shape_metadata.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260131155000_direct_insert_event_shape_metadata.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260204_000000_fix_event_assignments_selecttype.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260204_000017_create_event_shape_attendees.mjs` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20260204_000018_create_appointment_attendees.mjs` | P1 | 12 | secrets | 4 |
| `server/src/scripts/fix-validConstituents.mjs` | P1 | 12 | secrets | 4 |
| `server/src/services/driveTimeCache.ts` | P1 | 12 | secrets | 4 |
| `server/src/db/migrations/20250127_02_add_type_to_annotations.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20250127_add_type_to_annotations.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260106_04_update_appointments_property_reference.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260106_05_migrate_properties_to_three_table.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260107_01_rename_service_components_to_instance_components.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260118_unify_metadata_tables.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260129132826_update_metadata_label_constituable_to_state_control.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260129133903_fix_canhaveparts_metadata_label.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260129134130_fix_activeparts_render_as.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260130_180000_remove_computed_fields_from_partinstance_metadata.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260201_drop_deprecated_field_metadata_table.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260204_000006_fix_valid_events_render_as.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260204_000007_force_fix_valid_events_render_as.mjs` | P2 | 6 | secrets | 2 |
| `server/src/db/migrations/20260204_000021_remove_email_unique_constraint_in_dev.mjs` | P2 | 6 | secrets | 2 |
| `server/src/scripts/check-layout-configs.mjs` | P2 | 6 | secrets | 2 |
| `server/src/scripts/fix-valid-events-render-as.mjs` | P2 | 6 | secrets | 2 |
| `server/src/services/googleCalendarService.ts` | P2 | 6 | secrets | 2 |

## Notes

- This is a *signal* index. Use the full report for line-level matches and details: `client/.audit-reports/security-audit.md`.
- **P0**: Critical security issues (fix soon)
- **P1**: Important security issues (high leverage cleanup)
- **P2**: Low priority (best practices)
