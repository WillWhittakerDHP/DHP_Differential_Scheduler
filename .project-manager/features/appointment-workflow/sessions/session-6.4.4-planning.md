# Planning: session 6.4.4 -- Unified required confirmation modal shell

## Loaded Context
- **Scope:** 6.4.4

- **Context source policy:** tierUp only. Phase guide (session entry) and phase handoff only. Session handoff, session guide, and session log are excluded.

### What We Are Planning (from context)

Session 6.4.4 builds a **unified required-confirmation modal shell** based on **MoveablePartsModal**, with two shell principles: **dynamic title** (e.g. "Confirm {blockInstance.name} details" for the property modal) and **progressive / mini-wizard** (answer a question → different response). MoveablePartsModal and PropertyConfirmationModal become consumers of this shell.

### Proposed Implementation Plan

- Extract shell from MoveablePartsModal (structure, styles, transitions); design API for dynamic title and progressive body content.
- Refactor MoveablePartsModal and PropertyConfirmationModal to use the shell; property modal adopts dynamic title pattern.
- Implement in small steps with governance checks after each change.

## Session: 6.4.4 - Unified required confirmation modal shell
**Date:** 2026-03-01
**Duration:** [Estimated]
**Status:** In Progress
**Agent:** Current

### Transition context (handoff)

## Transition Context (tierUp: phase)

**Where we left off and what you need to start:**

## Phase Handoff (6.4)

## Current Status

- Phase 6.4 objective remains: unify confirmation flow and keep modal behavior consistent across required confirmation steps.
- Session 6.4.4 is active and focused on a reusable required confirmation modal shell.
- Session docs exist but still contain placeholders; planning should resolve specific files/acceptance criteria before execute mode.

## Next Action

- Continue Session 6.4.4 and finalize:
  - exact shell API (props/events/slots),
  - integration boundaries for MoveablePartsModal and PropertyConfirmationModal,
  - concrete files to touch and test checkpoints.

## Transition Context

**Where we left off:**
- Prior phase/session work established modal behavior and differential/preClosing context.
- Current planning output showed template-heavy context and generic Q&A prompts.

**What you need to start now:**
- Use session 6.4.4 guide task block as source of truth for scope.
- Resolve placeholders in session handoff/guide before implementation.
- Enforce governance expectations: thin components, logic in composables/utilities, explicit checkpoints.

---

### Session intent (from phase guide)

## Session intent from phase guide

- [ ] ### Session 6.4.4: Unified required confirmation modal shell
**Description:** Extract the modal "window" (VDialog + VCard + title + close + body slot + actions) with transitions/sizing from the moveable modal into a single reusable shell. Both MoveablePartsModal and PropertyConfirmationModal become consumers: step-specific content in a shared shell. Enables a consistent "required confirmation before next step" pattern for property details, moveable scheduling, and future steps (e.g. submit "is this the service package you want?").
**Tasks:**
- Create `RequiredConfirmationModal.vue` (or `WizardStepConfirmationModal.vue`) as shell: v-model open, title prop/slot, default slot for body, optional actions slot or props (primary/secondary label, canConfirm), emit confirm/cancel; apply Phase 6.4 UX (max-width, delay, enter/exit transitions)
- Refactor MoveablePartsModal to use the shell: move moveable-specific content (contingency, slots) into the shell's default slot; keep existing props/emits for content logic
- Refactor PropertyConfirmationModal to use the shell: move property summary into the shell's default slot; keep existing props/emits
- Optionally document or introduce a step-level concept (e.g. `confirmModal: true`) for wizard steps that require completing this modal before advancing; leave wiring for submit-step confirmation as follow-up if out of scope

---

### Governance Context (audit digest)

## Governance Context (Session)

### Function Governance
Clean — no violations detected.

**Thresholds:**
| Concern | Threshold |
|---------|-----------|
| Nesting depth | ≤ 3 levels |
| Branch count | ≤ 8 / function |
| Length (branchy) | ≤ 50 lines |
| Script setup | ≤ 100 lines |
| Params / returns | ≤ 4 each |
| Return type | Explicit on exported/boundary |

### Component Governance
Clean — no violations detected.

**Thresholds:**
| Concern | Threshold |
|---------|-----------|
| Prop count | ≤ 8 (or config object) |
| Emit count | ≤ 8 (or grouped) |
| Component coupling | ≤ 5 direct imports |
| Template directive depth | ≤ 3 |
| Template size | ≤ 200 lines |
| Complex expression | ≤ 80 chars |

1. Exceeds prop/emit/coupling/template thresholds? → decompose or extract
2. Orchestrator / allowlisted wrapper? → confirm allowlist entry
3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)

### Composable Governance
**Health findings (3):**
- `client/src/composables/admin/tables/useAppointmentsTableModel.ts` — oversized-return: Return surface has 11 properties; decompose into focused composables
- `client/src/composables/admin/useBaseCollectionField.ts` — oversized-return: Return surface has 12 properties; decompose into focused composables
- `client/src/composables/formFields/useFormFields.ts` — excessive-composable-imports: High composable fan-out (6 imports); consider decomposing or using a focused facade
**Logic hotspots (2):**
- `client/src/composables/booking/useMoveablePartsScheduling.ts` (score: 33)
- `client/src/composables/fieldContext/useFieldContextState.ts` (score: 20)

**Thresholds:**
| Concern | Threshold |
|---------|-----------|
| Return surface | < 10 properties |
| Composable imports | < 6 per file |
| 

*(excerpt truncated)*

- **Governance highlights:** Loaded 4 governance highlights from current audits.

### Governance Findings

- Clean — no violations detected.
- Clean — no violations detected.
- 3. Script logic can move to composable/util? → extract (Tier1 hotspots: watch, async, map/reduce, DOM)
- **Logic hotspots (2):**

### Reuse Opportunities

- `client/src/composables/admin/tables/useAppointmentsTableModel.ts` — oversized-return: Return surface has 11 properties; decompose into focused composables
- `client/src/composables/admin/useBaseCollectionField.ts` — oversized-return: Return surface has 12 properties; decompose into focused composables
- `client/src/composables/formFields/useFormFields.ts` — excessive-composable-imports: High composable fan-out (6 imports); consider decomposing or using a focused facade
- `client/src/composables/booking/useMoveablePartsScheduling.ts` (score: 33)
- `client/src/composables/fieldContext/useFieldContextState.ts` (score: 20)

## Goal

Unify required-confirmation modals under a single reusable shell **based on MoveablePartsModal**, preserving and generalizing two behaviors:

1. **Dynamic title** — The shell supports a dynamic title (e.g. moveable modal’s current behavior). Other modals (e.g. property confirmation) use the same pattern with context-specific text, e.g. *"Confirm {blockInstance.name} details"*.
2. **Progressive / mini-wizard** — “Answer a question and get a different response” is a **shell principle**: the shell is built to support step-wise content changes (progressive disclosure) so any consumer can use it for a small multi-step flow, not only a single static confirmation.

Outcome: one shell (VDialog + VCard + title + close + body slot + actions, with Phase 6.4 UX); MoveablePartsModal and PropertyConfirmationModal become thin consumers with step-specific content in the shell’s slots.

## Files

- **New:** Shell component (e.g. `RequiredConfirmationModal.vue` or `WizardStepConfirmationModal.vue`) — extracted from MoveablePartsModal’s structure, styles, and transitions.
- **Refactor:** `MoveablePartsModal` — use shell; move moveable-specific content (contingency, slots) into shell’s default slot; keep existing props/emits for content logic.
- **Refactor:** `PropertyConfirmationModal` — use shell; move property summary into shell’s default slot; adopt dynamic title pattern (e.g. "Confirm {blockInstance.name} details"); keep existing props/emits.
- **Reference:** Phase 6.4 UX (max-width, delay, enter/exit transitions) applied in the shell.

## Approach

1. **Extract shell from MoveablePartsModal** — Pull out the modal “window” (VDialog + VCard, title bar, close, body slot, actions) and Phase 6.4 styling/transitions. Design the shell API to support:
   - **Dynamic title:** prop or slot for title (string or computed, e.g. `"Confirm {blockInstance.name} details"`).
   - **Progressive content:** single default slot for body; consumers swap content per “step” (e.g. moveable Q&A, property summary). Shell does not own step state; it provides the frame and optional actions slot/props (primary/secondary label, canConfirm), emit confirm/cancel.
2. **Refactor MoveablePartsModal** — Keep current behavior and progressive flow; render moveable-specific content inside the shell’s body slot. Title remains dynamic as today.
3. **Refactor PropertyConfirmationModal** — Use the shell; inject property summary into body slot; set dynamic title (e.g. "Confirm {blockInstance.name} details" or equivalent from context).
4. **Governance** — Thin components; slot-based content; logic in composables/utilities; no new ad-hoc patterns. Optional follow-up: document step-level `confirmModal: true` or similar for wizard steps; submit-step confirmation wiring out of scope for this session.

## Checkpoint

- [ ] Shell exists with v-model open, title prop/slot, default body slot, optional actions; Phase 6.4 UX (max-width, delay, enter/exit transitions).
- [ ] MoveablePartsModal uses shell; dynamic title and progressive (answer → different response) behavior unchanged.
- [ ] PropertyConfirmationModal uses shell; dynamic title (e.g. "Confirm {blockInstance.name} details") and existing props/emits preserved.
- [ ] Lint and session governance checks pass.

---

## Decisions Made

- **Base for shell:** MoveablePartsModal — use its behaviors and styles (dynamic title line, progressive flow) as the foundation for the shared shell.
- **Dynamic title as shell principle:** The shell supports a dynamic title so any consumer (e.g. property modal) can show context-specific text such as "Confirm {blockInstance.name} details".
- **Progressive / mini-wizard as shell principle:** “Answer a question and get a different response” is a first-class shell behavior: the shell is designed so consumers can drive step-wise content (mini-wizard) in the body slot; MoveablePartsModal already demonstrates this; PropertyConfirmationModal and future modals can use the same pattern.

## Insight / Proposal / Decisions
### 1. Insight / Proposal / Decision

**What the docs indicate:** Session intent: "Unified required confirmation modal shell".

**Proposed path:** We'll plan all necessary items for this goal and follow governance (thin components, composables, reuse). This is the place to lock in or adjust what we're building.

**Decision needed:** After reading the planning doc and context, what do you want to lock in or adjust before we proceed?

*Where you and the agent talk about the plan.*

**Options:** Let's discuss in chat | I'm ready to lock the plan as-is

---

### 2. Insight / Proposal / Decision — RESOLVED

**Decision:** Base the shared shell on **MoveablePartsModal** (behaviors and styles: dynamic title, progressive/mini-wizard flow). *(Resolved in chat.)*

---

### 3. Insight / Proposal / Decision

**What the docs indicate:** Open placeholders in session docs: ### Session 6.4.4: Unified required confirmation modal shell.

**Proposed path:** We'll plan all necessary items for this goal so execute mode has clear scope.

**Decision needed:** Any of these (or other edge cases) to include in this session's plan?

*What to lock in before we start.*

**Options:** Include all relevant; discuss if unsure | I'll specify in chat

---

### 4. Insight / Proposal / Decision

**What the docs indicate:** We'll follow governance (thin components, composables, reuse). No option to relax for speed.

**Proposed path:** We'll enforce governance on touched files and prefer reuse over new ad-hoc patterns.

**Decision needed:** Any specific UX or integration boundaries for Unified required confirmation modal shell?

*Domain constraints only.*

**Options:** I'll describe in chat | None in mind
