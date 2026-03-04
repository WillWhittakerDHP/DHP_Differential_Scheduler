# Task 6.4.4.3 — Optional: document step-level confirmModal / submit-step wiring

**Session:** 6.4.4 — Unified required confirmation modal shell  
**Task:** 6.4.4.3  
**Date:** 2026-03-01

---

## Goal

Optionally document or introduce a step-level concept (e.g. `confirmModal: true`) for wizard steps that require completing the required-confirmation modal before advancing. Leave submit-step confirmation wiring as follow-up if out of scope.

---

## Files

| Role | Path |
|------|------|
| Docs | Session/phase docs or shell usage notes |
| Optional | Wizard/step config (e.g. `WizardStepConfig`) if adding a schema field |

---

## Approach

1. **Document which steps use the modal** — Property details step and availability (moveable) step use the shell; document in shell usage notes.
2. **Step-level concept** — Add `confirmModal` or equivalent to step schema if desired (optional field; wiring deferred).
3. **Defer submit-step wiring** — Submit-step confirmation ("is this the service package you want?") left as follow-up unless in scope.

---

## Checkpoint

- [x] Any new docs or config consistent with governance (README + optional WizardStepConfig.confirmModal).
- [x] No required code change if deferred; optional schema field and docs only.
