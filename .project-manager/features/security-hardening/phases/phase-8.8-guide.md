# Phase 8.8 Guide — Joi validateRequest Gap Closure

**Purpose:** Close the remaining GC-8-JOI gap: add Joi validation to three CRUD router configs with zero input validation.

**Tier:** Phase (Tier 1 - High-Level)

---

## Phase Overview

**Phase Number:** 8.8
**Phase Name:** Joi validateRequest gap closure (reopened GC-8-JOI)
**Description:** Three `createCrudRouter` configurations accept unvalidated request bodies on all mutating routes (POST/PUT/PATCH/DELETE): `userCrudRouter.ts`, and both field-mappings and feature-mappings CRUD in `propertyMappingsRouter.ts`. This phase adds Joi schemas and `validateRequest` callbacks to close the gap.

**Duration:** Single session
**Status:** In Progress

---

## Phase Objectives

- Add Joi schemas for User, PropertyFieldMapping, and PropertyFeatureMapping models
- Wire `validateRequest` callbacks into all three CRUD router configurations
- Correct GC-8-JOI status in GAP_CLOSURE_CHECKLIST.md
- Verify server lint passes and server starts

---

## Sessions Breakdown

- [ ] ### Session 8.8.1: Joi schemas and CRUD validateRequest wiring
**Description:** Create Joi schema files, wire validateRequest callbacks into userCrudRouter and propertyMappingsRouter (both CRUD instances), run server lint, update checklist.
**Tasks:** 2–3
**Focus:**
- Joi schema creation in `server/src/routes/schemas/`
- CRUD config `validateRequest` callback wiring
- Server lint verification
- GAP_CLOSURE_CHECKLIST.md update

---

## Dependencies

**Prerequisites:**
- Joi installed (`^18.0.2`) — already in `server/package.json`
- `createCrudRouter` supports `validateRequest` callback — already in `crudRouterTypes.ts`
- Existing schema pattern established in `server/src/routes/schemas/` — 14 schema files exist

**Downstream Impact:**
- Closes GC-8-JOI, enabling Feature 8 to be genuinely marked complete
- No impact on other features or routes

---

## Success Criteria

- [ ] All three CRUD router configs include `validateRequest` callbacks
- [ ] Joi schemas reject malformed bodies with 400 responses
- [ ] Server lint passes
- [ ] Server starts without errors
- [ ] GC-8-JOI checklist row accurately reflects closure
- [ ] Session 8.8.1 complete

---

## Notes

**Scope exclusions:** `relationshipCrudRouter.ts` and `businessSettingsCrudRouter.ts` are excluded — they have extensive custom (non-Joi) domain validation that rejects bad input. Converting them to Joi is optional future cleanup, not a security gap.

**Model fields for schema reference:**
- **User:** firstName (required), lastName (required), email (required), phone (nullable), userRole (required, enum)
- **PropertyFieldMapping:** dataSource (default: bright_mls), sourceField (required), targetField (required), valueMapping (nullable JSONB), fallbackValue (nullable), active (boolean), notes (nullable)
- **PropertyFeatureMapping:** dataSource (default: bright_mls), sourceField (required), matchType (required), matchValue (nullable), blockInstanceId (required UUID FK), active (boolean), priority (integer), notes (nullable)

---

## Related Documents

- Planning: `.project-manager/features/security-hardening/phases/phase-8.8-planning.md`
- Feature guide: `.project-manager/features/security-hardening/feature-security-hardening-guide.md`
- Gap checklist: `.project-manager/GAP_CLOSURE_CHECKLIST.md` (GC-8-JOI row)
- Existing schema pattern: `server/src/routes/schemas/entitySchemas.ts`
- CRUD factory types: `server/src/routes/helpers/crudRouterTypes.ts`
