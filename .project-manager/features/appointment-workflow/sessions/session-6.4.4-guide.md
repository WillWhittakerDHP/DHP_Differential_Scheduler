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

- [ ] #### Task 6.4.4.1: Unified required confirmation modal shell

**Goal:** Unified required confirmation modal shell

**Files:**
(See session guide and phase context above.)

**Approach:** See session scope above.

**Checkpoint:** Verify per session success criteria. [Fill in]
**Files:**
- [Files to work with]
**Approach:** [Fill in]
**Checkpoint:** [What needs to be verified]