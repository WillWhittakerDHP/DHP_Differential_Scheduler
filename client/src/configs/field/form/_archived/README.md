# Archived Form Field Configs

## Deprecated Files

These files are archived because form field configuration is now **metadata-only**.

All field configuration (primitive types, select configs, rendering) now comes from `/admin-input-metadata` and the `admin_input_metadata` database table.

### Archived Files

- `primitiveFieldConfig.ts` - Primitive field type definitions (text, number, boolean, etc.)
- `selectableFieldConfig.ts` - Select field configurations (relationshipSelect, typeSelect)

### Migration

Select configs from `selectableFieldConfig.ts` have been migrated to the database via:
- `server/src/scripts/backfill-input-config-from-selectable.mjs`

### Current State

- `buildFormFieldConfig()` now returns empty configs
- `getFormFieldConfig()` and `getEntityFormFieldConfig()` return empty/undefined with dev warnings
- All field configuration comes from `/admin-input-metadata` API endpoint
- Field rendering is determined by `metadata.renderAs` + `metadata.inputConfig`

### See Also

- `client/src/composables/admin/useEntityMetadata.ts` - Fetches metadata from API
- `client/src/composables/admin/useSelectConfig.ts` - Reads select config from `metadata.inputConfig`
- `server/src/routes/internal/admin-input-metadata/adminInputMetadataRouter.ts` - Metadata API
