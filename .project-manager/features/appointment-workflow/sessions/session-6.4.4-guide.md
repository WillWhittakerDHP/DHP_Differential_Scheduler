# Session 6.4.4: Unified required confirmation modal shell

## Session: 6.4 — Unified required confirmation modal shell

Extract a single modal shell used by all "required confirmation" wizard modals (must complete before next step). Content stays step-specific; transitions and window chrome live in one component.

**Prerequisites:** Session 6.4.1 (and 6.4.2 as needed) so the moveable modal has UX softening (size, delay, transitions) in place.

---

## Scope

- **Shell:** One component (e.g. `RequiredConfirmationModal.vue`) providing VDialog + VCard, title, close button, default slot (body), and actions (secondary + primary; optional slot). Props: `modelValue` (open), `title`, `confirmLabel` / `cancelLabel`, `canConfirm`; emits: `update:modelValue`, `confirm`, `cancel`.
- **Consumers:** MoveablePartsModal and PropertyConfirmationModal refactored to render inside the shell's default slot; no duplicate transition or sizing logic.
- **Optional:** Document or add step-level `confirmModal: true` (or equivalent) for steps that require this modal before advancing; submit-step confirmation can be a later task.

---

## Tasks

- [ ] #### Task 6.4.4.1: Create RequiredConfirmationModal shell

**Goal:** Add the shared modal shell with Phase 6.4 UX (max-width, open delay, enter/exit transitions) and a single place for accessibility (focus trap, escape).

**Files:**
- New: `client/src/components/booking/modals/RequiredConfirmationModal.vue` (or under `components/booking/` if preferred)

**Approach:**
1. Implement shell: VDialog (v-model), VCard, VCardTitle (title prop or slot + close), VCardText (default slot), VCardActions (primary/secondary buttons or slot).
2. Apply sizing (e.g. max-width), ~400ms open delay, and enter/exit transitions in the shell.
3. Props: `modelValue`, `title`, `confirmLabel`, `cancelLabel`, `canConfirm` (optional, default true); emits: `update:modelValue`, `confirm`, `cancel`.

**Checkpoint:**
- Shell renders and opens/closes; confirm/cancel emit; transitions and delay behave as in Phase 6.4.

---

- [ ] #### Task 6.4.4.2: Refactor MoveablePartsModal to use shell

**Goal:** MoveablePartsModal uses RequiredConfirmationModal; moveable content (contingency, time slots) is body content only.

**Files:**
- `client/src/components/booking/MoveablePartsModal.vue`
- `client/src/components/booking/modals/RequiredConfirmationModal.vue`

**Approach:**
1. Replace local VDialog/VCard with RequiredConfirmationModal; pass title "Schedule Moveable Work", wire v-model, confirm/cancel, canConfirm.
2. Put current body (contingency questions, available slots) in the default slot.
3. Remove duplicate transition/sizing from MoveablePartsModal.

**Checkpoint:**
- Moveable flow unchanged; modal appearance and behavior match current 6.4 design; lint and app start pass.

---

- [ ] #### Task 6.4.4.3: Refactor PropertyConfirmationModal to use shell

**Goal:** PropertyConfirmationModal uses RequiredConfirmationModal; property summary is body content only.

**Files:**
- `client/src/components/booking/modals/PropertyConfirmationModal.vue`
- `client/src/components/booking/modals/RequiredConfirmationModal.vue`

**Approach:**
1. Replace local VDialog/VCard with RequiredConfirmationModal; title "Confirm Property Details", secondary "Edit" / primary "Confirm", wire v-model, confirm, cancel (edit).
2. Put property summary (VList, etc.) in the default slot.
3. Remove duplicate dialog/card structure from PropertyConfirmationModal.

**Checkpoint:**
- Property confirmation flow unchanged; same shell UX as moveable modal; lint and app start pass.

---

- [ ] #### Task 6.4.4.4 (Optional): Document confirmModal step contract

**Goal:** Document that steps with a required confirmation modal share the same contract (modal must be completed before advancing); optionally add a step config or type for future use (e.g. submit step).

**Files:**
- Feature or phase handoff; optionally wizard step types or config.

**Approach:**
1. Add a short "Required confirmation modals" section: shell component, usage in Property Details and Moveable, and that content is step-specific.
2. If desired, add `confirmModal: true` (or similar) to step metadata and note that submit-step confirmation will use the same shell.

**Checkpoint:**
- Docs describe the pattern; future steps (e.g. submit) can reuse the shell without redefining the window.

---

## Session checkpoint

- [ ] RequiredConfirmationModal exists and both MoveablePartsModal and PropertyConfirmationModal use it.
- [ ] Transitions and sizing live only in the shell.
- [ ] App starts, lint passes; property and moveable flows unchanged in behavior.
