# Phase 20.6 Guide: Pass 6 — Rollout and cleanup

**Purpose:** Phase-level harness guide for Feature 20 — v2 **§8.6** (rollout and cleanup pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/DOMAIN_ARCHITECTURE_REDESIGN_v2.md](.project-manager/analysis/DOMAIN_ARCHITECTURE_REDESIGN_v2.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or v2.

---

## Verbatim directive (DOMAIN_ARCHITECTURE_REDESIGN_v2.md §8.6)

Scope:

- Roll out domain editors incrementally.
- Delete differential-role code after the replacement path is in place.
- Delete `EntityCard` and non-annotation metadata infrastructure after replacement editors are proven.
- Prepare replacement review for swapping v2 into the canonical redesign path.

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

---

## Related v2 sections

- **§6.3** / **§6.3a** — Shared display, metadata cleanup, and full deletion inventory for `EntityCard` and related infrastructure.
- **§9.3** / **§9.4** — Replacement readiness and review gate before renaming v2 to canonical redesign path.
- **§8.3** — Admin UX pass (replacement editors must precede deletions).

---

## Principles and drift

**Cleanup follows replacement, not the reverse** (v2 §8.6). Enforce **ARCHITECTURE_PRINCIPLES.md** §7 (domain editors). Run **v2 §9.1** / **§9.1a** through rollout.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)
