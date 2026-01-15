# Archived Composables

This directory contains composables that have been deprecated and replaced with metadata-only implementations.

## useFieldMetadata.ts

**Status:** ARCHIVED - Deprecated

**Reason:** This composable derived field metadata from `formFieldConfig` which has been removed. All field configuration now comes from `/admin-input-metadata` via `useEntityMetadata`.

**Replacement:** Use `useEntityMetadata` composable instead, which fetches metadata from `/admin-input-metadata` endpoint.

**Migration:**
- Old: `getFieldMetadata(entityKey, fieldKey)`
- New: `useEntityMetadata(entityKey, entity)` then access `fieldMetadata.value[fieldKey]`

**Test Files:** Tests in `__tests__/useFieldMetadata.test.ts` are kept for reference but should be updated to test `useEntityMetadata` instead.
