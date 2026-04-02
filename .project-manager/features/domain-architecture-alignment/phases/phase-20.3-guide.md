# Phase 20.3 Guide: Pass 3 — Admin UX alignment

**Purpose:** Phase-level harness guide for Feature 20 — v2 **§8.3** (admin UX pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/DOMAIN_ARCHITECTURE_REDESIGN_v2.md](.project-manager/analysis/DOMAIN_ARCHITECTURE_REDESIGN_v2.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or v2.

---

## Verbatim directive (DOMAIN_ARCHITECTURE_REDESIGN_v2.md §8.3)

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

---

## Related v2 sections

- **§3** — Admin redesign (layering, editors vs generic card).
- **§6** — Client inventory (components, display configs, EntityCard deletion path).
- **§6.3** / **§6.3a** — Metadata cleanup and full deletion inventory for `EntityCard` (rollout order: replace then delete).

---

## Principles and drift

Enforce **ARCHITECTURE_PRINCIPLES.md** §3, §6, §7 (domain-specific editors). Run **v2 §9.1** / **§9.1a**; keep orchestrators as assignment selectors, not validity definers, in UI copy and behavior.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)
