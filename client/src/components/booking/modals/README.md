# Booking modals

Shared and step-specific modals used in the booking wizard.

## RequiredConfirmationModal (shell)

**Path:** `RequiredConfirmationModal.vue`

Reusable confirmation modal shell used when a step requires the user to confirm before advancing. Phase 6.4 UX: max-width 520px, ~400ms open delay, scale transition.

### Usage

- **Consumers:** `MoveablePartsModal`, `PropertyConfirmationModal`.
- **API:** `v-model` (open), `title` (dynamic), default slot (body), optional `primaryLabel` / `secondaryLabel` / `canConfirm`; emits `confirm`, `cancel`, `update:modelValue`.

### Steps that use the required-confirmation modal

| Step | Component | Purpose |
|------|-----------|---------|
| Property details | PropertyConfirmationModal | Confirm property info before continuing |
| Availability (minimizer) | MinimizerPartsModal | Confirm contingency and completion time |

### Step-level concept: `confirmModal`

Wizard steps that require the user to complete this modal before advancing can be marked with a step-level flag (e.g. `confirmModal: true`) in the step schema. Wiring to block advance until the modal is confirmed is left as follow-up; submit-step confirmation (e.g. "is this the service package you want?") is also follow-up if out of scope.

See `WizardStepConfig` in `@/configs/wizardSteps` for optional `confirmModal` on the step type.
