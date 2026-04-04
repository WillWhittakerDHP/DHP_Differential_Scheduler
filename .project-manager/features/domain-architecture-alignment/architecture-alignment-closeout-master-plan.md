# Feature 20 — Close-out master plan (in-repo sequencing index)

**Purpose:** Single **committed** sequencing surface for Feature **20** work after pass **20.6** (extension phases **20.7–20.13**). Use this file for **order and harness navigation**; immutable domain rules remain in the analysis docs below.

**Replaces:** Links to **`.cursor/plans/architecture_alignment_closeout_master_plan_20260403.plan.md`**, which is not part of this git repository (Cursor-local export). Long-form narrative from that export may be pasted into this file later; until then, **phase guides** carry execution detail.

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](../../analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](../../analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (passes **20.1–20.6** and acceptance context).
- [.project-manager/ARCHITECTURE.md](../../ARCHITECTURE.md) — codebase map and locked scheduling rules (§8–§14).

**Conflict rule:** If this document disagrees with **ARCHITECTURE_PRINCIPLES** or **FEATURE_20_ARCHITECTURE_REDESIGN**, the **analysis documents win**. If **sequencing** conflicts remain after that, this close-out index and the **phase guides** win over informal planning forks. Update harness docs—do not fork a second ladder.

---

## Extension ladder (phases 20.7–20.13)

| Phase | Guide | Role (summary) |
|-------|--------|----------------|
| **20.7** | [phase-20.7-guide.md](./phases/phase-20.7-guide.md) | Preflight audit, canonical lock, contradictory-doc protections, evidence package prep |
| **20.8** | [phase-20.8-guide.md](./phases/phase-20.8-guide.md) | Residual schema and API enforcement |
| **20.9** | [phase-20.9-guide.md](./phases/phase-20.9-guide.md) | Residual admin surface alignment |
| **20.10** | [phase-20.10-guide.md](./phases/phase-20.10-guide.md) | Residual booking pipeline alignment |
| **20.11** | [phase-20.11-guide.md](./phases/phase-20.11-guide.md) | Migration narrative and data conversion close-out |
| **20.12** | [phase-20.12-guide.md](./phases/phase-20.12-guide.md) | Cleanup and vocabulary retirement |
| **20.13** | [phase-20.13-guide.md](./phases/phase-20.13-guide.md) | Truth docs and final feature close-out |

**Feature harness:** [feature-domain-architecture-alignment-guide.md](./feature-domain-architecture-alignment-guide.md)

---

## Phase 0 / preflight (20.7)

Before treating **20.8+** as execution-ready:

- Adopt this index and the **20.7** phase guide as the active sequencing surface.
- Add safeguards so superseded docs are not read as co-equal authorities.
- Capture the written preflight package (event-routing watchpoint, invariant audit, migration policy restatement, `property_details` boundary) per **phase-20.7-guide.md**.

---

## Related

- **Pass ladder (20.1–20.6):** Documented in **FEATURE_20_ARCHITECTURE_REDESIGN** and historical phase guides **20.1–20.6**.
- **Do not** run **`/feature-end`** until **20.13** is complete (see feature guide **Post-20.6** note).
