# Deprecation Audit Summary (Generated)

Generated from `.audit-reports/deprecation-audit.json`.

## Summary

- Files scanned: **599**
- Files with deprecations: **35**
- Total deprecation markers: **61**
- With replacement suggestion: **4**
- Without replacement: **57**

## Quick Wins (ready for cleanup)

| Deprecated | Replace With | File | Line |
| --- | --- | --- | ---: |
| `(unknown)` | `componentType` | `client/src/composables/admin/useFieldComponent.ts` | 67 |
| `(unknown)` | `componentType` | `client/src/composables/admin/useFieldComponent.ts` | 72 |
| `(unknown)` | `componentType` | `client/src/composables/admin/useFieldComponent.ts` | 77 |
| `(unknown)` | `componentType` | `client/src/composables/admin/useFieldComponent.ts` | 82 |

## Files by Priority

| File | Priority | Score | Deprecations | Ready |
| --- | --- | ---: | ---: | ---: |
| `client/src/composables/admin/useFieldComponent.ts` | P0 | 10 | 5 | 4 |
| `client/src/utils/appointmentFieldFormatters.ts` | P1 | 6 | 3 | 0 |
| `client/src/composables/booking/useAppointmentTimes.ts` | P1 | 4 | 4 | 0 |
| `client/src/composables/booking/useAvailabilityDefaults.ts` | P1 | 4 | 4 | 0 |
| `client/src/configs/field/form/fullFieldFormConfig.ts` | P1 | 4 | 2 | 0 |
| `client/src/types/appointment.ts` | P1 | 4 | 4 | 0 |
| `client/src/composables/booking/useTimeSlotCalculations.ts` | P2 | 3 | 3 | 0 |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | P2 | 3 | 3 | 0 |
| `client/src/components/booking/TimeSlotGrid.vue` | P2 | 2 | 2 | 0 |
| `client/src/composables/booking/selectionCard/useSelectionCardState.ts` | P2 | 2 | 2 | 0 |
| `client/src/composables/useAdmin.ts` | P2 | 2 | 2 | 0 |
| `client/src/composables/useRelationship.ts` | P2 | 2 | 2 | 0 |
| `client/src/utils/booking/appointmentSlotBuilder.ts` | P2 | 2 | 2 | 0 |
| `client/src/utils/forms/fieldSectionCategorization.ts` | P2 | 2 | 1 | 0 |
| `client/src/utils/transformers/annotationTransformers.ts` | P2 | 2 | 2 | 0 |
| `client/src/components/admin/generic/EntityFormContent.vue` | P2 | 1 | 1 | 0 |
| `client/src/components/booking/types/selectionCardTypes.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/admin/useShapeEditModal.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/admin/useStatusButtonToggle.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/booking/selectionCard/useSelectionCardConfig.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/booking/selectionCard/useSelectionCardHandlers.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/booking/useAppointmentDataCollection.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/booking/useAppointmentDuration.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/booking/useBookingWizardStepValidators.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/booking/useWizardDisplay.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/booking/useWizardFilteredOptions.ts` | P2 | 1 | 1 | 0 |
| `client/src/composables/useBookingWizard.ts` | P2 | 1 | 1 | 0 |
| `client/src/types/annotations.ts` | P2 | 1 | 1 | 0 |
| `client/src/types/property.ts` | P2 | 1 | 1 | 0 |
| `client/src/utils/differentialScheduling.ts` | P2 | 1 | 1 | 0 |
| `client/src/utils/iconMapper.ts` | P2 | 1 | 1 | 0 |
| `client/src/utils/transformers/appointmentToWizardTransformer.ts` | P2 | 1 | 1 | 0 |
| `client/src/utils/transformers/fetchToGlobalTransformer.ts` | P2 | 1 | 1 | 0 |
| `server/src/db/models/booking/annotation_instance.ts` | P2 | 1 | 1 | 0 |
| `server/src/routes/internal/index.ts` | P2 | 1 | 1 | 0 |

## Notes

- This is a *signal* index. Use the full report for details: `client/.audit-reports/deprecation-audit.md`.
- **Ready**: Deprecations with explicit replacement suggestions (safe to clean up)
- **P0**: High deprecation density (cleanup soon)
- **P1**: Moderate deprecations (schedule cleanup)
- **P2**: Low priority (cleanup when convenient)
