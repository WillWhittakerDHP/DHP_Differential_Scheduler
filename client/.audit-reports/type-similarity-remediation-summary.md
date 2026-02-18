# Type Similarity Remediation Summary

Summary of work done against the type-similarity remediation plan. The audit runs before typecheck; reducing duplicates reduces typecheck noise and drift.

## Phase 1.1 — UNIFY availability types (shared canonical)

- **Done:** Client and server now import from `shared/types/availabilityTypes.ts` for: `RollingWeekDirection`, `ConstraintEnforcement`, `RangeConstraintType`, `WorkCapacityFilter`, `RollingWeekCapacityFilter`, `LeadTimeConfig`, `DriveTimeApplyTo`, `BufferConfig`, `RangeConstraint`, `DriveTimeConfig`, `DefaultLocation`, `Coordinates` (re-exported from mapsTypes), `BusinessHoursConfig`, `DateRangeConfig`, `DayHours`.
- **Done:** Server default range constraints and constraint extractor use `category: 'range'` and RFC3339 casts where required.
- **Done:** Client `useAvailabilitySettings` builds default `rangeConstraints.businessHours` with `category: 'range'`.

## Phase 1.2 — Calendar + validation rule types in shared

- **Done:** Added `shared/types/calendarTypes.ts`: `CalendarProvider`, `CalendarEntry`, `CalendarConfig`. Client and server import and re-export.
- **Done:** Added `shared/types/businessRulesTypes.ts`: `RequiredFieldsRuleConfig`, `RequiresAgentRuleConfig`, `ConditionalValidationRuleConfig`, `ValidationMessageRuleConfig`, `RuleConfig`. Client and server import and re-export.

## Phase 1.3 — Other UNIFY groups

- **Done:** `PropertyEnrichmentResponse`: added `shared/types/propertyEnrichmentTypes.ts`; client and server import from shared.
- **Done:** `RouteLocation`: added to `shared/types/mapsTypes.ts`; client and server import from shared.
- **Done:** Field component Props: added `client/src/components/admin/generic/fields/fieldTypes.ts` with `FieldInputProps`; BooleanInput, DateInput, IconInput, NumberInput, PrimitiveInputs, SelectInputs, TextAreaInput, TextInput use it.
- **Done:** `ComponentConfig` / `ComponentStrategy`: added `shared/types/componentTypes.ts`; client and server import and re-export.
- **Done:** `AppLogger` / `LogLevel` / `Logger`: added `shared/types/loggerTypes.ts`; client and server import and re-export.

## Phase 2 — BRAND

- **Done:** `CachedCalendarEvent`: now `CalendarEvent & { readonly __brand: 'Cached' }` in `server/src/services/calendarEventsCache.ts`; imports `CalendarEvent` from shared. Cache layer casts to `CachedCalendarEvent[]` when storing; typecheck distinguishes cache vs API events.
- **Deferred:** Id-shaped types (IdentifiableById, EntityWithStringId, WithId, etc.): plan suggested a single branded type or distinct branding (e.g. UserId vs EntityId). Left for a follow-up pass to avoid scope creep.

## Phase 3 — EXTEND

- **Done:** `Coordinates`: single canonical definition in `shared/types/mapsTypes.ts`; `shared/types/availabilityTypes.ts` imports and re-exports for convenience. Removes duplicate Coordinates across shared.
- **Note:** Other EXTEND groups (e.g. ContactInfo/UserResponse, property-related subsets) can be tackled in a later pass with explicit `interface B extends A` or intersection types.

## Phase 4 — REVIEW (document / allowlist)

- **Deferred (human judgment):** DayHours / DateRangeConfig / GoogleCalendarBusyPeriod (EXACT, string start/end): decide UNIFY vs BRAND in a later pass.
- **Deferred:** ISO8601Date / RFC3339DateTime / GlobalEntityId (string aliases): align naming and branding as needed.
- **Deferred:** FieldMetadataEntry / RelationshipMetadataEntry (HIGH_OVERLAP): decide if they extend a base or stay separate; allowlist in `type-similarity-audit-config.json` if left as-is.
- **Config:** Use `client/.audit-reports/type-similarity-audit-config.json` `allowlist.specific` or `allowlist.patterns` with a short reason when consciously keeping duplicates (e.g. REVIEW groups deferred). Currently no entries added; add when suppressing specific groups.

## Verification

- After changes: run `npm run audit:type-similarity` from client to confirm group count/scores; run project typecheck and fix any new errors.
- Server `npx tsc --noEmit` and client `npm run type-check` pass aside from pre-existing errors (unused refs, EntityCard InputLike, RuleFormDialog, etc.).
