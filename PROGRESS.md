# Bonsai Progress Log

Append-only milestone notes. Governing spec: `BONSAI_SPEC.md`.

---

## 2026-07-12 — Phase 0 complete (pending Will sign-off)

### 5.1 Bring it back to life

| Check | Result |
|---|---|
| `npm install` (root) | ✅ OK |
| Postgres `scheduler_db` | ✅ Exists locally |
| `npm run migrate` | ✅ All migrations already executed |
| `npm run start:dev` | ✅ Client `http://localhost:3002`, server `http://localhost:3001`, DB connected |
| Client `npm run type-check` | ✅ Pass |
| Server `tsc --noEmit` | ✅ Pass |
| Client `npm run lint` | ✅ Pass |
| Server `npm run lint` | ✅ Pass |
| Client tests (`vitest run`) | ⚠️ **0 test files found** (suite exits 0) |
| Server tests (`jest`) | ⚠️ **0 test files found** (suite exits 0) |

**Note:** `TEST_ENABLED=false` in root `.env`. The spec's "~117 client / ~15 server test files" count does not match the current tree — no `*.test.ts` / `*.spec.ts` files under `client/` or `server/`. Either tests were never committed on this branch or were removed during Feature 20. Re-enable coverage in a later phase; do not treat empty suites as green quality gates.

### 5.2 Uncommitted work triage

**Characterization:** Near-complete Feature 20.8.1.2 work — predominantly renames (`timePerUnit`/`feePerUnit` ledger alignment), booking-pipeline contract alignment, admin tab restructure, and deletion of transitional stacks (calibration chart, fee preview, user-role-block-alignment).

| Category | Files (approx) | Notes |
|---|---|---|
| Renames / ledger | ~80 | `defaultTime`/`timePerUnit`, `defaultFee`/`feePerUnit` end-to-end |
| Deletions | 14 | Calibration chart, fee preview, role-alignment API/repo/schemas |
| New admin tabs | 5 | `InstancesDomainTab`, `OrchestrationTab`, `ServicesTab`, etc. |
| New migrations | 10 | Through `20260432_000070_block_instances_requires_agent` |
| Harness docs (uncommitted) | ~8 | Not committed — deleted with harness in 5.3 |

**Resolution:** Committed as `bca647dc` — *Complete Feature 20.8.1.2: part-ledger renames and domain alignment.*

### 5.3 Harness demolition

| Action | Status |
|---|---|
| Rescue docs → `docs/` | ✅ `ARCHITECTURE_PRINCIPLES.md`, `ARCHITECTURE.md`, `DOMAIN_ARCHITECTURE_REDESIGN.md`, `DOMAIN_REWRITE_WORKLOG.md`, `FEATURE_20_ARCHITECTURE_REDESIGN.md` |
| Delete `.cursor/` submodule | ✅ |
| Delete `.project-manager/` | ✅ |
| Delete phantom artifacts (`express-api-typescript@0.0.2`, `main@1.0.0`, `node`, `npm`) | ✅ |
| Delete harness config (`tsconfig.cursor-commands.json`, `vitest.config.workspace.cursor.ts`, `TOOLS.md`) | ✅ |
| Keep `eslint-local-plugin/` | ✅ Active in client + server ESLint configs |
| Keep Vuexy `@core` / `@layouts` | ✅ Not touched |

Committed as separate revertible commit: *Remove agent-workflow harness (Phase 0).*

**Will action:** Remove globally registered Cursor slash commands in Cursor app settings (outside repo). Sibling folder `cursor-project-management-suite/` can be deleted whenever.

### 5.4 Behaviour audit

#### Booking wizard

| Surface | Status | Evidence |
|---|---|---|
| Step 1 — Service Selection | ✅ Loads | User types (Buyer/Agent/Owner/Developer) render; selecting Buyer reveals services (Buyer's Inspection, Walk & Talk) |
| Step 2 — Property Details | ⚠️ Not fully exercised | Automation could not reliably advance past step 1 (selection state / validation). Manual walkthrough recommended. |
| Step 3 — Availability | ⚠️ Partial | Server logs show real Google Calendar slot computation (`ComputedAvailabilityService`, 22 events fetched). Minimizer composable stack exists (`useMinimizerPartsScheduling`, `AvailabilitySubStepContent`). Full minimizer UI flow not verified end-to-end in this audit. |
| Step 4 — Contacts | ⚠️ Not exercised | — |
| Step 5 — Confirmation | ⚠️ Not exercised | — |
| Quote-only path | ⚠️ Not exercised | "I want a quote" button present on step 1 |
| Load Random Appointment | ❌ Blocked | Fails with **401** on `GET /appointments/:id/versions` — endpoint requires auth session |
| Differential vs standard | ⚠️ Not exercised | Catalog has differential-capable services; path not walked |

#### Minimizer / "Minimize Time On Site" (flagship scenario)

| Item | Status |
|---|---|
| Client types + composables | ✅ Present (`minimizerScheduling.ts`, `useMinimizerPartsScheduling`, `minimizerEventShapes` utils) |
| Segment detection from appointment shape | ✅ Code path exists |
| Contingency deadline + slot grid modal | ⚠️ UI exists; not manually verified |
| Admin-configurable event profile segments | ⚠️ Event shapes have `placement_kind` + `anchor_edge`; full admin → booking round-trip not verified |
| Early-arrival / off-site segment layout per §6.1 | ❌ **Not proven** — Phase 1 blocking acceptance |

#### Admin

| Surface | Status |
|---|---|
| Route `/admin` | ✅ Redirects to `/login?redirect=/admin` (auth gate works) |
| Service catalog CRUD | ⚠️ Not exercised (needs authenticated session) |
| Appointments table | ⚠️ Not exercised |
| Calendar configuration | ⚠️ Not exercised |

#### Auth (magic link)

| Step | Status | Evidence |
|---|---|---|
| Login page | ✅ Renders at `/login` |
| CSRF token | ✅ `GET /auth/csrf-token` → 200 |
| Unauthenticated session | ✅ `GET /auth/session/me` → 401 |
| Magic link request | ✅ `POST /auth/magic-link/request` → 200; Gmail delivery logged (`magic_link.delivery.gmail_ok`) |
| Magic link verify → session cookie | ⚠️ Not exercised (would need email link click) |
| Protected route after auth | ⚠️ Not exercised |

#### Integrations

| Integration | Status | Evidence |
|---|---|---|
| Google Calendar | ✅ Live | OAuth tokens loaded; events fetched from `will.b.whittaker@gmail.com`; slot availability POST → 200 |
| Google Maps / Geocoding | ✅ Cache hits | `PlacesApiService` geocoding cache hit in server logs |
| Bright MLS | ⚠️ Expected mock | Credentials pending beta (per spec) |

### 5.5 Schema / model audit (Phase 1 input)

Truth source: live Postgres schema + `server/src/db/models/` + grep for read/write paths. Principles reference: `docs/ARCHITECTURE_PRINCIPLES.md`.

#### `block_instances` — proposed kill/keep/move

| Column | Read paths (sample) | Write paths | Principles | Phase 1 disposition |
|---|---|---|---|---|
| `id`, `name`, `order_index`, `block_shape_ref` | Everywhere | CRUD routers, admin forms | ✅ Core instance identity | **KEEP** |
| `composite` | `globalToBookingTransformerBlocks`, booking pipeline | Admin entity editor | ✅ §2 instance property | **KEEP — verify behaviour** |
| `orchestrator` | Cascade graphs, drag-order, booking filters | Admin entity editor | ✅ §2 instance property | **KEEP — verify behaviour** |
| `wizard_visible` | `globalToBookingTransformerBlocks`, wizard filtering | Admin entity editor | ✅ §2 instance property | **KEEP — verify behaviour** |
| `semantic_type` | User-role block instances | Admin + reconcile repo | ✅ User-semantic instances | **KEEP** |
| `base_sq_ft` | legacy threshold on all instances | Admin bulk edit, versioning | ⚠️ Time-domain concern on all instances | **DROP** — booking uses `property_details.squareFootage` (Will, 2026-07-12) |
| `requires_unit_number` | `PropertyDetailsStep`, validation | Admin bulk edit | ⚠️ Property-type concern | **KEEP** — TIME shape cards only (`blockInstanceFieldVisibility.ts`) |
| `is_multi_family` | `PropertyDetailsStep`, `usePropertyValidation` | Admin bulk edit | ⚠️ Property-type concern | **KEEP** — TIME shape cards only |
| `requires_agent` | Contacts / attendee flows | Admin | Instance-level authoritative (071 dropped shape duplicate) | **KEEP** — SERVICE shape cards only |
| `pre_closing` | `useAvailabilityOrchestratorMinimizerGates`, versioning | Admin forms | ⚠️ Booking-context flag on all instances | **KEEP** — SERVICE shape cards only |
| `agent_permissions` | unused in live data | Admin forms | ⚠️ Agent-domain ternary on all instances | **DROP** (Will, 2026-07-12) |
| `icon` | Wizard display, admin | Admin forms | Presentation | **KEEP** (low priority) |

#### `block_shapes`

| Column | Disposition |
|---|---|
| `semantic_type` | **KEEP** — defines the five domain types |
| `requires_agent` | **VERIFY** — duplicates instance column; pick canonical owner |

#### `part_instances` (value ledger)

| Column | Disposition |
|---|---|
| `base_fee`, `fee_per_unit`, `base_time`, `time_per_unit` | **KEEP** — canonical ledger (renamed in 20.8.1.2) |
| `zero_out_part` | **KEEP** — §4.4 zero-out ordering |
| `active` | **KEEP** |
| `part_shape_ref`, `name`, `order_index` | **KEEP** |

#### `event_shapes` / `event_assignments`

| Column | Disposition |
|---|---|
| `placement_kind`, `anchor_edge` | **KEEP** — data-driven event routing per §5.1–5.3 |
| `event_assignments.parent_kind/child_id` | **KEEP** — segment graph |

#### `appointments` (selected columns)

| Column | Disposition |
|---|---|
| `service_snapshots`, `property_snapshots`, `option_snapshots` | **KEEP** — snapshot model; rename `option_snapshots` vocabulary in Phase 1 |
| `is_quote_mode` | **KEEP** |
| `override_constraint_*` | **KEEP** — admin override flags |

#### Open schema questions for Will

1. ~~`block_instances.requires_agent` vs `block_shapes.requires_agent`~~ — **Resolved:** `block_instances` is authoritative (Will, 2026-07-12). Drop or ignore shape-level duplicate in Phase 1.
2. `part_instances.blockInstanceId` — spec notes missing FK; **not present in current schema** (assignment is via `part_assignments` join table). Confirm intentional.
3. ~~Test suite absence~~ — **Resolved:** Tests deliberately deleted; were burdensome/unreliable under micromanagement. Rebuild selectively in later phases — not a Phase 0 blocker.

#### Will sign-off (2026-07-12)

- **requires_agent:** instance-level (`block_instances`) wins.
- **Tests:** intentionally removed; no hunt for missing files.
- **Auth:** magic link disabled for local dev (`AUTH_STRATEGY=none`); admin opens without login.
- **Harness slash commands:** repo `.cursor/` deleted; global commands live in `~/.cursor/commands/` — manage via Cursor **Customize** sidebar (see note below).

---

### Phase 0 exit checklist

- [x] App runs locally
- [x] Typecheck/lint baseline recorded
- [x] Uncommitted work resolved (committed)
- [x] Harness deleted, keepers in `docs/`
- [x] Behaviour + schema audit written
- [x] **Will sign-off** on Phase 1 kill/keep/move list

### Suggested Phase 1 entry

1. Verify `composite` / `orchestrator` / `wizardVisible` drive real behaviour (not just column presence).
2. Execute kill/keep/move table above for grab-bag columns.
3. Restore or rebuild test suites before treating CI as a merge gate.
4. Prove Minimize Time On Site end-to-end (§6.1 — blocking).

---

## Phase 1 — in progress (2026-07-12)

### Completed this session

| Item | Status | Notes |
|------|--------|-------|
| **Pipeline zero-out** (§4.4/§4.8) | ✅ Fixed + tested | Per-part exclusion inside mixed blocks; `blockTotals` excludes zeroed parts |
| **Event override semantics** (§4.2/§5.2) | ✅ Fixed + tested | Part-level `event_assignments` now **replace** block baseline (not unioned) |
| **§6.1 flagship test** | ✅ Added | `minimizeTimeOnSite.test.ts` — segment layout from data-only profile |
| **Grab-bag cleanup** | ✅ Done | Migration `072`: dropped `base_sq_ft`, `agent_permissions`; shape-scoped admin visibility via `blockInstanceFieldVisibility.ts` (quieter expanded instance cards) |
| **Booking pipeline tests** | ✅ 10 tests | First pipeline tests since deliberate test-suite removal |
| **Admin relationship-label cleanup** | ✅ Phase A | `dependentInstances` removed from client/admin surfaces; shape cards now say "Allowed downstream shapes"; instance cards now say "Downstream instance links" |
| **Three-way wizard placement** | ✅ Phase B | `wizardVisible` boolean replaced by 4-state `wizardPlacement` (`hidden`/`topLine`/`subOption`/`both`); migration `073` backfills (`false → hidden`, `true → topLine`) and drops `wizard_visible`; fixed dead line-item path in `filterAndSortBlockInstances`. Admin control is a click-through title-row chip (`WizardPlacementInput.vue`, dispatched like `eventShapePlacement`) with a hover tooltip — matches the other flags rather than a dropdown |

### Flag audit (`composite` / `orchestrator` / `wizardPlacement`) — ✅ audited 2026-07-12

| Flag | Verdict | Where it drives behavior |
|------|---------|--------------------------|
| `composite` | **FLAG-DRIVEN** | `instanceComponents` panel + server validation (`validateBlockInstancesCompositeForComponents`); composite parents rollup child parts (`resolveComponentPartIds`); nested wizard selection cards; admin composition UI gated on `composite=true` |
| `orchestrator` | **FLAG-DRIVEN** (see notes) | Differential scheduling: `isDifferentialFromSelectedBlocks` true when any selected block has `orchestrator=true` (`useAvailabilityLogic`). Server ledger: `baseTime`/`baseFee` only on service-shape parts under `orchestrator=true` parent (`partInstanceEntityValidation`). Admin: orchestrator tab filters `orchestrator===true`. **`bookingCascades` → `activeBlockIds` is relationship-driven, not re-checked against `orchestrator` — intentional per Will sign-off below.** |
| `wizardPlacement` | **FLAG-DRIVEN** | Main wizard pool (`topLine`/`both`), line items (`subOption`/`both`), admin title-row chip, cascade fallbacks (`isWizardTopLine`), migration `073` |

**Will sign-off (2026-07-12):** restore three-way wizard placement (`topLine` / `subOption` / `both` / `hidden`); remove `dependentInstances`; **do not gate `bookingCascades` on `orchestrator`**. `bookingCascades` = concrete downstream instance links from the parent shape's `validBookingCascades` allowlist.

**Phase B done (2026-07-12):** `wizardVisible` → `wizardPlacement` (4-state enum); migration `073`; click-through admin chip; tests green.

**Test added:** `flagSemantics.test.ts` — orchestrator flag drives differential detection.

### Accumulator *(Will 2026-07-13 — usable bridge verified)*

**Earlier write-up was wrong** (treated accumulator as a truth-filter over `bookingCascades`). Correct model:

- **Vertical within shape** = `composite` / `instanceComponents` (code names kept).
- **Lateral user options** (“validator” in conversation) = `bookingCascades` / `validBookingCascades` (code names kept; admin copy may say “downstream options”).
- **Accumulator** = service selected **AND** property has linked characteristic → auto-include that characteristic; **not** a user pick of HVAC.

**Shipped in this pass:**
- Migration `074`: `block_instances.accumulator` + `accumulation_links` (`property_fact_key`)
- Migration `075`: persisted equipment Property Detail Facts (`hvacCount`, `waterHeaterCount`, `kitchenApplianceCount`) so accumulator gates work without MLS
- Migration `076`: time blocks can carry a default `propertyFactKey` (“Property Detail Fact”) for accumulator setup
- Shared evaluator + 8 unit tests (`accumulatorInclusions.test.ts`)
- Booking: inclusions merged into availability `accumulatedBlockInstances` and appointment `selectedTimeIds` / fee time list
- Property Details step: manual equipment fact inputs; MLS enrichment can populate the same fields later
- Admin: Time blocks expose `Property Detail Fact`; Accumulator services expose Accumulation links (active `time` block instances only). Linking a time block stores/updates the edge's runtime `property_fact_key` from the selected time block's default fact key.

**Verified 2026-07-14:** Will manually created/edited time blocks (`Furnace`, `Water Heater`, `Kitchen Range`), set each Property Detail Fact, and linked multiple time blocks from `Equipment Testing`. Agent verified DB/API edge facts:
- `Furnace` → `hvacCount`
- `Water Heater` → `waterHeaterCount`
- `Kitchen Range` → `kitchenApplianceCount`

**Quality gates 2026-07-14:**
- ✅ Client typecheck
- ✅ Server compile
- ✅ Full client Vitest: 9 files / 32 tests
- ✅ Focused accumulator/admin tests
- ✅ Client lint
- ✅ Server lint
- ✅ Client production build
- ⚠️ Server Jest command exits 0 but reports no server tests found

**Code-shape review 2026-07-14:** accumulator behavior now lives in flat helpers and server invariants, not one-off UI workarounds:
- `resolveAccumulatorInclusions` is the pure booking rule
- `relationshipIdsToPostForSave` is the pure client relationship-save rule
- accumulator relationship POST is a parent-child upsert on the server, so `propertyFactKey` can change without duplicate-row conflicts
- unconfigured link fact saves as empty key (`''`) and therefore never includes accidentally

**Still deferred:** broader non-service/time accumulator relationship types require an explicit future design.

**Hybrid naming (Will):** keep `composite` + `bookingCascades`; feature name = `accumulator`; clarify or rename `orchestrator` separately (not to differential-themed names that imply inclusion gates).

### Event routing audit

- **Part → segment:** DATA-DRIVEN via `event_assignments` (override fix applied)
- **Minimizer detection:** DATA-DRIVEN (`placement_kind === 'floating'`)
- **Placement resolution:** DATA-DRIVEN via `event_shapes.placement_kind` + `anchor_edge`; old `adjustMinorTimeRange` path removed
- **Attendee resolution:** SEGMENT-DRIVEN via `event_instance_attendees`; admin quick-select presets are convenience labels only, not the placement source of truth

### Event + attendee alignment *(2026-07-14 — first aligned slice complete)*

**Shipped:**
- Added flat placement resolver `createPlacedEventTimeRanges`: primary, front/back secondary, front/back marginal, front/back floating.
- `secondary` segments live inside the primary window; `marginal` segments are adjacent and expand the main busy window; `floating` segments remain separate minimizer/completion segments.
- `slotShape.roundedDuration` now reflects the main availability hold (primary + marginal, excluding floating when primary exists).
- Appointment slots persist event-shape metadata (`eventShapeId`, `eventShapeName`, `placementKind`, `anchorEdge`) with selected time ranges.
- Calendar invite creation now picks the matching selected time slot for each event instance by event-shape metadata, with legacy first-slot fallback.
- Admin attendee selector moved to `eventInstance` metadata; `eventShape` remains placement-only. Business Controls copy now describes attendee quick-select presets instead of “major/minor determines event role.”

**Tests added:**
- `eventSegmentPlacement.test.ts`
- `appointmentShapeEventAttendees.test.ts`
- `availabilityStepData.test.ts`

**Quality gates 2026-07-14:**
- ✅ Client typecheck
- ✅ Server build
- ✅ Full client Vitest: 12 files / 37 tests
- ✅ Client lint
- ✅ Server lint
- ✅ Client production build

**Still needs manual proof:** full §6.1 wizard walkthrough with a real Minimize Time On Site appointment and calendar invite creation.

**UI follow-up 2026-07-14:** Event admin now translates internal placement enums into scheduling-language labels:
- admin-facing `eventShape` vocabulary is now **Event Type**; the database/code key stays `eventShape`
- event shape `placementKind` + `anchorEdge` render as one **Timing behavior** selector (`Main appointment window`, `Inside end of main window`, `Work before main window`, `Flexible/off-site after main window`, etc.)
- event instance cards expose **Event type** instead of hiding `eventShapeRef`; any segment/event instance can be assigned to any configured Event Type
- collapsed event shape / event instance cards include friendly timing chips so admins are not forced to reason from `marginal` / `floating` terminology
- event block instance cards are segment-focused but still use the normal block-instance relationship surface: part assignments, event assignments, and components remain available where configured
- atomic event block instance cards now edit one segment directly; the multi-segment add/manage UI is reserved for event orchestrators
- segment editors now keep attendee type routing visible as a multi-select and persist it through `event_instance_attendees`
- template builder and Calendar behavior sections are collapsible cards so the core segment routing fields stay readable
- segment location copy now treats location as appointment-derived by default; the field is only a Zoom/custom virtual link override, while Google Meet stays controlled by the Meet switch

**Event part modifier follow-up 2026-07-15:**
- Event block instances now expose normal part assignment/configuration again, with event wording (`Included part types`, `Event part modifiers`) instead of a separate event-only pathway.
- Added `part_instances.base_multiplier` / `rate_multiplier` and version-table mirrors (default `1`) plus client/server model plumbing and metadata.
- Booking finalization keeps fixed add behavior (`baseTime`) and adds event-semantic multiplier behavior: an event block's part row targets the matching non-event Part Shape total routed to that same event segment and contributes `baseTime + currentEventPartTotal * (baseMultiplier - 1)`.
- API validation now allows event part rows to write time fields (`baseTime`, `timePerUnit`, `baseMultiplier`, `rateMultiplier`) while fee fields remain service-orchestrator only.
- Tests added in `bookingPipeline.test.ts` for fixed event part time and multiplier event part time; event field-visibility test now locks that event blocks keep the normal relationship surface.

**Segment part-claim UI follow-up 2026-07-15:**
- Segment builder now has a collapsible **Segment details** card containing Segment label, Event type, attendee types, and a **Claimed time blocks** checkbox system.
- Checkbox groups are built as service context -> active time block choices; selecting a time block persists a block-scoped `event_assignments` edge so the time block's parts pass through to the event segment.
- Clarified naming: `eventInstance.name` is an internal/admin **Segment label**, not the Google Calendar title. The actual calendar title remains `titleTemplate` / **Calendar Title** in Template builder.
- Added `eventPartClaimAssignments.test.ts` to lock cascade expansion, existing claim reads, and create/remove sync.

**Service event coverage warning follow-up 2026-07-15:**
- Base service block cards now show a red **Event coverage incomplete** alert when parts from active time blocks are not covered by active event assignments.
- Coverage expands active service -> time block links plus each time block's component parts, then reports uncovered parts and their source blocks.
- Added `serviceEventCoverage.test.ts` to lock active time block expansion, event coverage, and base-service-only warning scope.

**Service/time/event dependency follow-up 2026-07-15:**
- Reframed event segment claiming so events claim **time block instances**, not service blocks or individual service parts; the selected time block then passes its parts through to the event segment.
- Segment details now group claim controls as Service collapses -> Time block collapses -> time block checkbox, with service rows acting only as context.
- Service block cards use `bookingCascades` as **Active time blocks**; the coverage warning now reports unclaimed parts from active time blocks under the service.
- Wizard placement vocabulary is now admin-facing **Base**, **Additional**, **Option only**, and **Base or additional**; added the stored `additional` placement value and widened DB constraints via `20260715_000077_wizard_placement_additional.mjs`.

**Semantic service card surfaces follow-up 2026-07-15:**
- Service block cards now show a **Service activation** card with separate **Active time blocks** and **Active fee blocks** selectors, both backed by `bookingCascades` but filtered by block-shape semantic type.
- The generic service `bookingCascades` field is hidden to avoid a mixed downstream selector that combines time and fee blocks.
- Time cards render a named events readout (`{Block Shape Name} Events`) in the Events collapse; service cards choose a persisted **Default event instance** plus **Optional event instances** in Service activation.
- Added `serviceBlockActivation.test.ts` and `serviceEventRoutingReadout.test.ts` to lock semantic splitting and event readout behavior.
- Follow-up polish: **Service activation** now renders as a collapse like Events, and already-linked time/fee block instances remain in the select item list so chips display block names instead of raw ids.
- Layout polish: service work-item convergence now appears above Service activation, block instance `Icon` sits beside the existing expanded title-row `Name`, service cards no longer render an empty generic Events collapse, and active time/fee blocks are hidden on orchestrator services because they belong to atomic services.
- Added `block_instances.default_event_instance_id` / version mirror via `20260715_000078_block_instance_default_event.mjs` so default event selection is persisted separately from the event option relationship set.
- Flatten/slim pass: removed stale service/time event-routing helpers, removed unused part-scoped event-claim exports, replaced the old service readout helper with a time-block-only readout, and moved the nested event time-block claim checkbox UI into `EventInstanceTimeBlockClaims.vue`.
- stored enum values are unchanged; this is a presentation layer over the existing placement engine

**UI follow-up quality gates 2026-07-14:** client typecheck, full client Vitest (14 files / 42 tests), client lint, and client production build green.

### Ledger naming

- **Code/DB reality:** `baseTime`/`baseFee` + relational `event_assignments` (no scalar event columns)
- **Spec/PROGRESS drift:** still says `defaultTime`/`defaultFee`/`defaultEvent` — reconcile docs in a follow-up

### Migration coherence (fresh DB)

- **Fixed:** Pre-baseline `split_settings_data` no longer crashes when legacy tables absent; `baseline_from_dump` drops partial pre-baseline settings tables before applying squashed schema
- **Fixed:** `baseline_data.sql` is aligned to the squashed baseline schema for version rows, event placement, event-instance attendees, parent event instances, and part ledger column names
- **Fixed:** legacy migrations now no-op safely when the squashed baseline already contains their final table/column shape (`differential_role`, attendee table rename, soft-delete attendee columns, semantic type metadata/backfill, `organization_defaults`)
- **Verified:** full migration chain passes against a throwaway fresh local Postgres DB, then drops the throwaway DB

### Vocabulary retirement — ✅ complete (2026-07-12)

**Scope guard:** real-estate `property` (the house being inspected — `propertyVersionId`, `propertyDetails`, `PropertyResponse`, `selectedPropertyTypeBlocks`, the whole Property Details step) is legitimate first-class domain vocabulary and is **kept**. Only `property`/`coupon`/`option` used as *aliases for the `time`/`price`/`event` semantic types* are retired.

- **Slice 1 ✅** — appointment-selection API boundary renamed (`selectedPropertyIds`→`selectedTimeIds`, `propertyQuantities`→`timeQuantities`, `propertySnapshotIds`→`timeSnapshotIds`, `selectedOptionIds`→`selectedEventIds`, `optionQuantities`→`eventQuantities`, `optionSnapshotIds`→`eventSnapshotIds`) across codec + 9 consumers. No data migration (source of truth is `appointment_selection_lines.lineKind`, already `service/time/event`). Typecheck + tests + lint green.
- **Slice 2 ✅** — (a) removed dead legacy semantic-type string fallbacks (`'option'`/`'property'`/`'coupon'`) from `blockShapeTypeLookupCandidates` (DB `block_shapes.semantic_type` fully migrated to `user/service/time/event/price`, so unreachable); (b) **Will's call (2026-07-12): internal-only** — renamed the price-block plumbing (`selectedCouponBlocks`→`selectedPriceBlocks`, `availableCouponBlocks`→`availablePriceBlocks`, `toggleCouponBlock`→`togglePriceBlock`, `couponCascadeError`→`priceCascadeError`, cascade label `'coupons'`→`'prices'`) and **kept** the genuine customer-facing discount feature (`showApplyCoupon` DB column, "Apply Coupon"/"Coupon Discount" UI, `couponDiscount`) — a coupon is a real product concept, not old vocabulary. Typecheck + tests + lint green.
- **Slice 3 — Will's call (2026-07-12): KEEP as-is.** `selectedPropertyTypeBlocks` and `selectedOptionTypeBlocks` (+ `availabilityOptions`) are named after genuine customer-facing concepts ("property type", "availability option"), not old semantic-type aliases. Renaming would touch ~70 files and make the UI/code read more abstractly for no user benefit. **Vocabulary retirement considered complete** after slices 1–2 + legacy dead-code removal; grep-clean on the true aliases (the appointment-selection API fields, the legacy `'property'`/`'coupon'`/`'option'` semantic-type strings, and the `*CouponBlock*` price plumbing).

### Still open (Phase 1 backlog)

1. ~~Vocabulary retirement~~ ✅ done (see above)
2. ~~Flag wiring / three-property semantics audit~~ ✅ audited — see table above; `bookingCascades` intentionally not orchestrator-gated
3. ~~Accumulator~~ ✅ usable bridge verified (flag + links + evaluator + manual equipment facts + booking/appointment wire + existing-link fact-key upsert)
4. ~~Attendee logic~~ ✅ aligned first slice — placement from `placement_kind`/`anchor_edge`, attendees from `event_instance_attendees`, calendar invites use segment slot metadata
5. **Fresh DB migrate** — baseline seed refresh (see above)
6. **Manual §6.1 E2E** — wizard UI walkthrough with dev server (pipeline test covers math; UI still needs Will's eyes)
