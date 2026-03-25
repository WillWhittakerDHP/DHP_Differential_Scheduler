# Plan: phase 6.16 — Differential role generalization (margin + multiple minimizers)

## Contract

- **Tier:** phase | **ID:** 6.16
- **Scope:** Margin role (pre-major placement), multiple minimizer segments, `PartFinal.minimizer` ternary semantics; phased rename **moveable → minimizer** in code and persisted payloads
- **Governance:** Type boundaries, composable/function thresholds, no silent fallbacks

## Goal

Deliver **margin** + **multiple minimizer** scheduling with **`PartFinal.minimizer`** (`'false'` | `'true'` | `'override'`). Extend slot math, perspective resolution, admin overrides; document calendar/API behavior. Execute or document phased **minimizer** rename with migrations where needed.

## Decomposition

| Unit | Session | Outcome |
|------|---------|---------|
| **Margin foundation** | 6.16.1 | Types, DB/migration, pipeline, admin |
| **Multi-minimizer scheduling** | 6.16.2 | Segments, composable, orchestrator |
| **Integration + rename tranches** | 6.16.3 | E2E verification, downstream inventory, rename |

## Reference

- `phases/phase-6.16-guide.md`
