# Feature 20 — domain architecture implementation plan

> **Status:** Draft rewrite aligned to locked canonical principles.
> **Locked source of truth:** `ARCHITECTURE_PRINCIPLES.md` is immutable and authoritative.
> **Purpose:** This file covers only implementation planning: what to build, adapt, delete, migrate, and review.
> **Replacement rule:** This file is the **canonical** domain implementation plan path for Feature 20; keep section numbering stable so phase guides and harness templates can cite §8 / §9 by reference.

---

## 0. Rewrite scope, outline map, and legacy assumptions to remove (Principles §1-§8)

> Principle source: this section is a control layer derived from the full locked principles set in `ARCHITECTURE_PRINCIPLES.md` §1-§8 (including §8 Invariants as the formal drift test).

- This rewrite does not invent or extend architecture. It translates the locked principles into execution order, migration mappings, deletion lists, and review gates.
- When a principle already defines the architecture, this document points to that section and keeps only implementation-specific detail.
- When v1 language conflicts with the principles, this rewrite deletes the conflicting concept instead of trying to blend both versions.
- Terminology is locked for this file:
  - Orchestrators = active assignment selectors.
  - Shape-level validity = the structural universe of possible options.
  - Event routing = event orchestrator baseline plus event profile overrides.
  - Booking totals = resolved by the client-side PartFinalizer; the server persists the submitted payload.
- This rewrite is complete only when every section cites the relevant principles section(s), contradictory terminology is removed, and the final section contains migration notes, a risk register, and unresolved decisions.

### 0.1 Rewrite outline mapped to principles sections

| Plan section | Purpose | Principles mapping |
| --- | --- | --- |
| 0 | Rewrite rules, outline map, legacy removals | §1-§8 |
| 1 | Rename mappings and part-instance migration mappings | §1, §4 |
| 2 | Schema and model changes | §1, §2, §3, §4, §5 |
| 3 | Admin redesign | §3, §5, §6, §7 |
| 4 | Booking pipeline rewrite | §1, §4, §5 |
| 5 | Server route and API alignment | §3, §4, §5 |
| 6 | Client code-change inventory | §5, §6, §7 |
| 7 | Resolved implementation positions | §1, §2, §3, §4, §5, §6, §7 |
| 8 | Ordered implementation passes | §1-§8 |
| 9 | Drift checklist, review gate, migration notes, risk register, unresolved decisions | §1-§8 |

### 0.2 Legacy assumptions to remove

These legacy assumptions must not survive the rewrite:

- Shape-level `composite/orchestrator` and related shape-level three-property framing.
- Orchestrators defining validity instead of selecting active assignments from the shape-level validity graph.
- Service-default/event-atomic event ownership model drift that weakens the explicit event orchestrator baseline plus event profile override model.
- Server-side resolution drift that turns the server into a second booking calculator.
- Scalar event storage on part instances instead of relational event assignments.
- Any exclusion of user instances from the three-property model.

## 1. Rename mappings and migration mappings (Principles §1, §4)

> Principle source: `ARCHITECTURE_PRINCIPLES.md` §1 defines the block-type domain map. `ARCHITECTURE_PRINCIPLES.md` §4 defines the part-instance ledger and the two-tier resolution model. This section keeps only the migration-facing mappings needed to implement that model.

### 1.1 Block type rename mappings

| Target type | Current type |
| --- | --- |
| `time` | `property` |
| `price` | `coupon` |
| `event` | `option` |

### 1.2 Part-instance migration mapping

The principles lock in a two-tier model:

- Service orchestrator part instances own `baseTime` and `baseFee`.
- Time atomics own `timePerUnit`.
- Price atomics own `feePerUnit`.
- Event assignments remain relational in `event_assignments`; they do not become scalar part-instance columns.

| Concern | Current state | Target state aligned to principles |
| --- | --- | --- |
| Time | `baseTime`, `rateOverBaseTime` | Keep `baseTime` only for service orchestrator part instances. Rework `rateOverBaseTime` into time-domain contribution storage so time atomics own `timePerUnit`. |
| Price | `baseFee`, `rateOverBaseFee` | Keep `baseFee` only for service orchestrator part instances. Rework `rateOverBaseFee` into price-domain contribution storage so price atomics own `feePerUnit`. |
| Event | Routing currently split across `event_assignments` and legacy differential-role assumptions | Keep event routing relational through `event_assignments` only. Model default routing as event orchestrator baseline assignments and alternate routing as event profile overrides. |
| Zero-out | Existing independent zeroing behavior | Preserve zero-out semantics as a last-wins booking-resolution override after base floor enforcement. Naming may change later; ordering cannot. |

### 1.3 Legacy assumptions removed from the mapping layer

The rewrite removes these v1 assumptions because they contradict the principles:

- No scalar `defaultEvent` or `eventOverride` columns are introduced on part instances.
- No `defaultTime` or `defaultFee` rename is used to move base ownership away from service orchestrators.
- No atomic-service-owned default or floor model is introduced; service orchestrators remain the only base owners.

### 1.4 Acceptance checks for section 1

- Type rename table uses only `property -> time`, `coupon -> price`, and `option -> event`.
- Base values remain attached to service orchestrator part instances only.
- Event routing is described as relational, not scalar.
- This section contains no new architecture beyond Principles §1 and §4.

## 2. Model changes (DB / Sequelize) (Principles §1, §2, §3, §4, §5)

> Principle source: `ARCHITECTURE_PRINCIPLES.md` §1 includes the domain separation rule for part-instance writes. §2 locks the three-property instance model. §3 locks layering and ownership. §4 locks part-instance storage and resolution. §5 locks the placement-slot event model.

### 2.1 Rename block-shape type enum

| Old | New | Migration |
| --- | --- | --- |
| `property` | `time` | Alter enum values and migrate existing `block_shapes.type` rows. |
| `coupon` | `price` | Alter enum values and migrate existing `block_shapes.type` rows. |
| `option` | `event` | Alter enum values and migrate existing `block_shapes.type` rows. |

Implementation touchpoints remain:

- `block_shapes.type`
- `server/src/db/models/admin/block_shape.ts`
- Client constants and all code branches that switch on the old type strings

### 2.2 Tables that survive and are repurposed

| Table | Keep or adapt | Target purpose |
| --- | --- | --- |
| `event_shapes` | Keep and adapt | Admin-managed placement types with `placement_kind` and `anchor_edge`. |
| `event_instances` | Keep and adapt | Named segments owned by an event block instance via `parent_block_instance_id`. |
| `event_assignments` | Keep | Routing edges from event instances to part instances. |
| `event_shape_attendees` | Rename and adapt | `event_instance_attendees`, because attendees belong to segments, not placement types. |
| `valid_event_cascades` | Keep | Shape-level validity for which event block shapes are structurally possible from service shapes. |
| `property_feature_mappings` | Keep and re-scope | MLS-driven auto-selection of time block instances. |
| `property_field_mappings` | Keep | MLS-to-`property_details` population rules. |
| `property_details` | Keep | Appointment-scoped input surface consumed by time atomics. |
| `part_assignments` | Keep | Through-table connecting block instances to their part instances. Every block instance creates part instances via this table. No structural change. |

**Default placement type seeds (Principles §5.1):** These are defaults, not fixed. Admins can add, rename, or remove placement types.

| Seed row | placement_kind | anchor_edge |
| --- | --- | --- |
| Primary | `primary` | — |
| FrontSecondary | `secondary` | `start` |
| BackSecondary | `secondary` | `end` |
| FrontMarginal | `marginal` | `start` |
| BackMarginal | `marginal` | `end` |
| FrontFloating | `floating` | `start` |
| BackFloating | `floating` | `end` |

**Placement column validation (Principles §5.1, §5.3):** `placement_kind` MUST be one of `primary`, `secondary`, `marginal`, `floating`. `anchor_edge` MUST be `start`, `end`, or null (use null for `primary`). API and DB constraints should reject other combinations so the layout engine stays data-driven.

### 2.3 Columns to drop

| Table.column | Why it is removed |
| --- | --- |
| `block_instances.differential_event_role_overrides` | Event placement is data on event shapes and event assignments, not a JSON override layer. |
| `block_instances.bookingMode` | Replaced by `block_instances.wizardVisible` in the three-property instance model. |
| `block_shapes.composable` | Replaced by the explicit instance-level `composite` property plus existing shape-level validity. |
| `block_shapes.isStateControl` | Replaced by explicit instance-level orchestration behavior and wizard visibility. |
| `block_shapes.canHaveParts` | Removed because every block instance creates part instances; no replacement derivation is needed. |
| `event_shapes.differential_role` | Replaced by `placement_kind` and `anchor_edge`. |
| `event_shapes.include_reschedule_link` | Moved to event instances because calendar behavior belongs to segments. |
| `event_shapes.include_cancel_link` | Moved to event instances because calendar behavior belongs to segments. |

### 2.4 Columns and tables to add or adapt

| Item | Notes |
| --- | --- |
| `block_instances.composite` | Instance-level boolean. Indicates same-shape child ownership. |
| `block_instances.orchestrator` | Instance-level boolean. Indicates active assignment selection across block types. |
| `block_instances.wizardVisible` | Instance-level boolean. Indicates booking-wizard visibility. |
| `event_instances.parent_block_instance_id` | Required ownership link from segment to event block instance. |
| `event_shapes.placement_kind` | Required placement category: `primary` \| `secondary` \| `marginal` \| `floating` (Principles §5.1). |
| `event_shapes.anchor_edge` | Required for non-primary kinds: `start` \| `end` \| null (`primary` uses null). |
| `event_instances.location_type` | Structured segment location semantics. |
| `event_instances.location_place_id` | Optional place identifier for off-site segments. |
| `event_instances.location_address` | Optional resolved address for off-site segments. |
| `event_instances.location_lat` / `location_lng` | Optional coordinates for off-site segments. |
| `event_instances.include_reschedule_link` | Per-segment calendar control. |
| `event_instances.include_cancel_link` | Per-segment calendar control. |
| `event_instance_attendees` | Segment-level attendee table keyed to `event_instances` and user `block_instances`. |
| Event instance calendar payload (existing or migrated columns) | Per Principles §5.4, each segment carries everything needed to build a calendar event: templates and policy such as `titleTemplate`, `descriptionTemplate`, `visibility`, `transparency`, invite links, reminders, and related fields — scoped in API/admin to the segment editor, not to placement types (`event_shapes`). |

### 2.5 Explicit removals of legacy architectural drift

**Domain separation constraint (Principles §1):** Each block type domain writes only its own concern on part instances. Domains compose; they do not overwrite.

The following v1 assumptions are removed because they contradict the locked principles:

- The three properties do **not** move to `block_shapes`; they stay on `block_instances`.
- `orchestrator` does **not** imply `composite`; the axes remain orthogonal.
- User instances do participate in the three-property model.
- Orchestrators do **not** define validity graphs; they select active assignments from the shape-level validity graph.
- Part creation is not limited to atomic service instances; every block instance creates part instances.

### 2.6 Entity-key impact

- `eventShape` remains a first-class entity because placement types remain editable data.
- `eventInstance` remains a first-class entity, but creation and editing happen in the context of its parent event block instance.

### 2.6a Seed and migration data quality (Principles §3.2 diagram note)

Do not reuse the **same block instance display name** for two different **roles** in live seed data (for example, the same label for both an orchestrator package and a composite add-on package). Admins must be able to distinguish roles in the graph; rename or split rows if a name collision appears after migrations.

### 2.7 Acceptance checks for section 2

- `composite`, `orchestrator`, and `wizardVisible` are described only as `block_instances` properties except when dropping legacy columns.
- No `orchestrator -> composite` rule appears.
- User instances are explicitly included.
- Event routing remains relational through `event_assignments`.
- `canHaveParts` is removed without replacement logic.
- Default placement seeds from section 2.2 are documented for migration and data setup.
- `placement_kind` and `anchor_edge` allowed values match Principles §5.1.
- Segment-level calendar payload fields (Principles §5.4) are owned on `event_instances`, not on placement types.
- Seed data avoids duplicate block instance **names** for distinct orchestrator vs composite roles (section 2.6a).

## 3. Admin page redesign (Principles §3, §5, §6, §7)

> Principle source: `ARCHITECTURE_PRINCIPLES.md` §3 defines layering and ownership. §5 defines placement-slot event behavior. §6 defines MLS enrichment and `property_details` as appointment input (relevant to time-atomic admin and wizard). §7 defines the two-mode admin and the atomic service convergence point.

### 3.1 Current structure to replace

```text
AdminPanel
├── Instances tab
│   ├── [per block shape] → BlockInstancesGroup
│   ├── Calibration tab → FeeCalibrationPanel
│   └── Events tab → EventInstancesSection
├── Shapes tab
│   ├── Block Shapes → ShapesTabBlockPanel
│   ├── Part Shapes → ShapesTabPartPanel
│   ├── Annotation Shapes → ShapesTabAnnotationPanel
│   └── Event Shapes → ShapesTabEventPanel
├── Appointments tab → DataManagementTab
└── Controls tab → BusinessControlsTab
```

### 3.2 What to remove or adapt

| Current artifact | Action | Why |
| --- | --- | --- |
| `FeeCalibrationPanel` and calibration helpers | Remove | Fee editing belongs in price-domain editing and service convergence surfaces, not a separate structural tab. |
| Standalone Events tab on Instances | Relocate | Event instances are edited in the context of their parent event block instance. |
| `ShapesTabEventPanel` | Adapt | Event shapes become placement-type editing for `placement_kind` and `anchor_edge`. |
| Differential role matrix on block-instance forms | Remove | Placement comes from event shape data plus event assignments, not role enums. |
| Generic `EntityCard`-driven editors | Replace progressively | Principles §7 call for domain-specific editors once the domain has crystallized. |

### 3.3 Target admin structure

```text
AdminPanel
├── Orchestration tab
│   ├── User orchestrator instances (inspector, client, agent, …)
│   │   └── Multi-select: which service orchestrators are active for this user type; drives wizard state and user-based cascades
│   ├── Service orchestrator instances
│   │   └── Select active atomic services, time packages, price packages, and event packages
│   ├── Time orchestrator instances
│   │   └── Select active property characteristics and add-ons
│   ├── Price orchestrator instances
│   │   └── Select active fee drivers and price packages
│   └── Event orchestrator instances
│       └── Select active event profiles and maintain the baseline event package
├── Services tab
│   └── Atomic service instances
│       └── Inline convergence editor for part rows, time contributions, fee contributions, and event assignments
├── Shapes tab
│   ├── Block Shapes
│   ├── Part Shapes
│   ├── Annotation Shapes
│   └── Event Shapes (placement types)
├── Appointments tab
└── Controls tab
```

Key implementation rule: orchestration editors operate on **block instances where `orchestrator = true`** and let admins select active downstream assignments from the **shape-level validity graph**. They do not define validity.

**Orchestration UI pattern (Principles §7.2):** Use **multi-select drop-downs** (or equivalent multi-select controls) populated only with block instances the shape-level validity graph already permits. The admin marks which downstream instances are **active** for the current orchestrator — the UI does not author new structural possibilities (that remains the Shapes tab / `valid_*` tables).

**Bottom-up workflow constraint (Principles §7.2):** The admin always builds from the bottom up — (1) define validity on the shapes tab, (2) create atomics with part instances drawn from the shape-level graph, (3) open an orchestrator and pick from what already exists. This eliminates back-and-forth between tabs during day-to-day configuration.

### 3.4 Atomic service editor as the work hub

The atomic service editor remains the primary admin surface because it is where downstream domains converge operationally:

- Admin sees the service part rows that represent work items.
- Time edits project to time-atomic part rows.
- Fee edits project to price-atomic part rows.
- Event routing edits project to `event_assignments` under the selected event package.
- Base defaults and floors remain visible through the service-orchestrator context; the UI is a projection layer, not a second source of truth.

### 3.5 Segment manager UX inside the event editor

The segment manager replaces the standalone event-instance flow and the differential role matrix.

```text
Event block instance editor
├── Available part instances (grouped by atomic service lineage)
└── Segments
    ├── Segment name
    ├── Placement-type select (`event_shape_ref`)
    ├── Assigned part instances
    ├── Location and attendee fields
    └── Calendar properties
```

**Wireframe (segment manager layout):**

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Event: "Minimize Time On Site"                                         │
├───────────────────────────┬─────────────────────────────────────────────┤
│ AVAILABLE PART INSTANCES  │ SEGMENTS                                    │
│ (grouped by atomic svc)   │                                             │
│                           │ ┌─ Early Arrival [FrontMarginal ▾] ───────┐ │
│ ▼ Roof Inspection         │ │  Roof Inspection → Data Collection      │ │
│   ☐ Data Collection       │ │  Exterior Inspection → Data Collection  │ │
│   ☐ Report Writing        │ └─────────────────────────────────────────┘ │
│                           │                                             │
│ ▼ Exterior Inspection     │ ┌─ Primary [Primary ▾] ──────────────────┐ │
│   ☐ Data Collection       │ │  Interior Inspection → Data Collection │ │
│   ☐ Report Writing        │ └─────────────────────────────────────────┘ │
│                           │                                             │
│ ▼ Interior Inspection     │ ┌─ Client Presentation [BackSecondary ▾] ┐ │
│   ☐ Data Collection       │ │  Interior Insp → Formal Presentation   │ │
│   ☐ Report Writing        │ └─────────────────────────────────────────┘ │
│   ☐ Formal Presentation   │                                             │
│                           │ ┌─ OffSite [FrontFloating ▾] ────────────┐ │
│ ⚠ 0 unassigned            │ │  Roof Inspection → Report Writing      │ │
│                           │ │  Exterior Inspection → Report Writing   │ │
│                           │ │  Interior Inspection → Report Writing   │ │
│                           │ └─────────────────────────────────────────┘ │
│                           │                                             │
│                           │ [+ Add Segment]                             │
└───────────────────────────┴─────────────────────────────────────────────┘
```

Behavior rules:

- **Left panel:** All part instances from valid atomic services, grouped by source block instance. Each part instance shows its name and (if time rates are set) its duration. Assigned parts can show a checkmark or be visually de-emphasized.
- **Right panel:** Named segments (event instances). Each segment has a **placement-type dropdown** (from event shapes) and a list of assigned part instances (`event_assignments`).
- **Assignment:** Drag-and-drop or checkbox-select from left to right. Each part instance belongs to exactly one segment within the selected event package.
- **Completeness indicator:** Show **N unassigned** at the bottom of the left panel when part instances lack a segment — warn the admin before booking. Optionally enforce assignment before save.
- **Default case:** The baseline event orchestrator’s package typically has one **Primary** segment with all relevant part instances assigned.
- Each part instance resolves to exactly one segment within the selected event package.
- The baseline event orchestrator provides the default segment graph.
- Event profiles override only the part-instance assignments they explicitly set.
- Segment completeness warnings stay in admin so routing gaps are visible before booking.

**Why this works:** Atomic services already produce distinct part instances per work item (e.g. “Roof Inspection → Data Collection” vs “Interior Inspection → Data Collection”). The segment manager assigns those existing rows to segments; admins do not need to pre-split part shapes for routing granularity.

### 3.6 Domain-specific editors replacing EntityCard

The rewrite keeps the v1 direction but aligns its terms to the principles:

| Editor target | Implementation role | Component pattern |
| --- | --- | --- |
| Service orchestrator editor | Validity-constrained active assignment selection. | VCard + VForm + RelationshipCollection |
| Service atomic editor | Convergence view for part rows and downstream projections. | VCard + VDataTable (inline domain columns) |
| Time orchestrator and atomic editors | Characteristic package selection and per-unit duration configuration. | VCard + VForm + RelationshipCollection / VCard + VForm |
| Price orchestrator and atomic editors | Fee package selection and per-unit fee configuration. | VCard + VForm + RelationshipCollection / VCard + VForm |
| Event orchestrator and profile editors | Baseline segment ownership and override routing management. | VCard + VForm + segment manager |
| Segment editor | Per-segment placement, attendees, location, and calendar properties. | VCard + VForm |
| Placement type editor | Simple CRUD for event shapes. | VDataTable |
| Annotation editor | The only remaining metadata-driven surface. | Metadata-driven (keep existing) |

`RelationshipCollection` survives because it still matches the generic shape-level validity and assignment-selection problem well.

Concrete first-wave editor order:

1. `PlacementTypeEditor`
   - Smallest proof of concept.
   - Confirms the direct-Vuetify replacement pattern on a fixed-field entity.
2. `ServiceAtomicEditor`
   - Highest-value convergence surface.
   - Proves the inline part-row projection model for time, price, and event domains.
3. Remaining domain editors
   - Service, time, price, and event orchestrator and atomic editors.
   - `SegmentEditor` and shape editors.
4. Annotation exception
   - Keep metadata-driven annotation editing after generic entity editing is removed.

Implementation detail preserved from v1:

- The metadata system is still expected to shrink to annotations-only usage.
- The replacement path should favor direct Vuetify or Vuexy form components instead of rebuilding metadata indirection.
- `RelationshipCollection` and related relationship editing patterns remain reusable where they match the validity/assignment problem cleanly.

### 3.7 Acceptance checks for section 3

- Admin descriptions say orchestrators **select** active assignments from the validity graph.
- Orchestration editors use **multi-select** (or equivalent) constrained by the validity graph (Principles §7.2).
- **User orchestrators** have a clear home on the Orchestration tab (Principles §3.3).
- Shapes tab remains structural; it does not take on orchestration behavior.
- Event routing language uses baseline event orchestrator plus event profile overrides.
- No shape-level three-property wording remains in the target admin structure.

## 4. Booking pipeline changes (Principles §1, §4, §5)

> Principle source: `ARCHITECTURE_PRINCIPLES.md` §1 domain separation composes with PartFinalizer outputs. §4 locks the PartFinalizer contract, lineage correlation, resolution order (§4.4), additive composition (§4.5), time rates vs inputs (§4.6), per-block-instance guarantees (§4.7), and zero-out admin visibility (§4.8). `ARCHITECTURE_PRINCIPLES.md` §5 locks event placement as data, not computation.

### 4.1 Current chain to simplify

```text
buildAppointmentShape
  -> createBlockFinals
  -> createPartFinals
  -> buildEventAssignmentsByPartShape
  -> enrichBlockFinalsWithDifferentialRoles
  -> calculateSlotShape
  -> applyShapeToTime
  -> perspectiveResolver
  -> minimizerSchedulingBounds
```

### 4.2 Target pipeline aligned to the principles

The replacement flow should be read in the same order as Principles §4.4:

```text
buildAppointmentShape
  1. createPerBlockInstancePartRecords
  2. resolvePartLevelTime
  3. resolvePartLevelFee
  4. resolvePartLevelEventAssignment
  5. applyZeroOutLast
  6. groupResolvedTimeByEvent
  7. rollResolvedFeesByOrchestrator
  8. layoutSegmentsOnTimeAxis
  9. derivePerspectiveViews
  10. resolveFloatingWindows
```

Implementation note: steps 8-10 are downstream consumers of the resolved part/event outputs from steps 1-7. They do not replace the principles’ seven-step resolution order; they happen after it.

### 4.2a PartFinalizer aggregation formulas (Principles §4.3)

At the part-instance level (within each lineage bucket), the resolved outputs match the principles’ contract:

```text
resolvedTime  = base (from service) + sum(timePerUnit × input) across time atomics
resolvedFee   = base (from service) + sum(feePerUnit × input) across price atomics
resolvedEvent = event profile override ?? event orchestrator baseline assignment
```

The PartFinalizer enforces the service orchestrator base as a **floor** for resolved time and fee unless zero-out applies per §4.4 step 5 and §4.8.

**Module shape (Principles §4.3):** Keep one pipeline entry point but implement with small units — e.g. `resolveTimeForPart`, `resolveFeeForPart`, `resolveEventForPart`, then `groupTimeByEvent`, `rollFeesByOrchestrator` — so the booking client does not collapse into a single unmaintainable module.

**Rejected for now (Principles §4.2.1):** Do not introduce a `resolution_group_id` (or similar) column on `part_instances` as the primary correlation key. The principles reject a single rigid group id; prefer **lineage** via the existing cascade/selection graph unless a future case proves otherwise.

### 4.3 What gets removed

| Current concept | Action | Replacement |
| --- | --- | --- |
| Differential role enrichment | Delete | Event shape placement data plus event-instance grouping. |
| `PartFinal.major`, `PartFinal.minor`, `PartFinal.minimizer` | Remove | Placement comes from the resolved event instance and its event shape. |
| Role-based slot offset logic | Rewrite | Segment-based layout using `placement_kind` and `anchor_edge`. |
| Resolution by part shape alone | Forbidden | Correlate by lineage to the atomic service or appointment line. |

### 4.4 What stays conceptually the same

- PartFinalizer remains the booking aggregation layer.
- Zero-out remains a last-wins numeric override after base floor enforcement.
- Constraint evaluation still consumes resolved segment durations and windows.
- `applyShapeToTime` can survive conceptually, but its inputs become segment-based instead of role-based.

### 4.4a Additive composition contract (Principles §4.5)

- PartFinalizer sums perUnit contributions additively (or multiplicatively for **percentage**-based adjustments like discounts).
- No block instance overwrites another’s contribution — each has its own records.
- Domains compose; they do not overwrite (see domain separation constraint in section 2.5 and Principles §1).

### 4.4b Time atomics: rates vs inputs (Principles §4.6)

- Time atomics define **rates** (admin-configured). **Inputs** come from `property_details` (appointment-scoped).
- Formula: `Rate (from time atomic config) × Input (from property_details) = Duration contribution`.
- `property_details` stays an appointment-scoped data surface; time atomics read from it and do not replace it.

### 4.4c Per-block-instance guarantees and zero-out admin visibility (Principles §4.7, §4.8)

- **Provenance:** Each contribution traces to a specific block instance’s part instances (base vs perUnit vs event assignment).
- **Clean undo:** Removing a block instance deletes its part instances. No shared records to recalculate.
- **Versioned reconfiguration:** A reschedule after admin rate changes only affects the reconfigured block instance’s part instances; PartFinalizer recomputes from the current set.
- **Zero-out admin visibility:** Zeroed-out parts **still appear in admin** grids (service atomic editor, part grids). Exclusion applies to **booking resolution and rollups** only — admins must see and edit the flag.

### 4.5 Client versus server boundary

This rewrite keeps the principle boundary explicit:

- The client PartFinalizer resolves time totals, fee totals, and segment placement for booking.
- The server returns configuration and raw rows.
- On submit, the server persists the submitted appointment payload.
- The server does not re-run booking resolution to verify client totals.

**Read-only previews (Principles §4.3):** Any future **preview** or read-only path that needs resolved numbers MUST reuse the **same client-side** finalizer logic — for example, pure helpers in `@shared` that are **consumed only from the client bundle** — not a second server-side booking calculator.

### 4.6 Acceptance checks for section 4

- Resolution order is consistent with Principles §4.4.
- Event placement is described as data lookup plus grouping, not differential-role computation.
- Lineage is the only permitted correlation strategy described here.
- No server-side booking calculator is introduced.
- Previews and client-only tools reuse the same finalizer code paths as the live wizard (Principles §4.3).

## 5. Server route / API changes (Principles §3, §4, §5)

> Principle source: `ARCHITECTURE_PRINCIPLES.md` §3 defines ownership boundaries. §4 defines client-only booking resolution. §5 defines event entities and placement data.

### 5.1 Routes to adapt

| Route or module area | Required change |
| --- | --- |
| `eventShape` CRUD | Enforce `placement_kind` ∈ `{primary, secondary, marginal, floating}` and `anchor_edge` ∈ `{start, end, null}` consistent with Principles §5.1; protect referenced placement types. |
| `eventInstance` CRUD | Require `parent_block_instance_id` and scope segment editing to the parent event block instance. Accept and validate **calendar segment fields** per Principles §5.4 (e.g. `titleTemplate`, `descriptionTemplate`, `visibility`, `transparency`, invite links, reminders) in addition to placement, location, and attendee data. |
| `event-instance-preview` router or equivalent preview path | Re-scope previews to segments under a parent event block instance, or simplify to segment-duration preview behavior. |
| Block shape and block instance CRUD | Accept renamed type values and align payloads with instance-level three-property fields. |
| `eventAssignments` relationship handling | Keep the through-table; validate segment ownership and routing integrity. |
| `validEventCascades` relationship handling | Keep as the shape-level validity surface for structurally possible event options. |
| Appointment persistence helpers and routers | Persist the selected event block instance context and the client-submitted resolved payload. |
| Calendar event creation services | Read segment identity from event instances and placement policy from event shapes. |

### 5.2 Server behavior constraints

- Server APIs should expose configuration and raw storage rows needed by the client finalizer.
- Server APIs should not introduce an alternate booking-total calculator.
- Validation may confirm payload shape and ownership consistency, but not re-resolve booking totals.

### 5.3 Routes to simplify or remove

| Route or module area | Action |
| --- | --- |
| Differential-role-specific helpers and schemas | Remove. |
| `event_shape_attendees` relationship handlers | Adapt to `event_instance_attendees`. |
| Event-shape metadata complexity | Reduce to the small fixed placement-type field set. |
| Event-shape admin metadata routes | Simplify if retained; placement types have a small known field set. |

### 5.4 Acceptance checks for section 5

- No route description implies server-side resolution drift.
- Event ownership flows through `event_instances.parent_block_instance_id`.
- Shape-level validity remains separate from orchestrator assignment selection.

## 6. Client code changes (Principles §5, §6, §7)

> Principle source: `ARCHITECTURE_PRINCIPLES.md` §5 defines placement data and segment ownership. §6 defines MLS-driven `property_details` and feature mapping surfaces the wizard and admin may touch. §7 defines domain-specific editors and the atomic service convergence surface.

### 6.1 Admin views and components to adapt

- Adapt `ShapesTabEventPanel.vue` into a placement-type editor.
- Relocate event-instance editing components into the event block-instance editor as the segment manager.
- Remove calibration-only UI that no longer matches the convergence model.
- Replace remaining `EntityCard`-based editing flows with domain editors in an incremental sequence.

Concrete component targets from v1 to preserve for execution planning:

- `EventInstancesSection.vue`
- `EventInstanceEditor.vue`
- `EventInstanceBuilderBody.vue`
- `EventInstanceListItem.vue`
- `EventInstanceTemplateFields.vue`
- `EventInstanceVariableChips.vue`
- `EventInstancePreviewPanel.vue`
- `EventInstanceCalendarSettings.vue`

These should be adapted around parent event block-instance context rather than standalone event-instance editing.

### 6.1a Admin composables to adapt

- Adapt `composables/admin/useEventInstanceBuilder.ts` — receives `parentBlockInstanceId` context.
- Adapt `composables/admin/useEventInstancesSection.ts` — scoped to segments under one event block instance.
- Adapt `composables/admin/useEventTemplatePreview.ts` — preview derives from placement-slot shape plus assigned parts.
- Delete `composables/admin/useCalibrationChart.ts` — fee calibration is removed.

Paths are relative to `client/src/` unless noted as `server/`.

### 6.2 Booking utilities to rewrite or delete

- Delete differential-role utilities, enums, constants, and role-matrix helpers.
- Rewrite slot-shape helpers to consume grouped segment durations and placement data.
- Rewrite perspective and floating-window helpers to read `placement_kind` and `anchor_edge`.
- Keep lineage-aware part correlation explicit in the PartFinalizer path.

Concrete rewrite/delete buckets from v1 to preserve:

- Delete:
  - `utils/admin/differentialRoleMatrixRows.ts`
  - `utils/eventAttendeeUtils.ts`
  - `shared/types/differentialRole.ts`
  - `shared/utils/differentialRoleUtils.ts`
  - `shared/constants/differentialRoleMappings.ts`
- Rewrite:
  - `utils/booking/perspectiveResolver.ts`
  - `utils/booking/minimizerEventShapes.ts`
  - `utils/booking/minimizerSchedulingBounds.ts`
  - `utils/booking/partFinalizerSlotShapeHelpers.ts`

### 6.3 Shared display and metadata cleanup

- Simplify event-shape display configs to the placement-type field set.
- Keep annotation metadata editing.
- Delete generic metadata infrastructure once each affected domain editor is live.
- Keep `RelationshipCollection` and related generic relationship editing utilities where they still map cleanly to the validity/assignment problem.

Execution detail preserved from v1:

- `configs/field/display/appliedDisplay/eventShapeDisplays.ts` is part of the placement-type simplification work.
- `selectableDisplayConfigTypes.ts` and related event-shape or event-instance display wiring should be adapted, not assumed obsolete.
- `EntityCard` cleanup remains a later pass after replacement editors are proven.
- The metadata cleanup target is still large: component tree, composables, types, utilities, and constants should be removed in grouped passes, with annotation-specific pieces retained.

### 6.3a Full deletion inventory for EntityCard and metadata infrastructure

> Principle source: `ARCHITECTURE_PRINCIPLES.md` §7.1 — domain-specific editors replace generic `EntityCard`; metadata survives for annotations only. Paths below are relative to `client/src/` except `server/` entries.

**Approximate totals:** ~120 files deleted, ~15–20 domain editors created (Principles §7.1).

**EntityCard component tree (delete once all domain editors exist) — 9 files:**

- `components/admin/generic/EntityCard.vue`
- `components/admin/generic/EntityCardContent.vue`
- `components/admin/generic/EntityCardSubPanels.vue`
- `components/admin/generic/EntityCardPrimaryTitleRow.vue`
- `components/admin/generic/EntityCardPartsTotals.vue`
- `components/admin/generic/EntityCardFeePreview.vue`
- `components/admin/generic/EntityFormContent.vue`
- `components/admin/generic/entityCardConstants.ts`
- `components/admin/generic/StatusButton.vue`

**EntityCard field renderers (replace with direct Vuetify/Vuexy inputs in domain editors) — 9 files:**

- `components/admin/generic/fields/FieldRenderer.vue`
- `components/admin/generic/fields/TextInput.vue`
- `components/admin/generic/fields/NumberInput.vue`
- `components/admin/generic/fields/SelectInputs.vue`
- `components/admin/generic/fields/BooleanInput.vue`
- `components/admin/generic/fields/IconInput.vue`
- `components/admin/generic/fields/PrimitiveInputs.vue`
- `components/admin/generic/fields/EventInstanceTemplateRef.vue`
- `components/admin/generic/fields/AnnotationContentEditor.vue` → **keep** (annotations stay metadata-driven)

**EntityCard composables (14 — delete):**

- `composables/admin/useEntityCardMetadata.ts`
- `composables/admin/useEntityCardFormSetup.ts`
- `composables/admin/useEntityCardFieldConfiguration.ts`
- `composables/admin/useEntityCardFieldContextAndVisibility.ts`
- `composables/admin/useEntityCardForm.ts`
- `composables/admin/useEntityCardSaveAndActions.ts`
- `composables/admin/useEntityCardSaveHandlers.ts`
- `composables/admin/useEntityCardSaveState.ts`
- `composables/admin/useEntityCardStoreSync.ts`
- `composables/admin/useEntityCardExpansion.ts`
- `composables/admin/useEntityCardActions.ts`
- `composables/admin/useEntityCardPrimaryTitleModels.ts`
- `composables/admin/useEntityCardSubPanels.ts`
- `composables/admin/useEntityCardAnnotationComposedMetadata.ts`

**EntityCard types (12 in v1 heading — 13 paths listed — delete):**

- `types/admin/entityCardFormSetup.ts`
- `types/admin/entityCardFieldContextAndVisibility.ts`
- `types/admin/entityCardFieldConfiguration.ts`
- `types/admin/entityCardStoreSync.ts`
- `types/admin/entityCardSaveState.ts`
- `types/admin/entityCardSaveHandlers.ts`
- `types/admin/entityCardSaveAndActions.ts`
- `types/admin/entityCardMetadata.ts`
- `types/admin/entityCardLayout.ts`
- `types/admin/entityCardForm.ts`
- `types/admin/entityCardExpansion.ts`
- `types/admin/entityCardComputed.ts`
- `types/admin/entityCardActions.ts`

**EntityCard utilities (8 — delete):**

- `utils/admin/entityCardTitleKeydown.ts`
- `utils/admin/entityCardStoreSyncSteps.ts`
- `utils/admin/entityCardSaveMerge.ts`
- `utils/admin/entityCardRelationshipSync.ts`
- `utils/admin/entityCardRelationshipCollectionField.ts`
- `utils/admin/entityCardPrimaryTitleShapeNames.ts`
- `utils/admin/booleanInputClickHandler.ts`
- `composables/admin/entityCardActionsPersistence.ts`

**Metadata pipeline composables (delete except annotations subset):**

- `composables/admin/useEntityMetadata.ts` → **delete**
- `composables/admin/useMetadataCache.ts` → **delete**
- `composables/admin/useAdminMetadataMutations.ts` → **keep for annotations only**
- `composables/admin/usePrimitiveMetadataSave.ts` → **keep for annotations only**
- `composables/admin/useMetadataFieldDrag.ts` → **delete**
- `composables/admin/useMetadataFieldOrdering.ts` → **delete**
- `composables/admin/useSelectConfig.ts` → **evaluate** (may still serve relationship selects)
- `composables/admin/useFieldComponent.ts` → **delete**
- `composables/admin/useFieldLocation.ts` → **delete**
- `composables/admin/useFormFieldConfigs.ts` → **delete**
- `composables/admin/useFieldInputSetup.ts` → **delete**
- `composables/admin/useFieldInputHandlers.ts` → **delete**
- `composables/admin/useSelectHandlers.ts` → **evaluate** (may still serve relationship selects)
- `composables/admin/useFieldRendererErrorWatch.ts` → **delete**
- `composables/formFields/useFormFields.ts` → **delete**
- `composables/formFields/useFormFieldsMetadataWarnings.ts` → **delete**

**Metadata types (delete):**

- `types/admin/fieldMetadataMutationVariables.ts`
- `types/admin/fieldMetadataUpdate.ts`
- `types/admin/fieldLocation.ts`
- `types/admin/fieldComponent.ts`
- `types/admin/metadataCache.ts`
- `types/admin/metadataFieldOrdering.ts`
- `types/admin/buildMetadataEntry.ts`
- `types/admin/bulkEditModal.ts`
- `types/admin/fieldInputHandlers.ts`
- `types/admin/selectHandlers.ts`
- `types/admin/conditionalFieldVisibility.ts`
- `types/shapeFieldMetadata.ts`
- `types/metadataEditorProps.ts`
- `types/forms/fieldLocationDispatcher.ts`

**Metadata utilities (delete):**

- `utils/admin/resolveEntityFieldMetadataRecord.ts`
- `utils/admin/resolveBlockInstanceMetadata.ts`
- `utils/admin/metadataFieldUpdates.ts`
- `utils/admin/metadataDefaultsFromMetadata.ts`
- `utils/admin/metadataCacheResolvers.ts`
- `utils/admin/inputConfigEditor.ts`
- `utils/admin/adminMetadataSaveRequest.ts`
- `utils/admin/selectConfigFromFieldMetadata.ts`
- `utils/admin/buildMetadataEntry.ts`
- `utils/forms/fieldLocationGrouping.ts`
- `utils/forms/fieldLocationFromMetadata.ts`
- `utils/forms/fieldLocationDispatcher.ts`
- `utils/forms/fieldDisplayConfigFromMetadata.ts`
- `utils/forms/fieldComponentResolve.ts`
- `utils/forms/fieldComponentDispatcher.ts`
- `utils/forms/fieldSorting.ts`
- `utils/forms/formFieldsMetadataWarningResolution.ts`
- `utils/formFields/useFormFieldsFieldContextSetup.ts`
- `utils/formFields/formFieldsReadiness.ts`
- `utils/formFields/formFieldContextCreation.ts`
- `utils/api/adminMetadataApi.ts`

**Metadata constants (delete or reduce):**

- `constants/fieldMetadata.ts` → **delete**
- `constants/fieldMetadataEnums.ts` → **delete**
- `constants/fieldMetadataPanels.ts` → **delete**
- `constants/adminPrimitiveMetadataOptions.ts` → **delete**

**Metadata Vue components (delete except annotation editor):**

- `components/admin/metadata/AdminPrimitiveMetadataEditor.vue` → **keep for annotations**
- `components/admin/MetadataEditModal.vue` → **delete**
- `components/admin/BulkEditModal.vue` → **evaluate**
- `components/admin/PartInstanceBulkEditModal.vue` → **evaluate**
- `components/admin/InstanceBulkEditModal.vue` → **evaluate**

**Server metadata models (archive except annotations subset):**

- `server/src/db/models/admin/adminMetadata.ts` → **keep for annotations**
- `server/src/db/models/admin/adminPrimitiveMetadata.ts` → **keep for annotations**
- `server/src/db/models/admin/adminRelationshipMetadata.ts` → **evaluate**
- `server/src/db/models/admin/adminMetadataSelectOption.ts` → **keep for annotations**
- `server/src/db/models/admin/adminPrimitiveMetadataSelectOption.ts` → **keep for annotations**
- `server/src/db/models/admin/adminRelationshipMetadataSelectOption.ts` → **evaluate**

**What survives from the current generic system:**

- `components/admin/generic/collections/RelationshipCollection.vue` → **keep** (validity graph editor)
- `composables/admin/useBaseCollectionFieldCore.ts` → **keep**
- `components/admin/generic/DynamicForm.vue` → **evaluate** (may be useful for annotations)
- `components/admin/BlockInstanceCreateModal.vue` → **adapt** (create modals become domain-specific)
- `composables/admin/useBlockInstanceCreate.ts` → **adapt**

### 6.4 Acceptance checks for section 6

- Client rewrite items match the placement-type model and segment ownership model.
- Differential-role concepts are scheduled only for deletion or replacement.
- Domain-editor replacements stay aligned to the admin principles in Principles §7.

## 7. Decisions and resolved implementation positions (Principles §1, §2, §3, §4, §5, §6, §7)

> This section records implementation positions that are already settled by the locked principles so the rewrite stays execution-focused.

### 7.1 Three-property model — resolved by principles

- `composite`, `orchestrator`, and `wizardVisible` stay on `block_instances`.
- All five block types participate, including user instances.
- No combination implies another; atomic orchestrators remain valid.
- **Current user-instance convention (Principles §1, §8 invariant 6):** User block instances are **orchestrators** (drive wizard state and cascades); today none are composite and `wizardVisible` varies by type — these are **data configurations**, not hard-coded constraints for future shapes.

### 7.2 Part-instance storage and composition — resolved by principles

- Service orchestrators own base values.
- Time and price atomics own per-unit contributions.
- Event routing is relational through `event_assignments`.
- Part correlation uses lineage, not `part_shape` alone.

### 7.3 Event routing ownership — resolved by principles

- Event orchestrator owns the baseline segment graph.
- Event profiles own override segments and override assignments.
- Service orchestrators select active event packages from shape-level valid options.

### 7.4 Default routing requirement — resolved for implementation

- The implementation plan assumes explicit routing, not an implicit fallback.
- A system-provided baseline event orchestrator such as `Standard Event Schedule` should ship with default baseline data.
- Service orchestrators should always select at least one event package from the valid event options.

### 7.5 Admin-editor direction — resolved by principles

- Domain-specific editors replace generic `EntityCard` surfaces over time.
- Annotation editing remains the only metadata-driven exception in this redesign.

### 7.6 MLS and property details separation — resolved by principles

> Principle source: `ARCHITECTURE_PRINCIPLES.md` §6 (MLS enrichment architecture).

- `property_details` stays appointment-scoped input data.
- Time atomics read appointment inputs and provide duration contributions.
- MLS mappings remain split between selection rules and field-population rules.

**Data flow (Principles §6.2)** — implementation teams should keep this split visible in API and enrichment jobs:

```text
MLS API → property_field_mappings → property_details (sqft, foundation, roof, …)
                                          ↓ (read by)
                                    Time atomics (duration = rate × input)
                                          ↓ (contribute to)
                                    Part instances (per-block-instance ledger; resolved totals via PartFinalizer on client)

MLS API → property_feature_mappings → suggestedBlockInstanceIds
                                          ↓ (auto-select in wizard)
                                    Time block instances (composites + atomics)
```

## 8. Ordered implementation passes (Principles §1-§8)

> This section is execution-first. The pass order below is the rewrite order for implementation planning, not a prose outline.

### 8.1 Pass 1 — Schema alignment

Scope:

- Rename block-shape types to `time`, `price`, and `event`.
- Move three-property storage to `block_instances`.
- Add event placement columns and event-instance ownership fields.
- Drop differential-role storage and other legacy columns called out in section 2.

Acceptance checks:

- Schema plan refers to `block_instances.composite`, `block_instances.orchestrator`, and `block_instances.wizardVisible`.
- No schema step enforces `orchestrator -> composite`.
- Event routing is still modeled through `event_assignments`.

### 8.2 Pass 2 — API alignment

Scope:

- Update entity and relationship routes to accept renamed types and instance-level three-property fields.
- Scope event-instance APIs to parent event block instances.
- Keep server responses centered on configuration and raw storage rows needed by the client finalizer.

Acceptance checks:

- Route payloads and validators match the schema pass.
- No API path introduces server-side booking-total resolution.
- Event-shape APIs expose placement fields only, not differential-role concepts.

### 8.3 Pass 3 — Admin UX alignment

Scope:

- Build or adapt orchestration editors around instance-level orchestration.
- Build or adapt the atomic service convergence editor.
- Relocate the segment manager into event block-instance editing.
- Start the `EntityCard` replacement sequence with the smallest high-confidence editors first.

First execution sequence:

1. `PlacementTypeEditor`
2. `ServiceAtomicEditor`
3. Remaining domain editors
4. Segment-manager relocation work
5. Annotation-only metadata narrowing

Acceptance checks:

- Orchestration UI uses validity-constrained selection language.
- Shapes UI remains structural.
- Event editing centers on segments, placement types, and part-instance assignments.

### 8.4 Pass 4 — Booking pipeline alignment

Scope:

- Remove differential-role pipeline pieces.
- Rewrite grouping and layout helpers around event instances plus placement-type lookups.
- Preserve lineage-based part correlation and zero-out ordering.

Acceptance checks:

- Pipeline text follows Principles §4.4 resolution order.
- Placement derives from event shapes and event instances, not computed role flags.
- Finalizer remains client-side.

### 8.5 Pass 5 — Migration planning and data conversion

Scope:

- Define the data migration sequence for renamed enums, moved fields, placement data, event-instance ownership, attendee-table rename, and legacy cleanup.
- Document seed expectations for baseline placement types and baseline event-orchestrator data.

Acceptance checks:

- Migration notes describe how baseline event routing is established explicitly.
- Legacy assumptions listed in section 2 are either removed or mapped to their replacement storage.
- No migration step depends on undocumented implicit defaults.

### 8.6 Pass 6 — Rollout and cleanup

Scope:

- Roll out domain editors incrementally.
- Delete differential-role code after the replacement path is in place.
- Delete `EntityCard` and non-annotation metadata infrastructure after replacement editors are proven.
- Prepare replacement review for consolidating this document as the sole canonical implementation plan (retire older redesign filenames if any remain).

Cleanup grouping:

- Differential-role utilities and shared types
- Event-instance standalone editing remnants
- Generic `EntityCard` component tree
- Generic `EntityCard` composables and types
- Metadata infrastructure outside annotations
- Remaining event-shape display/config wiring no longer needed after placement-type conversion

Acceptance checks:

- Cleanup follows replacement, not the reverse.
- Review gate artifacts are complete before replacing the old redesign file.
- Remaining risks and open decisions are carried into the final review section.

## 9. Session drift checklist, stop conditions, replacement readiness, migration notes, risk register, and unresolved decisions (Principles §1-§8)

> Principle source: this section operationalizes the locked principles as session checks, replacement gates, and migration-risk review criteria. Formal assertions live in `ARCHITECTURE_PRINCIPLES.md` §8.

### 9.1 Drift checklist for every session

Run this checklist at the start and end of every session touching either redesign document:

- [ ] `composite`, `orchestrator`, and `wizardVisible` appear only on `block_instances`, except when explicitly naming legacy columns to remove.
- [ ] Orchestrators are described as active assignment selectors, never validity definers.
- [ ] Shape-level validity is described as the structural universe of possible options.
- [ ] User instances remain inside the three-property model.
- [ ] Event routing is described as event orchestrator baseline plus event profile overrides.
- [ ] Event assignments remain relational through `event_assignments`.
- [ ] PartFinalizer remains client-side for booking totals.
- [ ] Server language remains persist-and-validate, not resolve-and-recompute.
- [ ] Resolution order still matches Principles §4.4.
- [ ] Every section still cites the principle section(s) it depends on.

### 9.1a Invariants cross-reference (Principles §8)

The drift checklist above operationalizes the principles for session use. For formal architecture validation, every implementation pass should also confirm compliance with the **6 numbered invariants** in `ARCHITECTURE_PRINCIPLES.md` §8:

- **Invariant 1:** Domain separation — each block type writes only its own concern.
- **Invariant 2** (2a–2c): Three root properties on `block_instances`. Composite = same-shape children. Orchestrator = cross-shape active assignments. WizardVisible = booking wizard appearance.
- **Invariant 3** (3a–3g): Part instances are per-block-instance records. Base tier (service orchestrators only). Atomic services do not set base unless also orchestrators. PerUnit tier. Correlation by lineage. Event assignments are relational. PartFinalizer is client-only.
- **Invariant 4** (4a–4c): Events are data, not computation. Event shapes are placement types. Event instances are segments. Placement types are extensible.
- **Invariant 5:** `property_details` is appointment data, not configuration.
- **Invariant 6:** User instances are orchestrators.

If any invariant is violated during implementation, stop and surface a short `Decision needed` block.

### 9.2 Stop conditions

Stop the rewrite and surface a short `Decision needed` block if any of the following happen:

- The principles document contains an internal contradiction that blocks implementation planning.
- A migration step requires behavior not permitted by the principles.
- A required implementation choice cannot be derived from the principles and would create new architecture.
- The rewrite would force contradictory terminology to remain in place.

### 9.3 Replacement readiness checklist

Replacement readiness means all of the following are true:

- [ ] Principle coverage complete: every redesign section cites the principle section(s) it relies on (including §6 where MLS applies, §8 for invariants cross-check in section 9.1a).
- [ ] Contradiction scan passed: no contradictory terminology remains.
- [ ] Legacy assumptions removed: shape-level three-property language, validity-defining orchestrators, service-default or event-atomic ownership drift, and server-side resolution drift are gone.
- [ ] Ordered implementation passes are complete for schema, API, admin UX, booking pipeline, migration, and rollout.
- [ ] Migration notes are present.
- [ ] Risk register is present.
- [ ] Unresolved decisions are listed, or `none` is stated explicitly.
- [ ] Manual review gate is complete before replacing `DOMAIN_ARCHITECTURE_REDESIGN.md`.

### 9.4 Review gate before replacement

Do not replace the original redesign document until all four checks pass:

1. Coverage review
   - Every section has an explicit principles citation.
   - The document ends with migration notes, a risk register, and unresolved decisions.
2. Terminology review
   - No contradictory legacy terms remain.
   - Orchestrator, validity, event baseline, and client-finalizer terminology are consistent throughout.
3. Structural review
   - Ordered implementation passes are actionable.
   - Acceptance checks are present section by section.
4. Final human review
   - This plan is read end-to-end beside the locked principles before any replacement action.

### 9.5 Migration notes

- Migrate type names first so later sections can use `time`, `price`, and `event` consistently.
- Move three-property persistence to `block_instances` before admin or API rewrites assume the new storage boundary.
- Establish event placement data and event-instance ownership before rewriting routing UX or booking layout code.
- Preserve relational event routing during migration; do not introduce temporary scalar event fields on part instances.
- Seed or confirm baseline placement types and baseline event-orchestrator data before rollout so explicit default routing exists from the beginning.

### 9.6 Risk register

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Instance-vs-shape property drift returns during implementation | It would directly contradict the locked principles and reintroduce the biggest known rewrite error. | Run the session drift checklist on every session and reject shape-level three-property changes. |
| Event-routing language drifts back toward differential roles | It would create contradictory mental models across admin, booking, and migration work. | Delete role-based language and anchor all routing text to event shapes, event instances, and `event_assignments`. |
| Server-side resolution drift reappears in API planning | It would create a second booking calculator and break the locked client-finalizer contract. | Keep API scope limited to configuration, raw rows, and persistence of the submitted payload. |
| Cleanup happens before replacement editors are stable | It would create delivery risk and make rollback harder. | Enforce rollout order: replace first, then delete. |
| Migration sequence leaves default routing implicit | It would conflict with the explicit baseline event-orchestrator model. | Include baseline event-orchestrator seed/data checks in the migration pass. |

### 9.7 Unresolved decisions

None at the time of this rewrite.
