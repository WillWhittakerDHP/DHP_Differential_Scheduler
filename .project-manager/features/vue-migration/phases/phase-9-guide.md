# Phase 9 Guide

**Purpose:** Phase-level guide for planning and tracking major milestones

**Tier:** Phase (Tier 2 - High-Level)

---

## Phase Overview

**Phase Number:** 9
**Phase Name:** Three-Dimensional Relationship Model Refactoring
**Description:** Comprehensive refactoring to implement three-dimensional relationship model with proper naming conventions: Type → Shape, Profile → Instance, Type → Kind. This includes renaming entities, relationships, fields, API endpoints, database models, and updating all code references throughout the codebase.

**Duration:** 19 sessions completed (9.1-9.19)
**Status:** ✅ Complete

---

## Phase Objectives

- Rename entity types: `blockType` → `blockShape`, `partType` → `partShape`
- Rename entity profiles: `blockProfile` → `blockInstance`, `partProfile` → `partInstance`
- Rename entity type field: `entityType` → `entityKind`
- Rename relationship fields: `poolCoordinatorId` → `aggregateId`, `memberId` → `particleId`
- Update all relationship names to new conventions (Cascade/Constituent/Composition)
- Update all API endpoints to use new naming
- Update all database models and migrations
- Update all frontend components and composables
- Update all transformers and data flow
- Ensure backward compatibility where needed
- Test all changes comprehensively
- Document all changes
- Align Phase 6 work with Phase 9 changes

---

## Key Deliverables

- All entities renamed throughout codebase
- All relationships renamed throughout codebase
- All API endpoints updated
- All database models and migrations updated
- All frontend components updated
- All transformers updated
- Comprehensive test suite executed
- Documentation updated
- Phase 6 work aligned with Phase 9 changes

---

## Key Activities

- **Naming Convention Refactoring:** Systematic renaming across entire codebase
- **Database Migrations:** Create migrations for all schema changes
- **API Updates:** Update all endpoints to use new naming
- **Frontend Updates:** Update all components and composables
- **Testing & Validation:** Comprehensive testing of all changes
- **Documentation:** Update all documentation
- **Branch Alignment:** Merge Phase 6 work with Phase 9 changes

---

## Sessions Breakdown

### Session 9.1: [To be documented]
**Status:** Pending

---

### Session 9.2: Database Schema Updates - BlockType → BlockShape, PartType → PartShape
**Description:** Update database schema to rename BlockType → BlockShape and PartType → PartShape
**Status:** See session guide for current status

---

### Session 9.3: Database Schema Updates - BlockProfile → BlockInstance, PartProfile → PartInstance
**Description:** Update database schema to rename BlockProfile → BlockInstance and PartProfile → PartInstance
**Status:** See session guide for current status

---

### Session 9.4: Database Schema Updates - EntityType → EntityKind
**Description:** Update database schema to rename EntityType → EntityKind
**Status:** See session guide for current status

---

### Session 9.5: Database Schema Updates - Relationship Fields
**Description:** Update relationship fields: poolCoordinatorId → aggregateId, memberId → particleId
**Status:** See session guide for current status

---

### Session 9.6: Database Schema Updates - Relationship Names
**Description:** Update relationship names to new conventions (Cascade/Constituent/Composition)
**Status:** See session guide for current status

---

### Session 9.7: Server Models & Types Updates
**Description:** Update server-side models and TypeScript types to use new naming
**Status:** See session guide for current status

---

### Session 9.8: API Routes & Controllers Updates
**Description:** Update API routes and controllers to use new naming conventions
**Status:** See session guide for current status

---

### Session 9.9: Server Transformers Updates
**Description:** Update server-side transformers to use new naming conventions
**Status:** See session guide for current status

---

### Session 9.10: Frontend Types & Configs Updates
**Description:** Update frontend TypeScript types and configuration files
**Status:** See session guide for current status

---

### Session 9.11: Frontend Composables Updates
**Description:** Update frontend composables to use new naming conventions
**Status:** See session guide for current status

---

### Session 9.12: Frontend Components Updates - Admin
**Description:** Update admin frontend components to use new naming conventions
**Status:** See session guide for current status

---

### Session 9.13: Frontend Components Updates - Scheduler
**Description:** Update scheduler frontend components to use new naming conventions
**Status:** See session guide for current status

---

### Session 9.14: Frontend Transformers Updates
**Description:** Update frontend transformers to use new naming conventions
**Status:** See session guide for current status

---

### Session 9.15: API Integration & Backward Compatibility
**Description:** Ensure API integration works with new naming and implement backward compatibility where needed
**Status:** See session guide for current status

---

### Session 9.16: Data Migration - Seed Data & Scripts
**Description:** Update seed data and migration scripts to use new naming conventions
**Status:** See session guide for current status

---

### Session 9.17: Testing & Validation
**Description:** Comprehensive testing and validation of all Phase 9 changes
**Status:** ✅ Complete

---

### Session 9.18: Documentation & Cleanup
**Description:** Final documentation updates, code cleanup, and preparation for Session 9.19
**Status:** ✅ Complete

---

### Session 9.19: Branch Alignment & Merge - Phase 6 Work with Phase 9 Changes
**Description:** Align and merge Phase 6 branches with Phase 9 renaming and structural changes to prevent merge conflicts
**Status:** ✅ Complete

---

## Dependencies

**Prerequisites:**
- All previous phases complete or in progress
- Phase 6 work identified and documented
- Database backup strategy in place

**Downstream Impact:**
- Enables continuation of Phase 6 sessions without merge conflicts
- Completes three-dimensional relationship model refactoring
- Establishes consistent naming conventions across codebase

---

## Success Criteria

- [x] ✅ All entities renamed throughout codebase (BlockType → BlockShape, PartType → PartShape, BlockProfile → BlockInstance, PartProfile → PartInstance, EntityType → EntityKind)
- [x] ✅ All relationships renamed throughout codebase (Cascade/Constituent/Composition)
- [x] ✅ All relationship fields renamed (poolCoordinatorId → aggregateId, memberId → particleId)
- [x] ✅ All API endpoints updated to use new naming
- [x] ✅ All database models and migrations updated
- [x] ✅ All frontend components updated
- [x] ✅ All transformers updated
- [x] ✅ Comprehensive testing completed
- [x] ✅ Documentation updated
- [x] ✅ Phase 6 work aligned with Phase 9 changes
- [x] ✅ No remaining old naming patterns in code (except documented exceptions)
- [x] ✅ All tests pass
- [x] ✅ Application runs successfully

---

## Notes

**Naming Conventions:**
- Use `partInstance`, `blockInstance`, `partShape`, `blockShape` (not `partProfile`, `blockProfile`, `partType`, `blockType`)
- Use `validCascades`, `validConstituents`, `activeCascades`, `activeConstituents`, `validCompositions`, `activeCompositions` (not `validBlocks`, `validParts`, `activeBlocks`, `activeParts`, `entityAggregates`)
- Use `entityKind` (not `entityType` in code, but `entityType` is OK in route parameters for URL stability)
- Use `aggregateId` (not `poolCoordinatorId`)
- Use `particleId` (not `memberId`)

**Testing Strategy:**
- Test systematically, one layer at a time
- Document all test results
- Fix issues immediately when found
- Re-test after fixes

**Branch Alignment:**
- Create backup branches before merging
- Merge main into Phase 6 branches (not the other way around)
- Resolve conflicts systematically
- Test after each major change

---

## Related Documents

- Phase Handoff: `project-manager/features/vue-migration/phases/phase-9-handoff.md` (if exists)
- Session Guides: `project-manager/features/vue-migration/sessions/session-9.*-guide.md`
- Session Summaries: `project-manager/features/vue-migration/sessions/session-9.*-summary.md`
- Project Plan: `project-manager/PROJECT_PLAN.md`

