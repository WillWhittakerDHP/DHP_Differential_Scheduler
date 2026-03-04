# Task 6.4.4.2 — Refactor PropertyConfirmationModal to use shell

**Session:** 6.4.4 — Unified required confirmation modal shell  
**Task:** 6.4.4.2  
**Date:** 2026-03-01

---

## Goal

Use the shared required-confirmation shell (`RequiredConfirmationModal`) for PropertyConfirmationModal:

- Property summary in the shell's default slot (body).
- Dynamic title (e.g. "Confirm {blockInstance.name} details").
- Keep existing props/emits for content logic; thin component.

---

## Files

| Role | Path |
|------|------|
| Refactor | `client/src/components/booking/modals/PropertyConfirmationModal.vue` |
| Reference | `client/src/components/booking/modals/RequiredConfirmationModal.vue` |
| Reference | Phase 6.4 UX (max-width, delay, transitions) |

---

## Approach

1. **Wire to shell** — Use `RequiredConfirmationModal` as wrapper; pass `modelValue`, `title` (dynamic), `primary-label` / `secondary-label`; body slot = property summary content (VList).
2. **Dynamic title** — Compute from `selectedPropertyTypes[0]?.name`: `Confirm ${name} details` when present, else `Confirm Property Details`.
3. **Preserve API** — Keep props: `modelValue`, `propertyDetails`, `selectedPropertyTypes`. Keep emits: `update:modelValue`, `confirm`, `edit`. Map shell `@cancel` to `edit` (secondary button = Edit).

---

## Checkpoint

- [x] PropertyConfirmationModal uses `RequiredConfirmationModal` shell.
- [x] Dynamic title: `confirmationTitle` computed from first selected block name.
- [x] Existing props/emits preserved; thin component.
- [x] Lint and session governance checks pass.

---

## Verification (implementation completed in 6.4.4.1)

Implementation was done as part of task 6.4.4.1 (unified shell + both modals). This task is satisfied by:

- **Template:** `<RequiredConfirmationModal>` wraps content; default slot = property VList; `:title="confirmationTitle"`, `primary-label="Confirm"`, `secondary-label="Edit"`, `@confirm` / `@cancel` (cancel → edit).
- **Script:** `confirmationTitle` computed: `Confirm ${first?.name} details` or `Confirm Property Details`; props/emits unchanged; `RequiredConfirmationModal` imported and used.

No further code changes required for 6.4.4.2; task can be closed with verification.
