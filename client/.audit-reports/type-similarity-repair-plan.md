# Type-Similarity Repair Plan

Plan for reducing type-similarity audit findings by repairing duplicate or near-duplicate types. The audit runs before typecheck; reducing groups reduces typecheck noise and drift.

**Reference:** `client/.audit-reports/type-similarity-audit.md`, `type-similarity-audit.json`, and `type-similarity-remediation-summary.md` (work already done).

---

## Current state (from latest audit run)

- **Similarity groups:** 69 (summary may show 97 depending on run)
- **UNIFY candidates:** 12 — structurally identical; consolidate to single source
- **BRAND candidates:** 13 — same shape, different meaning; add branding
- **EXTEND candidates:** 37 — subset/superset; use `extends` or intersection
- **REVIEW candidates:** 7 — high overlap; human judgment or allowlist

**Scope:** client/src, server/src, shared/ (excludes __tests__, @core, @layouts).  
**Config:** `client/.audit-reports/type-similarity-audit-config.json` for allowlist (patterns/specific) and priorities.

---

## Strategy overview

1. **UNIFY** — Pick one canonical definition (prefer `shared/` for cross-cutting types, or the most authoritative module). Replace other definitions with imports; re-export where needed.
2. **BRAND** — Add a nominal brand so two types with the same shape are not interchangeable (e.g. `type CachedCalendarEvent = CalendarEvent & { readonly __brand: 'Cached' }`).
3. **EXTEND** — Introduce a base type and have the larger type `extends` it (or use intersection); keep a single place for the shared shape.
4. **REVIEW** — Decide UNIFY vs BRAND vs leave-as-is; document and optionally allowlist in config with a short reason.

---

## Phase 1: UNIFY (high-impact, low-risk)

Same concept duplicated; import from one source.

| Group ID / Description | Types | Canonical location | Action |
|------------------------|--------|---------------------|--------|
| **FieldMetadataEntry** (server) | `FieldMetadataEntry` in adminMetadataComposer, adminPrimitiveMetadataComposer | Pick one server module (e.g. `server/src/utils/adminMetadataComposer.ts`) or add `server/src/types/adminMetadata.ts` | Keep one definition; other file imports and re-exports or imports from shared if client also needs it. |
| **EntityMetadataType** | `EntityMetadataType` in fieldMetadata.ts, entityTypeMapping.ts | `client/src/constants/entities.ts` or a shared entity-types module | Single export; both client files import from it. |
| **ContactsStepData** | In useAppointmentDataCollection.ts, wizard.ts | `client/src/types/wizard.ts` or a shared wizard/contacts type file | One definition; the other imports. |
| **VirtualFieldType** | In _archived/selectableFieldConfig.ts, entity/formFields.ts | `client/src/types/entity/formFields.ts` (active code) | Canon in formFields.ts; archived config imports or is excluded from audit. |
| **UseWizardValidationReturn** | useWizardValidation.ts, wizardValidation.ts | `client/src/composables/booking/useWizardValidation.ts` | One definition; wizardValidation.ts imports. |
| **UpdateByIdPayload** | businessDataCollections/types.ts, globalDataCollections/types.ts | Shared type in `client/src/composables/` (e.g. a shared `collectionTypes.ts`) or keep in one collection and import in the other | Single type for `{ data, id }` used by both collections. |
| **RelationshipFieldType** | _archived/selectableFieldConfig.ts, types/entity/formFields.ts | `client/src/types/entity/formFields.ts` | Canon in formFields.ts; archived imports or allowlist. |
| **SelectDomTarget** | useSelectDomTargets.ts, selectDomAssociation.ts | One of the two (e.g. `client/src/utils/forms/selectDomAssociation.ts`) | Single definition; composable imports. |
| **LoadingIndicatorInstance** | useLayoutLoading.ts, blank.vue | `client/src/composables/useLayoutLoading.ts` | Export from composable; layout uses type from there. |
| **Props** (visible: boolean) | ApiDevPanel.vue, DevPanelsContainer.vue | Local to each component or shared dev types file | Either extract to shared `DevPanelProps` or allowlist as component-local. |
| **Props** (entityId, entityKey) | EntityCardFeePreview.vue, EntityCardPartsTotals.vue | Shared admin card prop type if used elsewhere | `EntityCardSharedProps` or keep and allowlist. |
| **ServiceSummary** | DevPanelsContainer.vue, useDevPanelsComputed.ts | `client/src/composables/booking/useDevPanelsComputed.ts` | Define once in composable; component imports. |

**Verification:** After each UNIFY, run `npm run audit:type-similarity` and `npm run type-check` from client; fix any new errors.

---

## Phase 2: BRAND (same shape, different concept)

Add branding so typecheck can enforce distinct use.

| Group | Types | Suggested approach |
|-------|--------|---------------------|
| **Id-shaped** (score 34) | BusinessDataCollectionCrudConfig, GlobalDataCollectionCrudConfig, IdentifiableById, EntityWithStringId, WithId, etc. | Introduce a single branded type (e.g. `IdentifiableById` in shared or client utils) and use it where “id only” is the contract; or brand per domain (UserId, EntityId) in a follow-up. |
| **start/end string** (score 25) | GoogleCalendarBusyPeriod, DayBusinessHours, DayHours, DateRangeConfig | Already in shared (DayHours, DateRangeConfig). Option: brand calendar-specific ones (e.g. `CalendarTimeRange`) vs availability ones; or document and allowlist. |
| **formData: Ref<AvailabilitySettings \| null>** (score 16) | UseBufferSettingsParams, UseDefaultLocationParams, UseDifferentialPerspectivesParams | Optional: base interface in shared composable types and extend with branded params; or allowlist as intentional same-shape options. |
| **SelectedTimeSlot / TimeSlot** (score 15) | client availabilityStepData, server appointmentCalendarService | Brand server type (e.g. `ServerTimeSlot`) or move to shared and brand by layer (BookingTimeSlot vs ApiTimeSlot). |
| **Redirect/form options** (score 12) | UseBlockInstanceFormOptions, UsePartInstanceFormOptions | Base interface `UseEntityFormRedirectOptions` in admin composables and extend. |
| **Endpoints/query/table/ById** (score 12 each) | BusinessData* vs GlobalData* endpoints, query result, byId result | Generic in shared collection types: e.g. `CollectionEndpoints<T>`, `CollectionQueryResult<T>`; business and global use the same generic with different type args (BRAND by generic param). |
| **UseInstanceBulkEditOptions / UseInstanceFilteringOptions** (score 12) | Same shape | Base interface + optional branding or allowlist. |
| **AppointmentData / DevPanelsComputedData** (score 10) | Dev panel vs composable | One type in composable; component uses it (UNIFY) or brand as DevPanelsComputedData. |
| **Props / UseSelectConfigOptions** (score 10) | PartsCollection Props vs useSelectConfig | Component props type as `UseSelectConfigOptions` or extend it (EXTEND). |

**Verification:** After BRAND changes, run audit and typecheck; ensure no unintended assignability between branded types.

---

## Phase 3: EXTEND (subset/superset)

Introduce base types and use `extends` or intersection.

| Priority group | Types (subset) | Suggested approach |
|----------------|----------------|---------------------|
| **Contact/User/Property cluster** (score 71) | ContactInfo, UserResponse, PropertyDetails, PropertyFormData, WizardStateData, ParsedClient, AppointmentWithDetails, PropertyResponse, PropertyRequest, ParsedProperty, PropertyEnrichmentResponse, etc. | Define a small base (e.g. `ContactLike`, `PropertyLike`) in shared or client types; have domain types extend or intersect. Do incrementally to avoid big-bang refactors. |
| **Component/Block/Booking cluster** (score 57) | ComponentItem, BookingBlockInstance, SelectionCardItem, AttendeeResponse, BlockInstanceFormData, etc. | Base type in `client/src/utils/transformers/` or types (e.g. `SelectionCardItemBase`); BookingBlockInstance and others extend or intersect. |
| **Calendar/Day/Time range cluster** (score 47) | CalendarEvent, DayHours, DateRangeConfig, BusyTimeRange, CreatedEventResponse, ComputedAvailabilityRequest | Shared already has some; align client/server on shared types and have API-specific types extend shared (e.g. CreatedEventResponse extends shared CalendarEvent shape). |
| **TimeSlot/slot cluster** (score 29) | TimeRange, MoveableSlot, SelectedTimeSlot, LoadedTimeSlot, TimeSlot, ComputedSlot | Base in shared (e.g. `TimeRangeBase` with start/end/duration); domain slots extend or intersect. |
| **AvailabilitySettings cluster** (score 23) | AvailabilitySettings, RawAvailabilitySettings, DurationRoundingConfig, AvailabilitySettingsData | Already partially in shared; ensure server AvailabilitySettingsData and client AvailabilitySettings align via shared base or explicit mapping. |
| **EntityCard/Form options** (score 18) | Props (EntityCard*), UseEntityCardSaveStateOptions, UseEntityFormOptions | Base interface for “entity form context” in admin composables; components and composables extend it. |
| **DevPanel/Appointment dropdown** (score 16) | DevPanelButtons, UseAppointmentDropdownReturn, UseWizardDevModeOptions, UseAppointmentDropdownOptions | Single composable return type and optional “options” subtype; components use the return type. |
| **RouteMatrixResult** (score 15) | client mapsApiService, server mapsTypes | Move to shared (e.g. `shared/types/mapsTypes.ts`); client and server import. |
| **Property details logic** (score 14) | UsePropertyDetailsLogicParams, UsePropertyFormStateReturn, UsePropertyFormWatchersParams | Base interface in booking composables; each composable extends with its own fields. |
| **TimeBasisHandlerProps** (score 12) | Props (DifferentialGraph, TimeBasisButtonGrid, TimeBasisSelector), TimeBasisHandlerProps | Components use `TimeBasisHandlerProps` from composable (UNIFY) or extend it. |
| **LoadingIndicatorInstance / UseLoadingIndicatorReturn** (score 12) | useLayoutLoading, useLoadingIndicator, blank.vue | Return type of useLoadingIndicator is source of truth; layout and useLayoutLoading use it. |
| **SelectGroup / GroupedEntities** (score 10) | useSelectDomTargets, useSelectOptions | `SelectGroup` extends `{ groupKey, groupLabel }` and add `entities` in useSelectOptions type (GroupedEntities = SelectGroup & { entities }). |
| **Other P1 EXTEND** | UseAvailabilityStepDataParams/UseAvailabilityValidationParams, CapacityConstraint/WorkCapacityFilter, etc. | Apply same pattern: base type in shared or feature module, domain types extend; one group at a time. |

**Verification:** After each EXTEND, run audit and typecheck; ensure no broken references or missing properties.

---

## Phase 4: REVIEW (document or allowlist)

High-overlap or ambiguous; decide then UNIFY/BRAND or allowlist.

| Group | Types | Options |
|-------|--------|--------|
| **Primitive string aliases** (score 25) | ISO8601Date, RFC3339DateTime, GlobalEntityId | Keep distinct names; optionally unify under shared datetime + entity ID types and re-export. If left as-is, add allowlist entry with reason “Intentional distinct semantic aliases for string.” |
| **FieldMetadataEntry / RelationshipMetadataEntry** (score 22) | 4 definitions across client + server | Either: base `MetadataEntryBase` and Field/Relationship extend, or keep separate and add allowlist: “Field vs relationship metadata; different domains.” |
| **StepDefinition / WizardStepConfig** (score 16) | useWizardDisplay, useWizardNavigation, wizardSteps config | UNIFY: single StepDefinition in wizard types; composables and config import. Or allowlist if “step display” vs “step config” are intentionally different. |
| **AttendeeRequest** (score 14) | client appointmentApi, server appointmentHelpers | UNIFY in shared (e.g. `shared/types/appointmentAttendee.ts`) and have both client and server import; or allowlist if API contract must stay separate. |
| **Props / TimeBasisHandlerProps** (score 12) | TimeBasisButtonGrid, TimeBasisSelector, TimeBasisHandlerProps | UNIFY: component Props = TimeBasisHandlerProps (Phase 3 EXTEND covers this). |
| **UseInstanceDescriptionsOptions / UseInstanceDisplayOptions** (score 9) | 100% overlap | UNIFY to one name and have both composables use it; or allowlist “Intentional duplicate options for two composables.” |
| **AnnotationConfig / EventConfig** (score 8) | server express.d.ts | Leave as-is (declaration file) or allowlist; low impact. |

**Allowlist format (in type-similarity-audit-config.json):**

- `allowlist.specific`: array of `{ "file": "client/src/...", "reason": "..." }` or group-id if the script supports it.
- `allowlist.patterns`: array of `{ "pattern": "**/express.d.ts", "reason": "Declaration file; leave as-is" }`.

---

## Implementation order (recommended)

1. **Quick UNIFY (same codebase, no shared boundary)**  
   EntityMetadataType, ContactsStepData, UseWizardValidationReturn, LoadingIndicatorInstance, ServiceSummary, SelectDomTarget, UpdateByIdPayload (shared collection type). Re-run audit after each.

2. **Server/client UNIFY with shared**  
   FieldMetadataEntry (if moving to shared or one server source), AttendeeRequest (shared), RouteMatrixResult (shared). Then re-run audit and typecheck.

3. **BRAND where semantics differ**  
   Id-shaped types, TimeSlot vs SelectedTimeSlot, composable params that share shape. Prefer one branded base (e.g. IdentifiableById) before adding many domain-specific brands.

4. **EXTEND in feature clusters**  
   Start with smaller EXTEND groups (RouteMatrixResult, SelectGroup/GroupedEntities, TimeBasisHandlerProps); then AvailabilitySettings; then Contact/User/Property and Component/Block/Booking clusters.

5. **REVIEW and allowlist**  
   Decide each REVIEW group; document in this file and add config allowlist entries for “keep as-is” with short reason.

---

## Verification and config

- **After changes:** From client run `npm run audit:type-similarity` and `npm run type-check`; fix new errors.
- **Allowlist:** Use `client/.audit-reports/type-similarity-audit-config.json` (`allowlist.patterns`, `allowlist.specific`) with a short reason when consciously keeping duplicates.
- **Remediation summary:** Update `type-similarity-remediation-summary.md` with completed phases and any deferred items.

---

## Out of scope

- No changes to the type-similarity audit script logic or scoring unless explicitly requested.
- Test and spec files remain excluded from the audit scope.
