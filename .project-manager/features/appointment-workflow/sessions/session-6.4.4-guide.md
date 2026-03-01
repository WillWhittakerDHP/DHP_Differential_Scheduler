## Session intent from phase guide

- [ ] ### Session 6.4.4: Unified required confirmation modal shell
**Description:** Extract the modal "window" (VDialog + VCard + title + close + body slot + actions) with transitions/sizing from the moveable modal into a single reusable shell. Both MoveablePartsModal and PropertyConfirmationModal become consumers: step-specific content in a shared shell. Enables a consistent "required confirmation before next step" pattern for property details, moveable scheduling, and future steps (e.g. submit "is this the service package you want?").
**Tasks:**
- Create `RequiredConfirmationModal.vue` (or `WizardStepConfirmationModal.vue`) as shell: v-model open, title prop/slot, default slot for body, optional actions slot or props (primary/secondary label, canConfirm), emit confirm/cancel; apply Phase 6.4 UX (max-width, delay, enter/exit transitions)
- Refactor MoveablePartsModal to use the shell: move moveable-specific content (contingency, slots) into the shell's default slot; keep existing props/emits for content logic
- Refactor PropertyConfirmationModal to use the shell: move property summary into the shell's default slot; keep existing props/emits
- Optionally document or introduce a step-level concept (e.g. `confirmModal: true`) for wizard steps that require completing this modal before advancing; leave wiring for submit-step confirmation as follow-up if out of scope
**Learning Goals:**
- Reusable modal shell pattern (slot-based content, single place for transitions and accessibility)
- Same UX contract for all "required confirmation" modals; step-unique content only in slots

---

- [x] #### Task 6.4.4.1: Unified required confirmation modal shell

**Goal:** Unify required-confirmation modals under a single reusable shell based on MoveablePartsModal, with two shell principles: (1) Dynamic title — shell supports dynamic title; property modal uses e.g. "Confirm {blockInstance.name} details". (2) Progressive / mini-wizard — "answer a question, get a different response" as shell principle; shell supports step-wise content in body slot. MoveablePartsModal and PropertyConfirmationModal become thin consumers.

**Files:**
- New: Shell component (e.g. `RequiredConfirmationModal.vue` or `WizardStepConfirmationModal.vue`) — extracted from MoveablePartsModal.
- Refactor: `MoveablePartsModal` — use shell; move moveable-specific content into shell's default slot.
- Refactor: `PropertyConfirmationModal` — use shell; property summary in body slot; dynamic title (e.g. "Confirm {blockInstance.name} details").
- Reference: Phase 6.4 UX (max-width, delay, enter/exit transitions) in shell.

**Approach:**
1. Extract shell from MoveablePartsModal (VDialog + VCard, title bar, close, body slot, actions; Phase 6.4 styling/transitions). API: dynamic title (prop/slot), progressive body slot, optional actions (primary/secondary, canConfirm), emit confirm/cancel.
2. Refactor MoveablePartsModal to use shell; keep dynamic title and progressive flow.
3. Refactor PropertyConfirmationModal to use shell; dynamic title e.g. "Confirm {blockInstance.name} details".
4. Governance: thin components, slot-based content, logic in composables; no new ad-hoc patterns.

**Checkpoint:**
- Shell exists with v-model open, title prop/slot, default body slot, optional actions; Phase 6.4 UX.
- MoveablePartsModal uses shell; dynamic title and progressive behavior unchanged.
- PropertyConfirmationModal uses shell; dynamic title and existing props/emits preserved.
- Lint and session governance checks pass.