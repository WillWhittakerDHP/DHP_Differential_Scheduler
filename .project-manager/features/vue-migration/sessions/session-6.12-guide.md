# Phase 6 Session 6.12 Guide: Refactor Annotations

**Feature:** Vue Migration  
**Purpose:** Session-level guide for replacing description system with annotation system using shape-instance pattern

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.12 - Refactor Annotations
**Status:** ✅ Complete

---

## Session Overview

**Session Number:** 6.12
**Session Name:** Refactor Annotations
**Description:** Replace description system with annotation system using shape-instance pattern. Annotations follow the same pattern as Block/Part (shape-instance), supporting multiple annotation contexts (descriptions, frontPage, etc.) and user-type filtering via BlockInstance entities.

**Duration:** Completed retroactively
**Dependencies:** Sessions 6.4-6.7 (User-Specific Descriptions - replaced)

---

## Session Objectives

- Remove Description and BlockInstanceDescription models
- Create Annotation, AnnotationShape, AnnotationInstance models
- Migrate database from descriptions to annotations
- Update transformers to use annotation system
- Create annotation routers (annotation-instances, annotation-shapes)
- Update field configs for annotation fields
- Migrate user types to BlockInstance entities for annotations

---

## Key Deliverables

- Annotation models (Annotation, AnnotationShape, AnnotationInstance)
- Annotation routers (annotation-instances, annotation-shapes)
- Annotation transformers and utilities
- AnnotationsField component
- AnnotationTypeCard and AnnotationTypeDialog components
- Database migrations for annotation system
- Updated field configurations

---

## Technical Approach

### Database Layer

**Removed:**
- `descriptions` table
- `block_instance_descriptions` table
- `description` column from `block_instances` table

**Added:**
- `annotations` table (main entity)
- `annotation_assignments` table (through table)
- `annotation_shapes` table
- `annotation_instances` table
- User type migration: `user_type` varchar → `user_type_block_instance_id` UUID

### Backend Changes

**Removed:**
- Description model
- BlockInstanceDescription model
- DescriptionRouter (`/api/descriptions` endpoints)

**Added:**
- Annotation model
- AnnotationAssignment model
- AnnotationShape model
- AnnotationInstance model
- AnnotationInstanceRouter (`/api/annotation-instances`)
- AnnotationShapeRouter (`/api/annotation-shapes`)

### Frontend Changes

**Removed:**
- Description transformation logic
- Description field handling

**Added:**
- Annotation transformers and utilities
- AnnotationsField component
- AnnotationTypeCard component
- AnnotationTypeDialog component
- Annotation field configurations

---

## Files Modified

### Backend
- `server/src/db/models/scheduler/annotation.ts` (new)
- `server/src/db/models/scheduler/annotation_assignment.ts` (new)
- `server/src/db/models/scheduler/annotation_shape.ts` (new)
- `server/src/db/models/scheduler/annotation_instance.ts` (new)
- `server/src/db/models/scheduler/description.ts` (deleted)
- `server/src/db/models/scheduler/block_instance_description.ts` (deleted)
- `server/src/db/migrations/20251202_rename_descriptions_to_annotations.mjs` (new)
- `server/src/db/migrations/20251202_remove_block_instance_description_column.mjs` (new)
- `server/src/db/migrations/20251202_rename_annotation_tables_to_shape_instance_pattern.mjs` (new)
- `server/src/routes/internal/annotation-instances/annotationInstanceRouter.ts` (new)
- `server/src/routes/internal/annotation-shapes/annotationShapeRouter.ts` (new)
- `server/src/routes/internal/descriptions/descriptionRouter.ts` (deleted)
- `server/src/db/models/index.ts` (updated)
- `server/src/routes/internal/index.ts` (updated)
- `server/src/routes/internal/entities/entityRouter.ts` (updated)

### Frontend
- `client-vue/src/types/annotations.ts` (new)
- `client-vue/src/constants/annotations.ts` (new)
- `client-vue/src/utils/annotationUtils.ts` (new)
- `client-vue/src/utils/transformers/annotationTransformers.ts` (new)
- `client-vue/src/components/admin/generic/fields/AnnotationsField.vue` (new)
- `client-vue/src/views/admin/components/AnnotationTypeCard.vue` (new)
- `client-vue/src/views/admin/dialogs/AnnotationTypeDialog.vue` (new)
- `client-vue/src/types/entities.ts` (updated)
- `client-vue/src/utils/transformers/fetchToGlobalTransformer.ts` (updated)
- `client-vue/src/utils/transformers/globalToBookingTransformer.ts` (updated)
- `client-vue/src/configs/field/form/selectableFieldConfig.ts` (updated)
- `client-vue/src/configs/field/display/selectableDisplayConfig.ts` (updated)

---

## Architecture Decisions

### Why Replace Descriptions with Annotations?

1. **Shape-Instance Pattern:** Annotations follow the same pattern as Block/Part (shape-instance), making the codebase more consistent
2. **Multiple Contexts:** Supports multiple annotation contexts (descriptions, frontPage, tooltip, etc.)
3. **User Type Migration:** User types migrated to BlockInstance entities (not hardcoded strings)
4. **Better Organization:** Shape-instance pattern provides better organization and reusability

### Annotation Structure

- **AnnotationShape:** Template/type for annotations (like BlockShape)
- **AnnotationInstance:** Specific annotation instance (like BlockInstance)
- **AnnotationAssignment:** Through-table linking annotations to block instances

---

## Success Criteria

- ✅ Description models and router removed
- ✅ Annotation models and routers created
- ✅ Database migrations executed successfully
- ✅ Transformers updated for annotation system
- ✅ Field configs updated for annotation fields
- ✅ User types migrated to BlockInstance entities
- ✅ Annotation UI components created

---

## Related Documents

- Phase 6 Handoff: `project-manager/features/vue-migration/phases/phase-6-handoff.md`
- Sessions 6.4-6.7: User-Specific Descriptions (replaced)
- ANNOTATION_REFACTOR_TRACKING.md
- `.cursor/plans/annotation-system-separation-implementation-log.md`
- `.cursor/plans/user-types-annotations-migration-log.md`

