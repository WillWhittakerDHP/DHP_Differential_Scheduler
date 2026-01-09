# Phase 6 Session 6.6 Guide: User-Specific Descriptions - Admin Portal

**Feature:** Vue Migration  
**Purpose:** Session-level guide for enabling Description CRUD and relationship management in admin portal

**Tier:** Session (Tier 3 - Detailed Implementation)

**Phase:** 6 - Booking Wizard Logic Integration
**Session:** 6.6 - User-Specific Descriptions - Admin Portal
**Status:** Not Started

---

## Session Overview

**Session Number:** 6.6
**Session Name:** User-Specific Descriptions - Admin Portal
**Description:** Add Description entity to admin portal with CRUD operations, and add descriptions relationship field to BlockProfile form for multi-select.

**Duration:** Estimated 3-4 hours
**Dependencies:** Session 6.5 complete (API Types & Transformers)

---

## Session Objectives

- Add Description entity to admin portal (new entity type with CRUD)
- Add descriptions relationship field to BlockProfile form (multi-select)
- Create Description select component that shows description text in dropdown
- Allow creating new descriptions from BlockProfile form
- Allow selecting existing descriptions from dropdown
- Test Description CRUD operations
- Test BlockProfile description relationship management

---

## Key Deliverables

- Description entity config in instanceConfig.ts
- Descriptions relationship field on BlockProfile form
- Description CRUD working
- Relationship management working

---

## Detailed Task Breakdown

### Task 6.6.1: Add Description Entity Config

**File:** `client/src/admin/configs/instanceConfig.ts`

**Steps:**
1. Add description entity config to buildInstanceConfig
2. Define titleField, inlineFields, stackedFields
3. Follow existing patterns

**Code:**
```typescript
description: {
  titleField: "text",
  inlineFields: ["userType"],
  stackedFields: ["text"],
  omitFields: ["id", "orderIndex", "disabled"],
},
```

---

### Task 6.6.2: Add Descriptions Relationship Field to BlockProfile

**File:** `client/src/admin/configs/instanceConfig.ts`

**Steps:**
1. Add descriptions to blockProfile relationshipFields
2. Configure as multi-select relationship
3. Set up selectable field config

**Code:**
```typescript
blockProfile: {
  // ... existing config
  relationshipFields: ["activeBlocks", "activeParts", "descriptions"],
  // ...
}
```

---

### Task 6.6.3: Verify Multi-Select Works

**File:** `client/src/admin/components/generic/fields/selectFields.tsx`

**Steps:**
1. Verify existing multi-select components work with descriptions
2. Test relationship field rendering
3. Ensure description text shows in dropdown

---

### Task 6.6.4: Test CRUD Operations

**Steps:**
1. Create new Description in admin portal
2. Edit existing Description
3. Delete Description
4. Test relationship management (add/remove descriptions from BlockProfile)
5. Verify changes persist

---

## Success Criteria

- [ ] Description entity config added
- [ ] Descriptions relationship field added to BlockProfile
- [ ] Description CRUD operations work
- [ ] Relationship management works
- [ ] Multi-select displays description text
- [ ] Can create descriptions from BlockProfile form
- [ ] Can select existing descriptions
- [ ] Ready for Session 6.7 (Wizard Display)

---

## Related Documents

- Phase Guide: `project-manager/features/vue-migration/phases/phase-6-guide.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`
- Plan Details: `plan.plan.md`



