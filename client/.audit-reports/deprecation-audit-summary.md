# Deprecation Audit Summary (Generated)

Generated from `.audit-reports/deprecation-audit.json`.

## Summary

- Files scanned: **600**
- Files with deprecations: **44**
- Total deprecation markers: **83**
- With replacement suggestion: **18**
- Without replacement: **65**

## Quick Wins (ready for cleanup)

| Deprecated | Replace With | File | Line |
| --- | --- | --- | ---: |
| `(unknown)` | `componentType` | `client/src/composables/admin/useFieldComponent.ts` | 233 |
| `(unknown)` | `FieldMetadataConfig` | `client/src/composables/admin/useFieldMetadataUpdate.ts` | 18 |
| `(unknown)` | `AppointmentSlotsPerDay` | `client/src/composables/booking/useAvailabilityLogic.ts` | 417 |
| `(unknown)` | `useBusyTimes` | `client/src/composables/booking/useBusyTimes.ts` | 184 |
| `selectedPropertyTypeBlockIds` | `selectedPropertyIds` | `client/src/types/appointment.ts` | 344 |
| `selectedOptionTypeBlocks` | `selectedOptionIds` | `client/src/types/appointment.ts` | 347 |
| `serviceSnapshots` | `serviceSnapshotIds` | `client/src/types/appointment.ts` | 350 |
| `propertySnapshots` | `propertySnapshotIds` | `client/src/types/appointment.ts` | 351 |
| `optionTypeBlockSnapshots` | `optionSnapshots` | `client/src/types/appointment.ts` | 352 |
| `optionSnapshots` | `optionSnapshotIds` | `client/src/types/appointment.ts` | 353 |
| `userTypeBlock` | `annotation_assignments` | `client/src/types/entities.ts` | 76 |
| `(unknown)` | `getStateControlBlockInstanceOptions` | `client/src/utils/annotationUtils.ts` | 108 |
| `(unknown)` | `getDynamicEntityDefaults` | `client/src/utils/entityDefaults.ts` | 127 |
| `(unknown)` | `getCalendarAvailability` | `client/src/utils/timeSlotCalculations.ts` | 286 |
| `(unknown)` | `serviceSnapshotIds` | `server/src/db/models/booking/appointment.ts` | 41 |

*... and 3 more. See full report.*

## Files by Priority

| File | Priority | Score | Deprecations | Ready |
| --- | --- | ---: | ---: | ---: |
| `client/src/types/appointment.ts` | P0 | 26 | 15 | 6 |
| `server/src/db/models/booking/appointment.ts` | P1 | 6 | 3 | 3 |
| `client/src/composables/admin/useFieldComponent.ts` | P1 | 4 | 2 | 1 |
| `client/src/composables/booking/useAppointmentTimes.ts` | P1 | 4 | 4 | 0 |
| `client/src/composables/booking/useAvailabilityDefaults.ts` | P1 | 4 | 4 | 0 |
| `client/src/configs/field/form/fullFieldFormConfig.ts` | P1 | 4 | 2 | 0 |
| `client/src/utils/timeSlotCalculations.ts` | P1 | 4 | 3 | 1 |
| `server/src/db/models/booking/property.ts` | P1 | 4 | 2 | 1 |
| `client/src/composables/admin/useFieldMetadataUpdate.ts` | P2 | 3 | 2 | 1 |
| `client/src/composables/booking/useBusyTimes.ts` | P2 | 3 | 2 | 1 |
| `client/src/composables/booking/useTimeSlotCalculations.ts` | P2 | 3 | 3 | 0 |
| `client/src/utils/transformers/globalToBookingTransformer.ts` | P2 | 3 | 3 | 0 |
| `client/src/components/booking/TimeSlotGrid.vue` | P2 | 2 | 2 | 0 |
| `client/src/composables/booking/selectionCard/useSelectionCardState.ts` | P2 | 2 | 2 | 0 |
| `client/src/composables/booking/useAvailabilityLogic.ts` | P2 | 2 | 1 | 1 |
| `client/src/composables/useAdmin.ts` | P2 | 2 | 2 | 0 |
| `client/src/composables/useRelationship.ts` | P2 | 2 | 2 | 0 |
| `client/src/types/entities.ts` | P2 | 2 | 1 | 1 |
| `client/src/utils/annotationUtils.ts` | P2 | 2 | 1 | 1 |
| `client/src/utils/booking/appointmentSlotBuilder.ts` | P2 | 2 | 2 | 0 |
| `client/src/utils/entityDefaults.ts` | P2 | 2 | 1 | 1 |
| `client/src/utils/forms/fieldSectionCategorization.ts` | P2 | 2 | 1 | 0 |
| `client/src/utils/transformers/annotationTransformers.ts` | P2 | 2 | 2 | 0 |
| `server/src/db/models/index.ts` | P2 | 2 | 1 | 0 |
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
