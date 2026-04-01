# Domain architecture redesign — implementation plan

> **Status:** Implementation plan — what to build, adapt, and delete.
> **Principles:** [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md) — the source of truth for architectural rules. This plan references those principles by section number.

---

## 1. The idea

<!-- EXTRACTED to ARCHITECTURE_PRINCIPLES.md §1 (Domain model) and §2 (Three-property model) -->
> **Principle content extracted to [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md) §1, §2, §3.** This section retains only implementation-specific details (rename mappings, "Renamed?" column).

### 1.1 Block type domain map

> See [ARCHITECTURE_PRINCIPLES.md §1](ARCHITECTURE_PRINCIPLES.md#1-domain-model) for the domain model and [§2](ARCHITECTURE_PRINCIPLES.md#2-three-property-model) for the three-property model.

**Rename mappings** (implementation detail):

| Type | Renamed from |
| --- | --- |
| `time` | `property` |
| `price` | `coupon` |
| `event` | `option` |

### 1.2 What lives on part instances

<!-- EXTRACTED to ARCHITECTURE_PRINCIPLES.md §4 (Part instances as value ledger) -->
> See [ARCHITECTURE_PRINCIPLES.md §4](ARCHITECTURE_PRINCIPLES.md#4-part-instances-as-value-ledger) for the principle. Below is the **migration mapping** (current → target fields):

| Concern | Current fields on part instances | Target additions/relocations |
| --- | --- | --- |
| **Time assignment** | `baseTime`, `rateOverBaseTime` | `defaultTime` (from `rateOverBaseTime`) = default/min from atomic service; `timePerUnit` = resolved by **time** block instance; `zeroOutTime` (former independent property)|
| **Price assignment** | `baseFee`, `rateOverBaseFee` | `defaultFee` (from `rateOverBaseFee`) = default/min from atomic service; `feePerUnit` = resolved by **price** block instance; `zeroOutFee` (former independent property) |
| **Event assignment** | _(none — today this is on event_assignments / differentialRole)_ | `defaultEvent` = default from atomic service; `eventOverride` = resolved by validated selections on **event** block instance |

### 1.3 Universal composite / atomic model

<!-- EXTRACTED to ARCHITECTURE_PRINCIPLES.md §3 (Layering: shape → block instance → part instance) -->
> See [ARCHITECTURE_PRINCIPLES.md §3](ARCHITECTURE_PRINCIPLES.md#3-layering-shape--block-instance--part-instance) for the layering model, Mermaid diagram, and ownership descriptions.

### 1.4 Placement-slot model (event shapes as placement types)

<!-- EXTRACTED to ARCHITECTURE_PRINCIPLES.md §5 (Placement-slot model) -->
> See [ARCHITECTURE_PRINCIPLES.md §5](ARCHITECTURE_PRINCIPLES.md#5-placement-slot-model) for the placement-slot model, default types, segment ownership, and routing-is-data principle.

### 1.5 Three independent shape properties: composite, orchestrator, wizardVisible

<!-- EXTRACTED to ARCHITECTURE_PRINCIPLES.md §2 (Three-property model) -->
> See [ARCHITECTURE_PRINCIPLES.md §2](ARCHITECTURE_PRINCIPLES.md#2-three-property-model) for the full three-property model, 2×2 grid, wizardVisible examples, and rules.

**Legacy column mapping** (implementation detail — what the new properties replace):

| New property | Replaces |
| --- | --- |
| `block_shapes.composite` | `block_instances.composite` (moved to shape level) |
| `block_shapes.orchestrator` | `block_shapes.isStateControl` (partially) |
| `block_shapes.wizardVisible` | `block_instances.bookingMode` (simplified from ternary to boolean on shape) |

**Columns dropped:** `block_shapes.composable`, `block_shapes.isStateControl`, `block_shapes.canHaveParts`.

---

## 2. Model changes (DB / Sequelize)

### 2.1 Rename block shape type enum

| Old | New | Migration |
| --- | --- | --- |
| `property` | `time` | `ALTER TYPE` + `UPDATE block_shapes SET type = 'time' WHERE type = 'property'` |
| `coupon` | `price` | `ALTER TYPE` + `UPDATE block_shapes SET type = 'price' WHERE type = 'coupon'` |
| `option` | `event` | `ALTER TYPE` + `UPDATE block_shapes SET type = 'event' WHERE type = 'option'` |

Touches: `block_shapes.type` enum, [server/src/db/models/admin/block_shape.ts](server/src/db/models/admin/block_shape.ts), [client/src/constants/blockShapeTypes.ts](client/src/constants/blockShapeTypes.ts), all code that switches on the old string values.

### 2.2 Tables that survive (repurposed, not dropped)

Event tables are **kept** and repurposed. The big structural deletion from the earlier draft is replaced by a **data migration**.

| Table | Current purpose | New purpose | Migration |
| --- | --- | --- | --- |
| `event_shapes` | Ad hoc shape per scheduling profile | **Admin-managed placement types** with structured `placement_kind` + `anchor_edge` columns | Migrate existing rows to set `placement_kind` and `anchor_edge`. Seed 7 default rows (Primary, FrontSecondary, BackSecondary, FrontMarginal, BackMarginal, FrontFloating, BackFloating). Keep full CRUD — admins can add, rename, or remove placement types. |
| `event_instances` | Named segments under event shapes | **Named segments owned by event block instances** | Add `parent_block_instance_id` FK → `block_instances.id` (the event block instance). Re-point `event_shape_ref` to one of the 7 canonical placement shapes. |
| `event_assignments` | Links event instances → part instances | **Unchanged conceptually** — routing edges from segments to parts | No structural change. Data migration: ensure all event assignments point at valid event instances under the new model. |
| `event_shape_attendees` | Invite/calendar config per event shape | **Renamed → `event_instance_attendees`** — attendees are per-segment, not per-placement-slot | Rename table. Replace `event_shape_id` FK with `event_instance_id` FK. Keep `user_type_block_instance_id` FK (references user block instances). Migrate existing attendee rows to reference event instances. See §7.7. |
| `valid_event_cascades` | Admin graph: which event shapes are valid for which block shapes | **Stays** — controls which event block shapes (type `event`) can cascade from which service shapes | Rename for clarity if desired; data stays the same. |
| `property_feature_mappings` | Maps MLS data source features → block instances (auto-selects block instances when MLS data matches) | **Re-scoped to time domain.** `block_instance_id` FK now targets **time block instances** — composites like "Single-Family Home" or atomics like "Deck". MLS enrichment auto-selects the right property type package and add-ons based on listing data. | Update existing rows: re-point `block_instance_id` values to time block instances after `property→time` rename. No structural schema change — FK already targets `block_instances`. |
| `property_field_mappings` | Maps MLS data source fields → `property_details` columns (populates sqft, bedrooms, foundation, etc.) | **Stays as-is.** Writes to the appointment-scoped `property_details` table. Time atomics read from `property_details` to derive duration contributions. | No schema change. |
| `property_details` | Flat property characteristics for a property version (sqft, bedrooms, bathrooms, foundation, additional units, MLS number) | **Stays as appointment-scoped input surface.** MLS enrichment and booking wizard write here; time atomics consume this data. See §7.8. | No schema change. |

### 2.3 Columns to drop

| Table.column | Why |
| --- | --- |
| `block_instances.differential_event_role_overrides` | Routing is now expressed by event instances pointing at placement-slot shapes — no JSON override blob needed |
| `block_instances.composite` | Moved to `block_shapes.composite` (shape-level, not instance-level). See §1.5. |
| `block_instances.bookingMode` | Replaced by `block_shapes.wizardVisible` (simplified from ternary `true/false/override` to boolean on shape). See §1.5. |
| `block_shapes.composable` | Replaced by `block_shapes.composite`. Legacy flexibility scaffolding. |
| `block_shapes.isStateControl` | Replaced by `block_shapes.orchestrator` + `block_shapes.wizardVisible`. See §1.5. |
| `block_shapes.canHaveParts` | Derivable: atomic service shapes can have parts. No longer an independent flag — the combination of `type = 'service'` + `composite = false` implies can-have-parts. |
| `event_shapes.differential_role` | Replaced by the structured `placement_kind` + `anchor_edge` columns. The shape **is** the placement type. |
| `event_shapes.include_reschedule_link` | Moves to event instances (per-segment, not per-placement-type). See §2.4. |
| `event_shapes.include_cancel_link` | Moves to event instances (per-segment, not per-placement-type). See §2.4. |

### 2.4 Columns / tables to add or adapt

| Item | Notes |
| --- | --- |
| **`block_shapes.composite`** (new boolean, default `false`) | `true` = instances of this shape are structural containers (own child block instances via validity graph). `false` = atomic. Moves from instance-level to shape-level — a shape is inherently composite or atomic, not per-instance. See §1.5. |
| **`block_shapes.orchestrator`** (new boolean, default `false`) | `true` = this shape is the top-level entry point for its block type. Orchestrators define root validity graphs. Implies `composite = true` (enforced). See §1.5. |
| **`block_shapes.wizardVisible`** (new boolean, default `false`) | `true` = instances appear in the booking wizard for user selection. Independent of composite/orchestrator. See §1.5. |
| **`event_instances.parent_block_instance_id`** (new FK) | Links each event instance (named segment) to the event block instance that owns it. This is the key structural addition — it ties segments to the routing profile. |
| **`event_shapes.placement_kind`** + **`event_shapes.anchor_edge`** (structured columns, required) | Defines the time-axis layout behavior for this placement type. `placement_kind` ∈ `{primary, secondary, marginal, floating}`, `anchor_edge` ∈ `{start, end, null}`. The pipeline reads these columns to decide how to position each segment — adding a new event shape with a valid `placement_kind`/`anchor_edge` combination extends the layout engine without code changes. |
| **`event_instances.location_type`** (new enum column) | `on_site \| off_site \| remote \| virtual`. Structured location semantics so the pipeline can make location-based decisions (drive time, overlap rules, constraint applicability) without parsing `locationTemplate`. Deprecates the `onSite` boolean that exists elsewhere. |
| **`event_instances.location_place_id`** (new nullable column) | Google Places `placeId` for the segment's location. Populated when `location_type = 'off_site'` and the admin picks a specific off-site location. Uses the same placeId infrastructure as `availability_settings.default_location_place_id` and the Places API integration on the Controls tab (`PlacesTimezonePanel`, `useDefaultLocation`). Nullable — on-site segments derive location from the appointment property; remote/virtual segments have no physical location. |
| **`event_instances.location_address`** (new nullable column) | Resolved address string for the placeId (same pattern as `availability_settings.default_location_address`). |
| **`event_instances.location_lat`** + **`location_lng`** (new nullable columns) | Coordinates for drive-time matrix integration when `location_type = 'off_site'`. Same pattern as `availability_settings.default_location_lat/lng`. |
| **`event_instances.include_reschedule_link`** (migrated from event_shapes) | Per-segment control: "Primary" might include reschedule/cancel links, "EarlyArrival" might not. |
| **`event_instances.include_cancel_link`** (migrated from event_shapes) | Same — per-segment. |
| **`event_instance_attendees`** (renamed from `event_shape_attendees`) | Through-table: `event_instance_id` FK → `event_instances.id`, `user_type_block_instance_id` FK → `block_instances.id` (user block instances). Each segment gets its own attendee list. FK targets user block instances — the attendee type is determined by which user block shape the block instance belongs to (inspector, client, agent, etc.). See §7.7. |

### 2.5 Entity key changes

[server/src/constants/entities.ts](server/src/constants/entities.ts) currently lists `eventShape` and `eventInstance` as global entity keys. These **stay** — event shapes and event instances remain first-class entities with their own CRUD.

However, their admin surface changes:
- **Event shapes** remain fully editable (create/rename/delete). They ship with 7 default rows but can be extended. The admin defines placement types; the pipeline reads `placement_kind` + `anchor_edge` from whatever shapes exist.
- **Event instances** are created/edited in the context of an event block instance, not standalone

---

## 3. Admin page redesign

### 3.1 Current structure (to change)

```
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

### 3.2 What to remove or adapt in admin

| Current artifact | Action | Why |
| --- | --- | --- |
| **Calibration tab** (`FeeCalibrationPanel`, `useCalibrationChart`) | **Remove** | Fee calibration becomes a concern of **price** block instances editing part fee values directly; a chart is nice-to-have but not structural |
| **Events tab** on Instances (`EventInstancesSection` and children) | **Relocate** — move into the event block instance editor as an inline segment manager | Event instances are no longer standalone; they live under the event block instance that owns them. The existing components can be adapted to work in that context. |
| **Event Shapes sub-tab** on Shapes (`ShapesTabEventPanel`) | **Adapt** | Event shapes are now placement types with `placement_kind` + `anchor_edge`. The sub-tab becomes a placement-type editor: admin can create, rename, reorder, or remove placement types. Simpler than today (fewer fields: name, placement_kind dropdown, anchor_edge dropdown, active toggle). |
| **Metadata system + EntityCard** | **Deprecate** — replace with domain-specific editors using Vuetify directly | The domain has crystallized; every entity type has known fields. The 160-file EntityCard + metadata pipeline is indirection without flexibility benefit. Keep metadata only for annotations. See §3.4 for full decision, §6.8 for deletion inventory. |
| **Differential role matrix** on block instance forms | **Remove** | Replaced by event instance → placement-slot shape assignment on event block instances |

### 3.3 Target admin structure

<!-- PRINCIPLE EXTRACTED to ARCHITECTURE_PRINCIPLES.md §7 (Admin architecture principles) — two-mode admin, convergence point, metadata deprecation -->
> See [ARCHITECTURE_PRINCIPLES.md §7](ARCHITECTURE_PRINCIPLES.md#7-admin-architecture-principles) for the principles behind this structure. Below is the **implementation target** (component tree, UX details).

```
AdminPanel
├── Orchestration tab (orchestrator shapes only — infrequent setup)
│   ├── Service packages (orchestrator=true services)
│   │   └── [e.g. "Buyer's Inspection Package"] → validity editor:
│   │       ├── Which atomic services: Roof, Exterior, Interior, ...
│   │       ├── Which property types (time): Single-Family, Condo, ...
│   │       ├── Which fee packages (price): Standard Fees, Rush Surcharge, ...
│   │       └── Which routing packages (event): Standard, Minimize Time, ...
│   ├── Property types (orchestrator=true time)
│   │   └── [e.g. "Single-Family Home"] → which characteristics apply:
│   │       Square Footage ✓, Foundation ✓, Roof Type ✓, HVAC ✓
│   ├── Fee packages (orchestrator=true price)
│   │   └── [e.g. "Standard Fee Schedule"] → which fee drivers apply
│   └── Routing packages (orchestrator=true event)
│       └── [e.g. "Routing Options"] → which routing profiles apply
│
├── Services tab (atomic layer — the work hub)
│   └── [per atomic service shape] → atomic service editor:
│       ├── Part instances (the work items)
│       └── Per part instance, inline domain columns:
│           ├── Time:  per characteristic (sqft: 12 min/1000, roof: +15 min complex)
│           ├── Fee:   per driver (base: $200, per-unit: $0.08/sqft)
│           └── Event: segment assignment (→ Early Arrival / Primary / OffSite)
│       (Admin sees and edits all three domains without leaving this view)
│
├── Shapes tab (structural — name, type, ordering)
│   ├── Block Shapes (name, type, composite / orchestrator / wizardVisible, ordering)
│   ├── Part Shapes (name, ordering)
│   ├── Annotation Shapes (name, content schema)
│   └── Event Shapes (placement-type editor: name, placement_kind, anchor_edge)
├── Appointments tab → DataManagementTab (unchanged)
└── Controls tab → BusinessControlsTab (constraints, calendar, availability)
```

**Key UX changes:**

- **The atomic service editor is the primary admin surface.** The admin opens "Roof Inspection" and sees every part instance with its time rate, fee rate, and event segment assignment in one view. All three downstream domains converge here — no tab-hopping to time/price/event block editors.
- **Orchestration is a separate, infrequent concern.** Orchestrator shapes (where `orchestrator = true`) define "what's available" — which atomics, which profiles, which cascades. This is setup work, done once per service package, not touched daily. Non-orchestrator composites like "Additional Units" or "Deck" are add-on packages nested under orchestrators.
- **Domain values are edited inline on the atomic service**, but they are still **stored on** their respective domain block instances (time, price, event). The inline editor is a projection — when the admin changes a time rate on a part, the write goes to the atomic time block instance. This preserves the clean data model while eliminating the UX friction.
- **The segment manager (§3.5) lives inside the event column** of the atomic service editor. When the admin clicks an event assignment, it expands to the segment manager for that event profile.
- **Shapes tab stays purely structural** — event shapes are a placement-type editor. No validation logic on shapes.

### 3.5 Segment manager UX (event block instance editor)

The segment manager is the primary admin interface for event routing. It replaces the old Events tab, the differential role matrix, and the event instance standalone editor. The core principle: **the admin assigns concrete part instances to named segments with known placement slots**.

By the time an event block instance is being configured, all atomic services and their part instances exist. The admin sees the full inventory and assigns each part instance to exactly one segment.

**Layout:**

```
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

**Behavior:**

- **Left panel** shows all part instances from valid atomic services, grouped by their source block instance. Each part instance displays its name and (if time rates are set) its duration. A part instance that has been assigned to a segment shows a checkmark or is grayed out.
- **Right panel** shows named segments (event instances). Each segment has a **placement-type dropdown** (populated from event shapes) and a list of assigned part instances (event_assignments).
- **Assignment** is drag-and-drop or checkbox-select from left to right. Each part instance can belong to exactly one segment.
- **Completeness indicator** at the bottom of the left panel: "⚠ N unassigned" warns the admin when part instances haven't been routed. The UI can enforce that all parts are assigned before saving — an unrouted part instance would have no segment and no calendar placement.
- **Default case:** The "Standard" event block instance has one segment ("Inspection", placement = Primary) with all part instances assigned. The admin sees the full list on the right in one group.

**Why this works:** The natural granularity of atomic services gives you routing granularity for free. "Roof Inspection → Data Collection" and "Interior Inspection → Data Collection" are **already distinct part instances** on distinct block instances — the admin doesn't need to pre-split part shapes to route subsets. The segment manager just assigns existing part instances to segments.

### 3.4 EntityCard and metadata system deprecation — DECIDED

<!-- PRINCIPLE EXTRACTED to ARCHITECTURE_PRINCIPLES.md §7.1 + §7.4 — domain-specific editors replace EntityCard, metadata survives for annotations only -->
> See [ARCHITECTURE_PRINCIPLES.md §7.1](ARCHITECTURE_PRINCIPLES.md#71-domain-specific-editors-replace-entitycard) for the principle. Below retains the **implementation details**: what the metadata system does, the replacement editors, migration strategy, and deletion inventory.

**Decision:** Ratified. Domain-specific editors replace EntityCard. Metadata survives for annotations only. Principle in ARCHITECTURE_PRINCIPLES.md §7.

**What the metadata system currently does (and why it's overkill):**

The system stores per-field rendering configuration in 3 DB tables (`AdminMetadata`, `AdminPrimitiveMetadata`, `AdminRelationshipMetadata` + select option children) with **125 seed rows**. Each row specifies:
- `visibility` — titleRow, expandedDirect, expandedPanel, hidden, notConfigured
- `layout` — inline or stacked
- `renderAs` — text, number, select, multiselect, statusButton, iconSelect, relationshipCollection
- `panel` — none, parts, relationships, annotations, events, composition
- `displayOrder`, `label`, `isRequired`, `bulkEdit`, `statusButtonColor`
- `inputConfig` — 13 normalized `ic*` columns controlling select targets, grouping, filtering paths

EntityCard consumes this through a **14-composable pipeline**: `useEntityCardMetadata` → `useEntityCardFormSetup` → `useEntityCardFieldConfiguration` → `useEntityCardFieldContextAndVisibility` → `useFormFields` → `useFieldComponent` → `FieldRenderer`. Total surface area: **~69 files for EntityCard, ~95 files for metadata** — approximately 160 files of indirection to render known forms.

In practice, no one ever changes `squareFootage` from `number` to `select` at runtime, or moves `name` from titleRow to hidden. The metadata rows are effectively static seed data.

**The replacement: domain-specific editors using Vuetify directly**

| New editor | Entity scope | Implementation |
| --- | --- | --- |
| `ServiceCompositeEditor` | Composite service block instances | VCard + VForm: name field + RelationshipCollection for validity graph (which atomics, which downstream profiles) |
| `ServiceAtomicEditor` | Atomic service block instances | VCard + **VDataTable** of part instances with inline domain columns (time/price/event). The atomic service hub. |
| `TimeCompositeEditor` | Composite time block instances | VCard + VForm: name + RelationshipCollection (which characteristics) |
| `TimeAtomicEditor` | Atomic time block instances | VCard + VForm: name, property characteristic config, rate per applicable part |
| `PriceCompositeEditor` | Composite price block instances | VCard + VForm: name + RelationshipCollection (which fee drivers) |
| `PriceAtomicEditor` | Atomic price block instances | VCard + VForm: name, fee driver config, fee component per applicable part |
| `EventCompositeEditor` | Composite event block instances | VCard + VForm: name + RelationshipCollection (which routing profiles) |
| `SegmentEditor` | Event instances (named segments) | VCard + VForm: name, placement type dropdown, location fields, attendees, calendar props |
| `PlacementTypeEditor` | Event shapes | **VDataTable**: name, placement_kind, anchor_edge, active. Simple CRUD grid. |
| `ShapeEditor` | Block/part/annotation shapes | **VDataTable** or VList: name, type, composite/orchestrator/wizardVisible, ordering |
| `AnnotationEditor` | Annotation instances | **Metadata-driven** — this is the one genuinely dynamic entity. Keep metadata for annotations. |

Each editor is a straightforward VCard + VForm (or VDataTable) with **known fields hardcoded in the template**. No metadata fetch, no field context resolution, no display order computation. Vuetify handles validation, responsive layout, and inline editing natively.

**What survives:**

- **RelationshipCollection** — the validity graph UI is genuinely generic (through-table editor). Keep it as a reusable component for orchestrator validity editors.
- **Metadata for annotations only** — annotation content schemas are truly admin-defined and dynamic. Keep `AdminPrimitiveMetadata` for annotations; delete or archive it for everything else.
- **VDataTable patterns** — already used on Appointments, Properties, Users tabs. Extend to Shapes tab, placement types, and the atomic service hub's part instance grid.
- **Vuexy form wrappers** (`AppTextField`, `AppSelect`, `AppAutocomplete`) — thin wrappers with consistent styling. Use directly in domain editors.
- **Save/undo/delete patterns** — the CRUD action composables (`useEntityCardSaveAndActions`, `entityCardActionsPersistence`) can be simplified into a shared `useEntitySave` composable that domain editors share.

**What gets deleted:**

See §6.8 for the full inventory. Summary: ~120+ files of EntityCard composables, types, utilities, and metadata infrastructure. The 14-composable rendering pipeline collapses to direct Vuetify component usage in each domain editor.

**Migration strategy:**

1. Build the first domain editor (`PlacementTypeEditor` — smallest, known fields, VDataTable) as a proof of concept alongside the existing EntityCard
2. Build `ServiceAtomicEditor` with the VDataTable part instance grid — this is the biggest win and proves the pattern at scale
3. Convert remaining entity types one by one, deleting EntityCard usages as each is replaced
4. Once all entity types have domain editors, delete EntityCard and the metadata pipeline
5. Archive `AdminMetadata` / `AdminPrimitiveMetadata` tables — keep only what annotations need

**What this saves:**

- ~120+ files → ~15-20 focused, readable editors
- Composable chain depth: 5-6 layers → 1-2
- 3 DB tables + 125 seed rows + server routes → annotations-only subset
- Debugging: look at `TimeAtomicEditor.vue` instead of tracing through 14 composables and a metadata database

---

## 4. Booking pipeline changes

### 4.1 Current finalizer chain (to simplify)

```
buildAppointmentShape (appointmentSlotBuilder.ts)
  → createBlockFinals (blockFinalizer.ts)
      → createPartFinals per block (partFinalizer.ts / PartFinal.ts)
  → buildEventAssignmentsByPartShape (crawls event_assignments → event_instances → event_shapes)
  → enrichBlockFinalsWithDifferentialRoles (patches PartFinal.major/minor/minimizer from event shape roles)
  → calculateSlotShape (partFinalizerSlotShape.ts)
      → accumulateRawDurationsFromBlockFinals (partFinalizerSlotShapeHelpers.ts)
      → buildRoundedDurationMap
      → buildEventFinalsList
      → computeDifferentialOffsetsFromMaps
  → applyShapeToTime (creates time ranges per event name)
  → perspectiveResolver (derives major/minor/nonDifferential views)
  → minimizerSchedulingBounds (floating segment windows)
```

### 4.2 What changes

| Current step | Action | Why |
| --- | --- | --- |
| `buildEventAssignmentsByPartShape` | **Simplify** | Still reads `event_assignments`, but the join is simpler: event_assignment → event_instance → event_shape (placement slot). No differential role resolution — the shape **is** the placement. |
| `enrichBlockFinalsWithDifferentialRoles` | **Delete** | No ternary major/minor/minimizer on PartFinal; each part's placement is determined by which event instance it's assigned to, and that event instance's shape ref. |
| `resolvePartShapeDifferentialFlags` | **Delete** | Same reason |
| `effectiveDifferentialRole` / `differentialRoleUtils` | **Delete** | No role enum. Placement is a property of the event shape (`placement_kind` + `anchor_edge` columns). |
| `computeDifferentialOffsetsFromMaps` | **Replace** with segment-based duration derivation | Input: part durations grouped by event instance. Output: `SlotPlacementResult` keyed by placement kind. Simpler because placement kind is a direct lookup from event_shape, not a computed role. |
| `perspectiveResolver` | **Rewrite** | Switch from major/minor event **name** lookups to placement **kind** lookups (primary, secondary, marginal, floating) derived from event shape refs. |
| `minimizerEventShapes` / `minimizerSchedulingBounds` | **Rewrite** | Query event instances whose event_shape_ref has `placement_kind = 'floating'` instead of filtering by differential role. |
| `PartFinal.major / .minor / .minimizer` | **Remove** fields | Part finals carry `partShape`, durations, fees, `zeroOutPart`, source instances. Placement is on the event instance's shape, not on the part. |

### 4.3 Target pipeline sketch

The critical simplification: **routing is a data read, not a calculation**. The admin has already assigned parts to named segments with known placement slots.

```
buildAppointmentShape (simplified)
  → createBlockFinals (unchanged — aggregate parts per block)
  → readEventGraph:
      reads: event_assignments → event_instances (with event_shape_ref)
      output: Map<eventInstanceId, { name, placementKind, anchorEdge, partInstanceIds[] }>
      NOTE: this is a data read, not a computation
  → deriveSegmentDurations:
      input: event graph + part durations from block finals
      output: Map<eventInstanceId, { totalDuration, placementKind, anchorEdge }>
  → layoutSegmentsOnTimeAxis:
      input: segment durations + placement kinds
      output: SlotPlacementResult (offsets and spans per segment, total appointment duration)
      NOTE: pure geometry — placement kind dictates layout rules
  → applyShapeToTime (adapted to use SlotPlacementResult instead of event-name maps)
  → derivePerspective (adapted to use placement kinds for calendar-view grouping)
  → resolveFloatingWindows (adapted: segments with kind=floating + constraint window)
```

The first two steps of the old pipeline (`buildEventAssignmentsByPartShape` + `enrichBlockFinalsWithDifferentialRoles`) collapse into a single **data read** (`readEventGraph`). The three-step calculation (`resolveEventRouting` → `deriveSegmentDurations` → `buildSlotPlacement`) simplifies further because placement is pre-declared on the event shape, not derived from a `DifferentialPlacement` JSON blob.

### 4.4 What stays unchanged

- `createBlockFinals` / `createPartFinals` — aggregation of part instances into totals per part shape per block. These are sound.
- `filterZeroedParts` / `filterZeroedBlocks` — zero-out stays; apply **after** per-part numeric resolution and base floor so excluded parts drop out of rollups last (ARCHITECTURE_PRINCIPLES §4.4 step 5, §4.8).
- `applyShapeToTime` conceptually stays (map shape to clock times) but its input type changes.
- Constraint pipeline (`Constraint[]`, `ConstraintCheckResult`, slot computation) — interface unchanged; inputs become segment-based durations.

### 4.5 Correlation, zero-out order, client vs server

Aligned with **ARCHITECTURE_PRINCIPLES** §4.2.1, §4.3–§4.8, invariant 3d–3f.

| Topic | Decision |
| --- | --- |
| **Correlation** | **Lineage** — bucket part rows by atomic service / appointment line using the **same cascade graph** the wizard uses. Do not key joins on `part_shape` alone when collisions are possible. **Do not** introduce `resolution_group_id` (single column is too rigid; arrays reintroduce complexity). |
| **Zero-out** | **Last numeric step per part** — after `base + perUnit` math and **base floor**, then zero-out forces zero contribution (PEMDAS-style: final “Z” after the rest). **Admin:** parts stay visible in admin grids; only booking totals/rollups drop them. |
| **Server** | **No server-side time/fee resolution for booking.** APIs return configuration and raw rows; the **client PartFinalizer** computes resolved numbers; **submit** persists a full appointment payload. Avoid a second calculator on the server unless a future non-booking feature explicitly requires it. |
| **Seed / diagram** | Block instance **names** in seed data should not duplicate the **same label** for two different roles (orchestrator vs composite package). The architecture doc Mermaid uses distinct examples (`Inspection_Fee_Context` vs `Standard_Add_On_Fee_Bundle`). |

---

## 5. Server route / API changes

### 5.1 Routes to adapt

| Route / module | Change |
| --- | --- |
| Entity CRUD for `eventShape` | **Stays fully CRUD**. Adapt to enforce `placement_kind` + `anchor_edge` as required fields on create/update. Validate that `placement_kind` is one of the recognized layout kinds. Protect against deleting a shape that is referenced by event instances (FK constraint). |
| Entity CRUD for `eventInstance` | Adapt to require `parent_block_instance_id`. Event instances are created/edited in the context of an event block instance, not standalone. |
| `event-instance-preview` router and schema | Adapt to new model (segment under event block instance) or simplify to a segment duration preview. |
| Entity CRUD for `blockShape` / `blockInstance` | Accept new type values (`time`, `price`, `event`); enforce composite/atomic constraints on service shapes. |
| Relationship CRUD for `eventAssignments` | Stays — event_assignments table is unchanged. Validate that referenced event instances belong to the correct event block instance. |
| Relationship CRUD for `validEventCascades` | Stays — controls which event block shapes are valid for which service shapes. |
| Admin-metadata routes scoped to `eventShape` | Simplify — event shapes have a small, known field set (`name`, `placement_kind`, `anchor_edge`, `active`, `orderIndex`). Metadata may still be useful for custom labels. |
| Appointment persistence (`appointmentCrudRouter`, `appointmentPersistenceHelpers`) | Store event block instance id on the appointment. Event instances (segments) are reachable via the event block instance → event instances join. |
| Google Calendar event creation (`buildCalendarEventResource`, `eventCreationService`) | Read event instance for segment identity, event shape for placement/invite policy. Chain: appointment → event block instance → event instances → event shapes. |

### 5.2 Routes to adapt or remove

| Route / module | Action | Why |
| --- | --- | --- |
| Relationship handlers for `attendeeAssignments` keyed to `event_shape_attendees` | **Adapt** — re-point to `event_instance_attendees` | Attendees are now per-segment (event instance), not per-placement-slot (event shape). Same CRUD pattern, different FK target. |
| Admin-metadata CRUD for `eventShape` entity type | **Simplify** | Event shapes have few fields; dynamic metadata is low-value but harmless to keep. |

---

## 6. Client code changes

### 6.1 Admin views / components to delete

- `views/admin/tabs/components/ShapesTabEventPanel.vue` — **adapt** to become a placement-type editor (name, `placement_kind` dropdown, `anchor_edge` dropdown, active toggle). Simpler than today — fewer fields, no differential role.
- `views/admin/tabs/components/FeeCalibrationPanel.vue` — fee calibration moves to price block instances

### 6.2 Admin views / components to adapt (not delete)

These currently support event instances as standalone entities. They are **relocated** into the event block instance editor as an inline segment manager:

- `EventInstancesSection.vue` → becomes the segment list inside an event block instance card
- `EventInstanceEditor.vue` → becomes the segment editor (name + placement-slot dropdown + part assignment list)
- `EventInstanceBuilderBody.vue` → adapted for the new segment context
- `EventInstanceListItem.vue` → adapted for inline display under event block instance
- `EventInstanceTemplateFields.vue` → adapted (fields scoped to segment: name, event_shape_ref dropdown)
- `EventInstanceVariableChips.vue` → evaluate: may still be useful for showing segment properties
- `EventInstancePreviewPanel.vue` → adapted: preview the segment layout (placement visualization)
- `EventInstanceCalendarSettings.vue` → adapted: invite/calendar settings per segment

### 6.3 Admin composables to adapt

- `useEventInstanceBuilder.ts` → adapt to work in event block instance context (receives `parentBlockInstanceId`)
- `useEventInstancesSection.ts` → adapt: scoped to segments under one event block instance
- `useEventTemplatePreview.ts` → adapt: preview derives from placement-slot shape + assigned parts
- `useCalibrationChart.ts` → **delete** (fee calibration removed)

### 6.4 Booking utils — differential role pipeline (delete)

- `utils/admin/differentialRoleMatrixRows.ts` → **delete**
- `utils/eventAttendeeUtils.ts` → **delete** (role resolution from event shapes)

### 6.5 Booking utils — pipeline steps (rewrite)

- `utils/booking/perspectiveResolver.ts` → **rewrite** to use placement kind from event shape refs
- `utils/booking/minimizerEventShapes.ts` → **rewrite** to query segments with `placement_kind = 'floating'`
- `utils/booking/minimizerSchedulingBounds.ts` → **rewrite** to derive windows from floating segments
- `utils/booking/partFinalizerSlotShapeHelpers.ts` → **rewrite** `accumulateRawDurationsFromBlockFinals` and `computeDifferentialOffsetsFromMaps` to use segment grouping

### 6.6 Shared types / utils (differential role — delete)

- `shared/types/differentialRole.ts` → **delete** (no more `DifferentialRole` / `DifferentialRoleStorage` enums)
- `shared/utils/differentialRoleUtils.ts` → **delete**
- `shared/constants/differentialRoleMappings.ts` → **delete**

### 6.7 Configs / display (adapt)

- `configs/field/display/appliedDisplay/eventShapeDisplays.ts` → **simplify** (event shapes have fewer fields: name, placement_kind, anchor_edge, active, orderIndex)
- References in `selectableDisplayConfigTypes.ts` keyed to `eventShape` / `eventInstance` → **adapt** (entities still exist but are scoped differently)

### 6.8 EntityCard + metadata pipeline (deprecate — replaced by domain editors per §3.4)

**EntityCard component tree (delete once all domain editors exist):**

- `components/admin/generic/EntityCard.vue`
- `components/admin/generic/EntityCardContent.vue`
- `components/admin/generic/EntityCardSubPanels.vue`
- `components/admin/generic/EntityCardPrimaryTitleRow.vue`
- `components/admin/generic/EntityCardPartsTotals.vue`
- `components/admin/generic/EntityCardFeePreview.vue`
- `components/admin/generic/EntityFormContent.vue`
- `components/admin/generic/entityCardConstants.ts`
- `components/admin/generic/StatusButton.vue`

**EntityCard field renderers (replace with direct Vuetify/Vuexy inputs in domain editors):**

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

**EntityCard types (12 — delete):**

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

**Metadata pipeline (delete except annotations subset):**

- `composables/admin/useEntityMetadata.ts` → **delete** (domain editors don't fetch metadata)
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
- `composables/formFields/useFormFields.ts` → **delete** (metadata-driven form field pipeline)
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

- `constants/fieldMetadata.ts` → **delete** (re-exports)
- `constants/fieldMetadataEnums.ts` → **delete** (visibility/layout/renderAs/panel enums — domain editors don't need these)
- `constants/fieldMetadataPanels.ts` → **delete** (SubPanelKey, createEmptySubPanelRecord)
- `constants/adminPrimitiveMetadataOptions.ts` → **delete**

**Metadata Vue components (delete except annotation editor):**

- `components/admin/metadata/AdminPrimitiveMetadataEditor.vue` → **keep for annotations**
- `components/admin/MetadataEditModal.vue` → **delete** (Shapes tab toolbar modal)
- `components/admin/BulkEditModal.vue` → **evaluate** (may be reimplemented simpler)
- `components/admin/PartInstanceBulkEditModal.vue` → **evaluate**
- `components/admin/InstanceBulkEditModal.vue` → **evaluate**

**Server metadata models (archive except annotations subset):**

- `server/src/db/models/admin/adminMetadata.ts` → **keep for annotations**
- `server/src/db/models/admin/adminPrimitiveMetadata.ts` → **keep for annotations**
- `server/src/db/models/admin/adminRelationshipMetadata.ts` → **evaluate** (may still serve relationship display config)
- `server/src/db/models/admin/adminMetadataSelectOption.ts` → **keep for annotations**
- `server/src/db/models/admin/adminPrimitiveMetadataSelectOption.ts` → **keep for annotations**
- `server/src/db/models/admin/adminRelationshipMetadataSelectOption.ts` → **evaluate**

**What survives from the current generic system:**

- `components/admin/generic/collections/RelationshipCollection.vue` → **keep** (validity graph editor)
- `composables/admin/useBaseCollectionFieldCore.ts` → **keep** (powers RelationshipCollection)
- `components/admin/generic/DynamicForm.vue` → **evaluate** (may be useful for annotations)
- `components/admin/BlockInstanceCreateModal.vue` → **adapt** (create modals become domain-specific)
- `composables/admin/useBlockInstanceCreate.ts` → **adapt**

**Approximate totals: ~120 files deleted, ~15-20 domain editors created.**

---

## 7. Decisions to make (with notes)

### 7.1 Three-property model: composite, orchestrator, wizardVisible — RESOLVED

<!-- EXTRACTED to ARCHITECTURE_PRINCIPLES.md §2 (Three-property model) + §8 invariants 2, 10, 11 -->
> See [ARCHITECTURE_PRINCIPLES.md §2](ARCHITECTURE_PRINCIPLES.md#2-three-property-model) for the canonical specification. Below retains the **decision rationale** and **migration detail**.

**Decision:** Ratified. Three independent boolean properties on `block_shapes`. Full principle in ARCHITECTURE_PRINCIPLES.md §2.

**Why three, not one:** Early development used `composable`, `isStateControl`, and `canHaveParts` as flexibility knobs. Now that the domain has crystallized, the three properties express orthogonal concerns.

**Columns dropped:** `block_shapes.composable`, `block_shapes.isStateControl`, `block_shapes.canHaveParts`, `block_instances.composite`, `block_instances.bookingMode`. See §2.3.

**Columns added:** `block_shapes.composite`, `block_shapes.orchestrator`, `block_shapes.wizardVisible`. See §2.4.

**User block shapes** do not participate in this model.

### 7.2 How time and price atomics compose on part instances — RESOLVED

<!-- EXTRACTED to ARCHITECTURE_PRINCIPLES.md §4.1 (Additive composition) + §8 invariant 5 -->
> See [ARCHITECTURE_PRINCIPLES.md §4.1](ARCHITECTURE_PRINCIPLES.md#41-additive-composition) for the principle and examples.

**Decision:** Ratified. Atomics compose additively. Part instances store the resolved total. Principle and examples in ARCHITECTURE_PRINCIPLES.md §4.

### 7.3 Event routing storage format — RESOLVED

<!-- PRINCIPLE: routing is data → ARCHITECTURE_PRINCIPLES.md §5.3. Implementation: use existing event_assignments through-table. -->
> See [ARCHITECTURE_PRINCIPLES.md §5.3](ARCHITECTURE_PRINCIPLES.md#53-routing-is-data-not-computation). Routing uses the existing `event_assignments` through-table — no new table needed. Chain: event block instance → event instances → event_assignments → part instances.

### 7.4 Slice model for partial part-shape routing — RESOLVED

<!-- PRINCIPLE: atomic service granularity provides routing granularity → ARCHITECTURE_PRINCIPLES.md §3.3 (atomic service owns part instances) + §8 invariant 4 -->
> See [ARCHITECTURE_PRINCIPLES.md §3.3](ARCHITECTURE_PRINCIPLES.md#33-what-each-layer-owns). Atomic services provide natural routing granularity. The segment manager assigns individual **part instances** (not part shapes) to segments. No slicing infrastructure needed.

### 7.5 Default routing when no event block is selected

**Question:** Is an event block instance always required, or does the system have an implicit default?

**Notes:** Two approaches:

- **Always-required:** Every service cascade includes at least one event block shape. A "Standard" event block instance (all parts → single Primary segment, all part instances assigned to it) is always present and auto-selected if the user doesn't pick a different routing profile. Pro: routing is always explicit. Con: admin must set up the default.
- **Implicit fallback:** If no event block instance is selected, the pipeline assumes all parts → one segment with `kind: 'primary'`. Pro: simpler setup. Con: implicit behavior that could surprise admin.

**Recommendation:** Always-required with a system-provided "Standard" event block shape that ships with baseline data. Its default event block instance has one event instance ("Primary") with `event_shape_ref` pointing at the Primary placement slot, and all part instances assigned to it. Admins can customize or replace it but cannot delete the last event block from a service cascade.

### 7.6 Admin metadata system + EntityCard deprecation — RESOLVED

<!-- EXTRACTED to ARCHITECTURE_PRINCIPLES.md §7.1 + §7.4 -->
> See [ARCHITECTURE_PRINCIPLES.md §7](ARCHITECTURE_PRINCIPLES.md#7-admin-architecture-principles). Implementation detail in §3.4 and §6.8.

### 7.7 Calendar API mapping, invite policy, location, and attendees — RESOLVED

<!-- PRINCIPLE EXTRACTED to ARCHITECTURE_PRINCIPLES.md §5.4 (Event instances are self-describing calendar segments) + §8 invariant 8 -->
> See [ARCHITECTURE_PRINCIPLES.md §5.4](ARCHITECTURE_PRINCIPLES.md#54-event-instances-are-self-describing-calendar-segments) for the principle. Below retains the **migration mapping** (what moves, what stays, attendee FK pattern).

**Decision:** Ratified. Event instances carry all calendar/location/attendee properties. Event shapes define placement only.

**What moves to event instances (migration detail):**

| Property | Source | Notes |
| --- | --- | --- |
| `includeRescheduleLink` | Migrated from `event_shapes` | Per-segment. |
| `includeCancelLink` | Migrated from `event_shapes` | Per-segment. |
| `locationType` | New enum: `on_site \| off_site \| remote \| virtual` | Replaces `onSite` boolean. |
| `locationPlaceId` / `locationAddress` / `locationLat` / `locationLng` | New, nullable | For `locationType = 'off_site'`. Uses existing Places API pattern. |
| Attendees | Migrated from `event_shape_attendees` → `event_instance_attendees` | FK targets user block instances. |

**What stays on event instances (already there):** All existing Google Calendar properties — `titleTemplate`, `descriptionTemplate`, `locationTemplate`, `visibility`, `transparency`, `guestsCanModify`, `guestsCanInviteOthers`, `guestsCanSeeOtherGuests`, `addConferenceLink`, `sendUpdates`, `colorId`, `status`, `reminderOverrides`.

**Attendee FK pattern:** `event_instance_attendees.user_type_block_instance_id` → `block_instances.id` (user block instances). Attendee type is derived from the user block shape.

### 7.8 MLS enrichment and property details — RESOLVED

<!-- EXTRACTED to ARCHITECTURE_PRINCIPLES.md §6 (MLS enrichment architecture) + §8 invariant 9 -->
> See [ARCHITECTURE_PRINCIPLES.md §6](ARCHITECTURE_PRINCIPLES.md#6-mls-enrichment-architecture) for the three-table architecture, data flow diagram, and separation principle.

**Decision:** Ratified. `property_details` stays as an appointment-scoped input surface. Time atomics define rates; property details provide inputs. These are separate concerns.

**Implementation detail — what changes under the redesign:**

- **`property_feature_mappings.block_instance_id`** re-scoped to target **time block instances** after rename. No structural schema change.
- **`property_field_mappings`** stays as-is.
- **`property_details`** stays as-is.

**Booking wizard flow (implementation):** User enters address → Places API resolves → MLS enrichment fetches listing → `property_field_mappings` populates `property_details` → `property_feature_mappings` suggests time block instances → wizard auto-selects → time atomics read property details to compute durations.

---

## 8. Implementation phasing (sketch)

| Phase | Scope | Depends on |
| --- | --- | --- |
| **A — Rename** | Migrate block shape type enum (`property→time`, `coupon→price`, `option→event`). Update all code references. No logic changes. | Nothing |
| **B — Three-property model** | Add `block_shapes.composite`, `block_shapes.orchestrator`, `block_shapes.wizardVisible` columns. Drop `block_shapes.composable`, `block_shapes.isStateControl`, `block_shapes.canHaveParts`, `block_instances.composite`, `block_instances.bookingMode`. Migrate existing shapes to set the three flags from legacy values. Enforce `orchestrator → composite` constraint. Build orchestration tab (shows `orchestrator = true` shapes). See §1.5, §2.3, §2.4, §7.1. | A |
| **C — Event shape placement columns** | Add `placement_kind` / `anchor_edge` columns to `event_shapes`. Migrate existing rows to set placement values. Seed 7 default rows. Drop `differential_role`, `include_reschedule_link`, `include_cancel_link` columns. Keep full CRUD. | A |
| **D — Event instance ownership** | Add `parent_block_instance_id` FK to `event_instances`. Migrate existing event instances to point at their owning event block instance. | A, C |
| **E — Domain editors + atomic service hub** | Build domain-specific editors (§3.4): `PlacementTypeEditor` (VDataTable proof-of-concept), `ServiceAtomicEditor` (VDataTable part instance grid with inline time/price/event columns), `ShapeEditor`, then remaining domain editors. Relocate event instance components into `SegmentEditor` as inline segment manager. Each editor replaces one EntityCard usage. See §6.8. | B, D |
| **F — Delete differential role pipeline** | Remove `differentialRole` enum, `differential_event_role_overrides`, differential role matrix, shared types/utils/constants. Delete §6.4 and §6.6 files. | C, D |
| **G — Booking pipeline rewrite** | Replace finalizer chain with segment-based pipeline (§4.3). `readEventGraph` → `deriveSegmentDurations` → `layoutSegmentsOnTimeAxis`. Rewrite perspective resolver and floating bounds. | D, F |
| **H — EntityCard + metadata deprecation** | Once all domain editors exist: delete EntityCard component tree (~9 files), 14 composables, 12 type files, 8 utilities. Delete metadata pipeline (~40+ files). Archive metadata DB tables (keep annotations subset). Remove calibration panel, metadata modal from shapes toolbar. See §3.4, §6.8. | E |
| **I — Price block fee logic** | Expand price block from discount-only to full fee handling. Move fee-setting responsibility from service block forms to price block editors. | A, H |
| **J — Segment property consolidation** | Migrate `includeRescheduleLink`/`includeCancelLink` from event shapes to event instances. Add `location_type`, `location_place_id`, `location_address`, `location_lat`, `location_lng` columns to event instances. Rename `event_shape_attendees` → `event_instance_attendees` and re-point FK. Adapt calendar creation service to read everything from event instances. | D, E |
| **K — MLS mapping re-scope** | Verify `property_feature_mappings` rows target time block instances after the `property→time` rename. Update enrichment API's `suggestedBlockInstanceIds` logic to return time composites and atomics. Adapt `usePropertyDetailsLogic` and `applyFirstSuggestedBlockFromLists` to use time block instance selection in the wizard. `property_field_mappings` and `property_details` stay as-is. See §7.8. | A |

Phases A–D are data migrations and structural prep — low risk, incremental. E is the big admin rewrite: domain editors replace EntityCard. F removes the differential role code. G is the booking pipeline rewrite. H is the massive cleanup: ~120 files of EntityCard + metadata infrastructure deleted once domain editors are proven. I–K are product improvements.

The old "big cut" (dropping all event tables) is gone. The migration path is now **incremental**: seed the placement shapes, add the ownership FK, relocate the admin UI, then clean up the differential role code.

---

_Last updated: Principle content extracted to [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md). Sections §1.1–§1.5, §7.1–§7.8 now contain pointers to the principles doc and retain only implementation-specific details (migration mappings, column changes, deletion inventories). §3.3 and §3.4 retain implementation targets with principle pointers._
