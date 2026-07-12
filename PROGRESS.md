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
| `base_sq_ft` | `appointmentToWizardHelpers`, entity transformers | Admin bulk edit, versioning | ⚠️ Time-domain concern on all instances | **MOVE** to time orchestrator instances or derive from property — not every instance |
| `requires_unit_number` | `PropertyDetailsStep`, validation | Admin bulk edit | ⚠️ Property-type concern | **MOVE** to time/property orchestrator instances only |
| `is_multi_family` | `PropertyDetailsStep`, `usePropertyValidation` | Admin bulk edit | ⚠️ Property-type concern | **MOVE** to time orchestrator instances only |
| `requires_agent` | Contacts / attendee flows | Admin + migration 070 | ⚠️ Also on `block_shapes` — duplicate? | **VERIFY owner** — shape vs instance; likely keep one |
| `pre_closing` | `useAvailabilityOrchestratorMinimizerGates`, versioning | Admin forms | ⚠️ Booking-context flag on all instances | **MOVE** to service or appointment context |
| `agent_permissions` | `entityTransformers`, code-first metadata | Admin forms | ⚠️ Agent-domain ternary on all instances | **MOVE** to agent/user instances or contacts domain |
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

1. `block_instances.requires_agent` vs `block_shapes.requires_agent` — which is authoritative?
2. `part_instances.blockInstanceId` — spec notes missing FK; **not present in current schema** (assignment is via `part_assignments` join table). Confirm intentional.
3. Test suite absence — were tests on another branch or deliberately stripped?

---

### Phase 0 exit checklist

- [x] App runs locally
- [x] Typecheck/lint baseline recorded
- [x] Uncommitted work resolved (committed)
- [x] Harness deleted, keepers in `docs/`
- [x] Behaviour + schema audit written
- [ ] **Will sign-off** on Phase 1 kill/keep/move list (this section)

### Suggested Phase 1 entry

1. Verify `composite` / `orchestrator` / `wizardVisible` drive real behaviour (not just column presence).
2. Execute kill/keep/move table above for grab-bag columns.
3. Restore or rebuild test suites before treating CI as a merge gate.
4. Prove Minimize Time On Site end-to-end (§6.1 — blocking).
