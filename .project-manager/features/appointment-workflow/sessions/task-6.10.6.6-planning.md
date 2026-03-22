# Plan: task 6.10.6.6 — Bug fixes

## Contract
- **Tier:** task | **ID:** 6.10.6.6
- **Scope:** TimeBasisButtonGrid prop/label; useTimeSlotCalculations syntax; BookingWizard duplicate/template; useBookingWizardSetup useDhpBrandColors
- **Governance:** 1 governance highlight

## Where we left off
Task 6.10.6.5 complete; tab and form state wired.

## Goal
Fix any remaining bugs: TimeBasisButtonGrid — use startTimeType (not startTimeable); minor button shows minorLabel not majorLabel. useTimeSlotCalculations — fix syntax (e.g. minorEnd from minorStart.getTime()). BookingWizard — remove duplicate submitButtonLabel computed; fix broken template if any. useBookingWizardSetup — useDhpBrandColors from useWizardSettings (alias of useBrandColors). Verify each; many may already be correct from prior work.

## Files
- client/src/components/booking/TimeBasisButtonGrid.vue
- client/src/composables/booking/useTimeSlotCalculations.ts
- client/src/components/booking/BookingWizard.vue
- client/src/composables/booking/useBookingWizardSetup.ts

## Checkpoint
- No prop/label or syntax errors; single submitButtonLabel; useDhpBrandColors used correctly; lint passes.

---
## Reference
- TierUp guide: `sessions/session-6.10.6-guide.md`
