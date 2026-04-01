# Phase 20.5 Guide: Pass 5 — Migration planning and data conversion

**Purpose:** Phase-level harness guide for Feature 20 — v2 **§8.5** (migration pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or v2.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.5)

Scope:

- Define the data migration sequence for renamed enums, moved fields, placement data, event-instance ownership, attendee-table rename, and legacy cleanup.
- Document seed expectations for baseline placement types and baseline event-orchestrator data.

Acceptance checks:

- Migration notes describe how baseline event routing is established explicitly.
- Legacy assumptions listed in section 2 are either removed or mapped to their replacement storage.
- No migration step depends on undocumented implicit defaults.

---

## Related v2 sections

- **§2** — Schema targets migrations must reach.
- **§9.5** — Migration notes (ordering: type names first, three-property on instances, placement, relational routing).
- **§9.6** — Risk register (implicit default routing, etc.).
- **§1** — Rename and part-instance mappings.

---

## Principles and drift

Migration steps must remain permitted by **ARCHITECTURE_PRINCIPLES.md**; use **v2 §9.2** stop conditions if a step would invent behavior. Run **§9.1** / **§9.1a** at session boundaries.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)
