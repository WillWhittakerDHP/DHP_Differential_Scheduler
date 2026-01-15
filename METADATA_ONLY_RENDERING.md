# Metadata-Only Field Rendering Pipeline

## Overview

All field configuration is now **metadata-only**. The `/admin-input-metadata` API endpoint is the single source of truth for:
- Field existence (which field keys exist)
- Visibility/layout/panel placement
- Rendering kind (`renderAs`: text, select, multiselect, reference, statusButton)
- Select/nested/reference behavior (`input_config` JSONB)

## Data Flow

```mermaid
flowchart TD
  DB[admin_input_metadata table] --> API[/admin-input-metadata API]
  API --> useEntityMetadata[useEntityMetadata composable]
  useEntityMetadata --> useFieldVisibility[useFieldVisibility]
  useFieldVisibility --> visibleFields[visibleFields array]
  
  useEntityMetadata --> useFormFieldsContext[useFormFieldsContext]
  useFormFieldsContext --> FieldContext[FieldContext with displayConfig]
  FieldContext --> InputRenderer[InputRenderer]
  
  FieldContext --> useFieldTypeDetermination[useFieldTypeDetermination]
  useFieldTypeDetermination --> isPrimitive[isPrimitive/isSelect/isNested]
  
  FieldContext --> useSelectConfig[useSelectConfig]
  FieldContext --> useNestedCollectionField[useNestedCollectionField]
  useSelectConfig --> metadata.inputConfig[metadata.inputConfig]
  useNestedCollectionField --> metadata.inputConfig
```

## Key Components

### Backend

- **`admin_input_metadata` table**: Stores field metadata with `input_config` JSONB column
- **`/admin-input-metadata/:entityType/:entityId` API**: Returns metadata with inheritance support
- **Migration**: `20260120_add_input_config_to_admin_input_metadata.mjs` adds `input_config` column
- **Backfill script**: `backfill-input-config-from-selectable.mjs` migrates select configs from frontend to DB

### Frontend Composables

- **`useEntityMetadata`**: Fetches metadata from `/admin-input-metadata` API
- **`useFieldVisibility`**: Determines visible fields from metadata (metadata-only, no formFieldConfig)
- **`useFormFieldsContext`**: Creates FieldContext with `displayConfig` derived from metadata
- **`useFieldTypeDetermination`**: Determines input component type from `metadata.renderAs` + `metadata.inputConfig`
- **`useSelectConfig`**: Reads select config from `metadata.inputConfig` (not `adminConfig.getFormFieldConfig`)
- **`useNestedCollectionField`**: Reads nested config from `metadata.inputConfig`

### Field Context Creation

FieldContext `displayConfig` is built from metadata:

```typescript
displayConfig: {
  label: metadata.label,
  placeholder: metadata.placeholder || `Enter ${fieldKey}`,
  fieldType: deriveFieldType(metadata.renderAs, metadata.dataType, metadata.inputConfig),
  required: metadata.isRequired,
  disabled: metadata.disabled ?? false,
  readOnly: metadata.readOnly ?? false,
  helpText: metadata.helpText,
}
```

### Field Type Determination

Field type is derived from metadata:

- `renderAs: 'statusButton'` → Status button (rendered in panel title)
- `renderAs: 'select'|'multiselect'|'reference'` + `inputConfig.selectMode === 'nested'` → PartsCollection
- `renderAs: 'select'|'multiselect'|'reference'` → SelectInputs
- `renderAs: 'text'` + `dataType: 'boolean'` → BooleanInput
- `renderAs: 'text'` + `dataType: 'number'` → NumberInput
- `renderAs: 'text'` → TextInput/TextArea

## Deprecated Code

### Archived Files

- `client/src/configs/field/form/primitiveFieldConfig.ts` → `_archived/`
- `client/src/configs/field/form/selectableFieldConfig.ts` → `_archived/`

### Deprecated Functions

- `buildFormFieldConfig()`: Returns empty configs (metadata is authoritative)
- `getFormFieldConfig()`: Returns `undefined` with dev warning
- `getEntityFormFieldConfig()`: Returns `{}` with dev warning

### Dev Guards

In dev mode, accessing deprecated functions logs warnings:

```
[useAdminConfig] DEPRECATED: getFormFieldConfig(blockInstance, name) called.
Form field configs are now metadata-only. Use /admin-input-metadata and metadata.inputConfig instead.
```

## Migration Checklist

- [x] Backend: Add `input_config` JSONB column to `admin_input_metadata`
- [x] Backend: Update router to expose `inputConfig` in GET/POST
- [x] Backend: Validate `inputConfig` required for select/multiselect/reference fields
- [x] Backend: Create backfill script to migrate select configs from frontend
- [x] Client: Make `useFieldVisibility` metadata-only
- [x] Client: Make `useStatusButtonFields` metadata-only
- [x] Client: Make `useFormFieldsContext` build `displayConfig` from metadata
- [x] Client: Make `useSelectConfig` read from `metadata.inputConfig`
- [x] Client: Make `useNestedCollectionField` read from `metadata.inputConfig`
- [x] Client: Make `buildFormFieldConfig` return empty configs
- [x] Client: Add dev guards to deprecated `getFormFieldConfig` functions
- [x] Client: Archive primitive/selectable config files
- [ ] Run backfill script to populate `input_config` in database
- [ ] Verify `partShape.active` renders correctly
- [ ] Test all select/nested fields render correctly

## Testing

To verify metadata-only rendering:

1. **Check status buttons**: `partShape.active` should render as status button when configured in metadata
2. **Check select fields**: Select fields should read config from `metadata.inputConfig`
3. **Check nested fields**: Nested fields (like `activeConstituents`) should read config from `metadata.inputConfig`
4. **Check dev warnings**: In dev mode, accessing `getFormFieldConfig` should log warnings

## Next Steps

1. Run backfill script: `node server/src/scripts/backfill-input-config-from-selectable.mjs`
2. Verify all fields render correctly
3. Remove any remaining calls to deprecated functions
4. Delete archived config files after verification period
