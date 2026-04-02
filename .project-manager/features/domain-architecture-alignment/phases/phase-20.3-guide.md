# Phase 20.3 Guide: Pass 3 — Admin UX alignment

**Purpose:** Phase-level harness guide for Feature 20 — implementation plan **§8.3** (admin UX pass).

**Tier:** Phase (Tier 1)

---

## Canonical sources (absolute truth)

- [.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md](.project-manager/analysis/ARCHITECTURE_PRINCIPLES.md) — immutable architectural rules.
- [.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md](.project-manager/analysis/FEATURE_20_ARCHITECTURE_REDESIGN.md) — domain implementation plan (ordered passes, acceptance checks, drift checklist).

**Conflict rule:** If this guide disagrees with either file above, **the analysis documents win**; update this guide, not the principles or the implementation plan.

---

## Verbatim directive (FEATURE_20_ARCHITECTURE_REDESIGN.md §8.3)

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

## Related plan sections

- **§3** — Admin redesign (layering, editors vs generic card).
- **§6** — Client inventory (components, display configs, EntityCard deletion path).
- **§6.3** / **§6.3a** — Metadata cleanup and full deletion inventory for `EntityCard` (rollout order: replace then delete).

---

## Principles and drift

Enforce **ARCHITECTURE_PRINCIPLES.md** §3, §6, §7 (domain-specific editors). Run **plan §9.1** / **§9.1a**; keep orchestrators as assignment selectors, not validity definers, in UI copy and behavior.

**Parent feature guide:** [../feature-domain-architecture-alignment-guide.md](../feature-domain-architecture-alignment-guide.md)

---

## Overview

**Phase Number:** 20.3
**Phase Name:** Pass 3 — Admin UX alignment (metadata editors, generic admin patterns §8.3 / §3).
**Description:** Align admin UI with FEATURE_20 **§8.3**: placement-first event-shape editing, service atomic / orchestration editors, segment UX on event block instances, and start EntityCard replacement + annotation metadata narrowing per **§6.3**.
**Status:** Not Started

---

## Objectives

- [ ] **Placement** — Event-shape admin uses clear **placementKind / anchorEdge** editing (PlacementTypeEditor or equivalent); copy avoids differential-role-as-primary framing on shapes.
- [ ] **Service atomic** — Service-instance **convergence / atomic** editor delivered (ServiceAtomicEditor or equivalent).
- [ ] **Domain editors** — Remaining instance-level orchestration UIs follow validity-constrained selection language.
- [ ] **Segments** — Segment / event-instance management relocated into **event block-instance** context where planned; **Shapes** remain structural-only for validity.
- [ ] **EntityCard / annotations** — First high-confidence EntityCard replacement slice; annotation-only metadata narrowing per plan.
- [ ] **Quality** — Lint clean, app starts, phase log + handoff updated for **20.4**.

---

## Tasks

Run sessions **in order** (see **phase-20.3-planning.md** § Decomposition). Cascade: `session-end` → next `session-start` → `phase-end 20.3` when all sessions complete.

Harness expects each session below as `### Session X.Y.Z:` (do not remove headings — tier-start uses them to sync decomposition and scaffold session guides).

- [x] ### Session 20.3.1: Placement type editor (§8.3 #1)

**Description:** PlacementTypeEditor (or equivalent) for **eventShape** `placementKind` / `anchorEdge`; align `eventShapeDisplays` and admin copy with placement semantics; avoid differential-role-primary framing on shape surfaces.

**Tasks:** Session planning → implement focused editor + field display alignment → manual smoke on Shapes tab event panel.

- [x] ### Session 20.3.2: Service atomic editor (§8.3 #2)

**Description:** ServiceAtomicEditor (or equivalent) for service block-instance convergence / atomic editing aligned with the three-property instance model.

**Tasks:** Session planning → composables/components for service-instance UX → verify against `ENTITY_CONFIGS` / generic admin patterns.

- [x] ### Session 20.3.3: Remaining domain editors (§8.3 #3)

**Description:** Instance-level orchestration UIs for other shape types (**time** / **price** / **event**) using validity-constrained selection language.

**Tasks:** Reuse patterns from 20.3.1–20.3.2; keep shapes structural, instances behavioral.

- [x] ### Session 20.3.4: Segment manager relocation (§8.3 #4)

**Description:** Move or embed segment / **eventInstance** management from Instances tab “Events” island into **event block-instance** editing; stay aligned with Phase **20.2** APIs.

**Tasks:** UX design in session plan → wire `EventInstancesSection` / block-instance flows → regression pass on Instances + Shapes tabs.

- [x] ### Session 20.3.5: Annotation metadata + EntityCard wave (§8.3 #5)

**Description:** Annotation-only metadata narrowing where plan allows; first high-confidence **EntityCard** replacement slice; document remaining debt for **20.6**.

**Tasks:** Session plan → narrow scope → replace lowest-risk EntityCard call site(s) → update phase log / handoff notes.
