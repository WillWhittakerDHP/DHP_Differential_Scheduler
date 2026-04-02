# Phase 20.1 Guide: Pass 1 — Schema alignment

**Purpose:** Phase-level harness guide for Feature 20 — implementation plan **§8.1** (schema pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.1)

Scope:

- Rename block-shape types to `time`, `price`, and `event`.
- Move three-property storage to `block_instances`.
- Add event placement columns and event-instance ownership fields.
- Drop differential-role storage and other legacy columns called out in section 2.

Acceptance checks:

- Schema plan refers to `block_instances.composite`, `block_instances.orchestrator`, and `block_instances.wizardVisible`.
- No schema step enforces `orchestrator -> composite`.
- Event routing is still modeled through `event_assignments`.

---

## Related plan sections

- **§2** — Model changes (DB / Sequelize): enum renames, tables, columns aligned to this pass.
- **§1** — Rename mappings and part-instance migration (type renames `property`→`time`, etc.).
- **§0.2** — Legacy assumptions to remove (shape-level three-property framing, etc.).

---

## Principles and drift

Enforce **ARCHITECTURE_PRINCIPLES.md** §1 (domain separation), §2 (three-property instance model), §3–§5 as cited in plan §2. At session boundaries run **plan §9.1** and confirm **§9.1a** invariants (especially instance-level three-property storage and relational `event_assignments`).

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)
