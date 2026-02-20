# Type-Similarity Solution Proposal

**Purpose:** Actionable, prioritized plan for the 46 type-similarity groups from the type-similarity audit. No broad refactor in this step — this document defines the roadmap and per-group recommendations.

**Audit reference:** `client/.audit-reports/type-similarity-audit.md` and `type-similarity-audit.json`.  
**Success criteria:** Type-escape findings at 0 (achieved); similarity backlog addressed in small, PR-sized batches.

---

## 1. Prioritized Backlog Overview

| Priority | Count | Focus |
|--------|-------|--------|
| **P0** | 20 groups | High impact: primitive branding, calendar/time ranges, property/user/contact family, admin metadata, composable param shells |
| **P1** | 24 groups | Medium impact: slot/availability params, form/entity options, relationship/select types |
| **P2** | 2 groups | Low impact: defer until P0/P1 batches are done |

---

## 2. P0 Groups — Concrete Recommendations

### 2.1 BRAND Groups (5)

**Strategy:** Add TypeScript branding so structurally identical types are not interchangeable. Target a single branded alias per concept; migrate usages in small PRs.

| Group / Signature | Types | Recommendation | Risk | Effort |
|-------------------|-------|-----------------|------|--------|
| **`{ id: string }`** (score 28) | BusinessDataCollectionCrudConfig, GlobalDataCollectionCrudConfig, IdentifiableById, etc. | **BRAND:** Introduce `IdentifiableById` as the canonical `{ id: string }` in shared/utils; brand as `string & { __brand: 'IdentifiableById' }` only if you need to distinguish “id of X” vs “id of Y”. For config/return shapes, keep structural typing; no branding. **REVIEW:** Prefer keeping as structural unless duplicate IDs cause real bugs. | Low | Small (1 PR: decide canonical + optional brand) |
| **`{ end: string, start: string }`** (score 25) | GoogleCalendarBusyPeriod, DayBusinessHours, DayHours, DateRangeConfig | **BRAND:** Pick one canonical name in `shared` (e.g. `TimeRangeBounds` or keep `DayHours` in shared). Others extend or alias it. Brand only if you need to forbid mixing “calendar busy” vs “business hours” at type level; otherwise **EXTEND** from a single base in shared. | Medium | Medium (1 PR: shared base type; 1 PR: migrate client/server) |
| **`{ formData: Ref<AvailabilitySettings \| null> }`** (score 16) | UseBufferSettingsParams, UseDefaultLocationParams, UseDifferentialPerspectivesParams | **REVIEW:** Keep as structural. These are composable param shells; unifying into one type would force a single composable shape and reduce flexibility. **Optional:** Extract a shared `AvailabilitySettingsFormParams` interface and have each composable extend it if you want one place to document the common shape. | Low | Small (1 PR if extracting base) |
| **`{ config: ReadonlyVueRef<SelectionCardConfig \| undefined> }`** (score 12) | UseSelectionCardConfigParams, UseSelectionCardGroupConfigParams | **EXTEND:** Define `UseSelectionCardConfigParams` once; `UseSelectionCardGroupConfigParams` extends it or is an alias. No branding needed. | Low | Small (1 PR) |
| **`{ formatNullValue: (value: unknown) => string }`** (score 12) | PropertiesTableModel, UsersTableModel | **EXTEND:** Add a shared `TableModelFormatHelpers` interface (or base table model type) with `formatNullValue`; both table models extend it. Reduces duplication without branding. | Low | Small (1 PR) |

### 2.2 EXTEND Groups (P0 — highest value first)

| Group / Cluster | Types | Recommendation | Risk | Effort |
|-----------------|-------|-----------------|------|--------|
| **Property / user / contact payload** (score 71) | ContactInfo, UserResponse, UserRequest, PropertyFormData, PropertyDetails, PropertyResponse, PropertyRequest, ParsedProperty, etc. | **EXTEND:** Introduce base types in shared or client: e.g. `ContactInfoBase` (email, firstName, lastName), `PropertyAddressBase` (address, city, state, zipCode). Have API/request/response types extend or intersect these. Do in 2–3 PRs: (1) shared bases, (2) client types, (3) server types. | Medium | High (3 PRs) |
| **Block/booking/selection instance family** (score 53) | ComponentItem, BlockInstanceResponse, BookingBlockInstance, SelectionCardItem, AttendeeResponse, etc. | **EXTEND:** Define a minimal `BlockInstanceLike` (or use existing global entity) in shared; booking/selection types extend or reference it. Align on one source of truth for “block instance in booking context.” | Medium | Medium (2 PRs) |
| **Calendar / time ranges** (score 47) | CalendarEvent, GoogleCalendarBusyPeriod, DayHours, DateRangeConfig, BusyTimeRange, etc. | **EXTEND:** Single `{ start: string, end: string }` base in shared (e.g. `shared/types/availabilityTypes.ts` or calendar types). CalendarEvent, DayHours, DateRangeConfig extend or compose it. GoogleCalendarBusyPeriod and BusyTimeRange alias or extend the same base. | Medium | Medium (2 PRs) |
| **Time/slot shapes** (score 31) | TimeRange, MoveableSlot, SelectedTimeSlot, LoadedTimeSlot, ServerTimeSlot, ComputedSlot | **EXTEND:** One canonical slot shape in shared (e.g. `SlotTimeBounds` with dayLabel, duration, endTime, startTime, timeLabel); client and server slot types extend or map from it. | Low | Medium (1–2 PRs) |
| **Availability settings** (score 23) | AvailabilitySettings, DurationRoundingConfig, RawAvailabilitySettings, AvailabilitySettingsData | **EXTEND:** Already partially shared. Make `DurationRoundingConfig` and any small nested shapes the single source in shared; AvailabilitySettings and RawAvailabilitySettings reference them. Server `AvailabilitySettingsData` aligns with shared where possible. | Low | Small (1 PR) |
| **Fee/price data** (score 19) | PriceData, BlockInstanceFeeResult, AppointmentFeeEntry | **EXTEND:** Shared `AppointmentFeeEntry` (or fee base) in shared; client PriceData and BlockInstanceFeeResult extend or intersect. | Low | Small (1 PR) |
| **Entity card / form props** (score 18) | EntityCardSharedProps, UseEntityCardSaveStateOptions, UseEntityFormOptions, Props (EntityCardContent, etc.) | **EXTEND:** `EntityCardSharedProps` or `UseEntityFormOptions` as the documented base; other props extend or intersect. Prefer composable option types extending a shared interface. | Low | Small (1 PR) |
| **Dev panel / wizard dropdown** (score 16) | DevPanelButtons, UseAppointmentDropdownReturn, UseWizardDevModeOptions, UseAppointmentDropdownOptions | **REVIEW:** Overlap is intentional (same wizard/dev surface). Optionally extract a small shared `WizardDevOptions` and have both composables use it; no hard requirement. | Low | Small (1 PR optional) |
| **Property details logic** (score 14) | UsePropertyDetailsLogicParams, UsePropertyFormStateReturn, UsePropertyFormWatchersParams | **EXTEND:** One base interface (e.g. `PropertyFormStateCore`) with the common fields; the three composables extend or intersect it. | Low | Small (1 PR) |
| **Capacity filters** (score 14) | CapacityConstraint, IncomeCapacityFilter, WorkCapacityFilter | **EXTEND:** Already in shared. Make `WorkCapacityFilter` and `IncomeCapacityFilter` the base; `CapacityConstraint` and rolling-week types extend them. Document the hierarchy in shared. | Low | Small (1 PR doc + optional type tweaks) |

### 2.3 REVIEW Groups (6)

| Group | Types | Options & trade-offs | Recommendation |
|-------|-------|----------------------|-----------------|
| **Primitive aliases** (`= string`) | ISO8601Date, RFC3339DateTime, GlobalEntityId, RFC3339DateTime (shared) | **Option A:** Brand each (e.g. `string & { __brand: 'ISO8601Date' }`) — prevents mixing at type level; more boilerplate at boundaries. **Option B:** Keep as type aliases; rely on naming and validation. **Option C:** Brand only where confusion is real (e.g. GlobalEntityId vs raw string). | **Recommendation:** Option C. Brand `GlobalEntityId` and optionally `RFC3339DateTime`; keep `ISO8601Date` as alias unless API mixing is observed. Single PR. |
| **FieldMetadataEntry / RelationshipMetadataEntry** | FieldMetadataEntry (client + server), RelationshipMetadataEntry | **Option A:** Unify in shared with a discriminator (e.g. `kind: 'field' \| 'relationship'`). **Option B:** Keep separate; extract shared `MetadataEntryBase` with common fields. **Option C:** Leave as-is and document overlap. | **Recommendation:** Option B. Extract `MetadataEntryBase` in shared; client and server entry types extend it. Medium effort, 1–2 PRs. |
| **StepDefinition / WizardStepConfig** | StepDefinition (useWizardDisplay, useWizardNavigation), WizardStepConfig | **Option A:** Single `WizardStepConfig` in configs; composables use it. **Option B:** Keep two StepDefinitions; have them extend a shared shape. | **Recommendation:** Option A. One canonical `WizardStepConfig` (or `StepDefinition`) in `client/src/configs/wizardSteps.ts`; composables import it. Small PR. |
| **AttendeeRequest** (client vs server) | AttendeeRequest in appointmentApi.ts vs appointmentHelpers.ts | **Option A:** Move to shared types and single definition. **Option B:** Server re-exports or extends client type. | **Recommendation:** Option A. Single `AttendeeRequest` in shared (or client as source of truth); server imports. Small PR. |
| **RollingWeekIncomeCapacityFilter / RollingWeekCapacityFilter** | Both in shared/types/availabilityTypes.ts | **EXTEND:** Both already extend IncomeCapacityFilter and WorkCapacityFilter. Add a shared `RollingWeekFilterBase { direction: RollingWeekDirection }` and have both extend it. | Small PR. |
| **UseInstanceDescriptionsOptions / UseInstanceDisplayOptions** (P1) | 100% overlap | **UNIFY:** One interface (e.g. `UseInstanceDisplayOptions`); both composables use it. Trivial PR. | Small PR. |

---

## 3. P1 / P2 Batch Suggestions and Defer List

### P1 — Batch by domain

- **Availability / slots (P1):** UseAvailabilityStepDataParams vs UseAvailabilityValidationParams; MinimalSlotParams vs SlotGenerationParams. Extract shared param bases in 1 PR.
- **Forms / entities (P1):** UseFormFieldsOptions vs UseFormFieldsContextOptions; UseFormElementPatchingOptions vs FormElementPatchingOptions. Prefer one base interface per pair, 1 PR.
- **Relationships / select (P1):** RelationshipCollectionModel vs UseRelationshipCollectionDataReturn; UseSelectionCardComponentParams vs UseSelectionCardStylesParams; SelectOption vs USStateOption. Extend or unify per pair, 1–2 PRs.
- **Entity CRUD / state (P1):** UseEntityCrudMutationsReturn, UseEntityCrudActionsReturn, UseEntityCrudStateReturn. Document or extract a shared “entity CRUD return” shape; 1 PR.
- **Other P1:** DefaultLocation vs RouteLocation; DriveTimeConfig vs OverlapConstraint; CascadeFilterParams vs PipelineParams; etc. Address when touching those areas; no dedicated batch required.

### P2 — Defer

- Handle after P0 and high-value P1 batches. Re-run audit to refresh counts and priorities.

---

## 4. Risk and Migration Effort (Summary)

| Action | Risk | Typical effort |
|--------|------|----------------|
| **BRAND (primitive or small object)** | Low–medium; boundaries need explicit cast or mapper | Small (1 PR per brand) |
| **EXTEND (base type + extenders)** | Low; additive, backward compatible | Small–medium (1–2 PRs per cluster) |
| **REVIEW → UNIFY** | Medium; call sites must be updated | Small–medium (1 PR per unification) |
| **REVIEW → leave as-is** | None | Documentation only |

---

## 5. Suggested PR Sequencing

1. **PR 1 – Type-escape cleanup** (done): All type-escape findings removed.
2. **PR 2 – Primitive branding (REVIEW):** GlobalEntityId (and optionally RFC3339DateTime); document ISO8601Date.
3. **PR 3 – Shared base for calendar/time:** Single `{ start, end }` (or DayHours) in shared; 1–2 types migrated.
4. **PR 4 – StepDefinition / WizardStepConfig (REVIEW):** Single canonical step config; composables import it.
5. **PR 5 – AttendeeRequest (REVIEW):** Single definition in shared or client; server imports.
6. **PR 6 – RollingWeek filter base (REVIEW):** Shared RollingWeekFilterBase in shared.
7. **PR 7 – Table model format (BRAND/EXTEND):** Shared TableModelFormatHelpers; Properties/Users table models extend.
8. **PR 8 – Selection card config (BRAND):** UseSelectionCardConfigParams base; group config extends.
9. **PR 9 – Metadata entry base (REVIEW):** MetadataEntryBase in shared; FieldMetadataEntry and RelationshipMetadataEntry extend.
10. **PR 10+ – Property/user/contact and block/booking families:** Phased EXTEND work (bases in shared, then client, then server).

---

## 6. Final Validation (Post–type-escape)

- `cd client && npm run audit:type-escape` → **0 findings** (achieved).
- `cd client && npm run audit:type-similarity:summary` → use to track backlog after each batch.
- `cd client && npm run audit:pre-typecheck:meta` → keep similarity and typecheck state visible for roadmap.

This proposal is the implementation roadmap; execute in small PRs and re-run audits after each batch to keep the backlog and risk transparent.

---

## 7. Addressed (Aggressive Type-Similarity Fix)

Groups addressed by the aggressive fix plan (shared bases, branding, single source of truth):

- **Primitive aliases (0.1):** Branded `ISO8601Date`, `GlobalEntityId`; re-export `RFC3339DateTime` from shared. Client re-exports and `toISO8601Date` / `toGlobalEntityId` at boundaries.
- **Time range base (0.2):** `TimeRangeBounds` in shared; branded `DayHours`, `DateRangeConfig`; client `GoogleCalendarBusyPeriod`, `DayBusinessHours` extend/alias.
- **IdentifiableById (0.3):** Shared `identifiable.ts`; collection types use it; `findById`/`resolveByIds` accept `{ id: string }` for compatibility.
- **Rolling week filter base (0.4):** `RollingWeekFilterBase` in shared; rolling-week capacity filters extend it.
- **Availability settings form params (1.1):** Branded `UseBufferSettingsParams`, `UseDefaultLocationParams`, `UseDifferentialPerspectivesParams` from shared base.
- **Selection card config (1.2):** `UseSelectionCardGroupConfigParams` = `UseSelectionCardConfigParams` (single type).
- **Table model format (1.3):** `TableModelFormatHelpers` with `formatNullValue`; Properties/Users table models extend it.
- **Property / user / contact payload (1.4):** Shared `ContactInfoBase`, `PropertyAddressBase`, `PropertyDetailsBase`; client/server types extend (ContactInfo, UserResponse, PropertyRequest/Response, PropertyDetailsData, ParsedClient, ParsedProperty, PropertyEnrichmentResponse).
- **Block instance family (1.5):** Shared `BlockInstanceLike`; `BookingBlockInstance` extends it (with index signature for SelectionCardItem compatibility).
- **Calendar / time ranges (1.6):** All use shared `TimeRangeBounds` or branded derivatives (Phase 0.2).
- **Time/slot shapes (1.7):** Shared `SlotTimeBounds`; `ComputedSlot`, `TimeRange`, `MoveableSlot` extend or alias.
- **Fee/price data (1.9):** Shared `FeeEntryBase`; `AppointmentFeeEntry`, `BlockInstanceFeeResult` extend or alias.
- **StepDefinition / WizardStepConfig (1.12):** Single `WizardStepConfig` in configs; composables import it.
- **AttendeeRequest (1.13):** Single definition in shared; client and server re-export.
- **UseInstanceDescriptionsOptions / UseInstanceDisplayOptions (1.17):** One type; `UseInstanceDescriptionsOptions` = `UseInstanceDisplayOptions`.

- **Availability settings (1.8):** Client and server use shared `DurationRoundingConfig`; re-exported from client config; server `AvailabilitySettingsData.durationRounding` typed from shared.
- **Entity card / form props (1.10):** `EntityCardSharedProps` is the base; `UseEntityCardSaveStateOptions`, `UseEntityFormOptions` extend it; EntityCardContent and EntityCardSubPanels Props extend it.
- **Metadata entry base (1.11):** Shared `MetadataEntryBase` in `shared/types/metadataEntryTypes.ts`; client `FieldMetadataEntry` and server `FieldMetadataEntry`/`RelationshipMetadataEntry` extend it (panel narrowed per layer).
- **Dev panel / wizard dropdown (1.14):** `WizardDevOptionsBase` in `client/src/types/wizardDevOptions.ts` with `fetchAll`; `UseAppointmentDropdownOptions` and `UseWizardDevModeOptions` extend it.
- **Property details logic (1.15):** `PropertyFormStateCore` (formData, isAddressExpanded) in usePropertyDetailsLogic; `UsePropertyDetailsLogicParams`, `UsePropertyFormStateReturn`, `UsePropertyFormWatchersParams` extend it.
- **Capacity filters (1.16):** JSDoc hierarchy added in shared availabilityTypes (WorkCapacityFilter, IncomeCapacityFilter, RollingWeek* extend bases; CapacityConstraint unified shape).

**Phase 2 (P1) — bases and extend:**

- **Availability step params (P2):** `AvailabilityStepParamsBase` in `client/src/types/availabilityStepParams.ts`; `UseAvailabilityStepDataParams` extends (adds moveableScheduling); `UseAvailabilityValidationParams` = base.
- **Slot generation (P2):** `SlotGenerationParamsBase` in slotGenerationValidation; `SlotGenerationParams` = base; `MinimalSlotParams` extends and adds includeFlags.
- **Business rule (P2):** `BusinessRuleCore` in useBusinessRules; `BusinessRule` extends (adds id, createdAt, updatedAt); `BusinessRuleFormData` = BusinessRuleCore.
- **Select option (P2):** `SelectOptionBase` in useSelectOptions; `SelectOption` extends (adds children); `USStateOption` = SelectOptionBase (in usStates).
- **Form element patching (P2):** `FormElementPatchingOptionsBase` in formElementPatching; `FormElementPatchingOptions` extends (adds observerTimeoutMs, required formSelector/useMutationObserver); `UseFormElementPatchingOptions` = base.
- **Form fields options (P2):** `UseFormFieldsOptionsBase` in composables/formFields/types; `UseFormFieldsOptions` extends (adds inlineFieldsConfig, stackedFieldsConfig); `UseFormFieldsContextOptions` = base.
- **Form fields return (P2):** `UseFormFieldsStandardLayoutReturn` in types (inlineFields, stackedFields, readyInlineFields, readyStackedFields); `UseFormFieldsReturn` extends it.
- **Relationship collection (P2):** `UseRelationshipCollectionDataReturnBase` in useRelationshipCollectionData; `RelationshipCollectionModel` extends it.
- **Instance component / create payload (P2):** `CreateRelationshipPayloadBase` in relationships.ts; `CreateRelationshipPayload` = base; `InstanceComponent` extends (adds id, orderIndex, disabled, createdAt, updatedAt).
- **Entity CRUD return (P2):** `UseEntityCrudStateReturnBase` and `UseEntityCrudMutationsReturnBase` in useEntityCrudTypes; `UseEntityCrudActionsReturn` = state base & mutations base; state and mutations composables return the bases.
- **DefaultLocation / RouteLocation (P2):** `LocationBase` in shared mapsTypes; `RouteLocation` = LocationBase; `DefaultLocation` in availabilityTypes extends LocationBase (placeId required, label optional). availabilityTypes re-exports LocationBase from mapsTypes.
- **BetaFeedback filters (P2):** `BetaFeedbackFiltersBase` in betaFeedback.ts; `BetaFeedbackFilters` = base.
- **DriveTime / Overlap (P2):** `OverlapMinutesBase` in shared availabilityTypes; `DriveTimeConfig` extends (applyTo required); `OverlapConstraint` extends (adds category, type, placement).
- **Cascade / pipeline (P2):** `CascadeFilterParamsBase` in cascadeFilterPipeline; `CascadeFilterParams` = base; `PipelineParams` extends (adds shapeType, allowFallbackToAllOfShape, logShapeMismatch).
- **Selection card params (P2):** `UseSelectionCardStylesParamsBase` in useSelectionCardStyles; `UseSelectionCardComponentParams` extends (adds item, controlClasses); `UseSelectionCardStylesParams` = base.
- **Component distribution (P2):** `UseComponentDistributionReturn.preview` typed as `Ref<DistributionPreview[]>` (shared shape from types/component).

**Phase 3 (P2) — bases and extend:**

- **Suggestion / SearchResults (P3):** In NavSearchBar.vue, `SuggestionItemBase` = { icon, title, url }; `Suggestion` = SuggestionItemBase; `SearchResults` = { title, children: SuggestionItemBase[] }.
- **Props / Props — metadata editor (P3):** `MetadataEditorPropsBase` in `client/src/types/metadataEditorProps.ts` (entityKey, entity, blockShapeRef?); AdminPrimitiveMetadataEditor `Props` = base; MetadataEditModal `Props` extends base (adds modelValue, entityName?). Unused GlobalEntity/GlobalEntityKey imports removed from both components.

Remaining: None (aggressive type-similarity plan complete).
