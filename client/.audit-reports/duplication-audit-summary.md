**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Duplication Audit Summary (Generated)

Generated from `client/.audit-reports/duplication-audit.json`.

## Index (ranked)

| Group | Priority | unique files | occurrences | lineCount | sample locations |
| --- | --- | ---: | ---: | ---: | --- |
| `dup-0d3194f54d5e` | P0 | 3 | 3 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@201`, `client/src/components/dev/DevPanelButtons.vue@9`, `client/src/composables/booking/useWizardDevMode.ts@62` |
| `dup-62f6fece13d9` | P0 | 3 | 3 | 10 | `server/src/db/models/booking/active_part.ts@62`, `server/src/db/models/booking/part_assignment.ts@62`, `server/src/db/models/booking/pricing_cascade.ts@71` |
| `dup-faf7bc22dbba` | P0 | 3 | 3 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@202`, `client/src/components/dev/DevPanelButtons.vue@10`, `client/src/composables/booking/useWizardDevMode.ts@63` |
| `dup-012f8e607c7e` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@15`, `server/src/utils/logger.ts@15` |
| `dup-01c6dc6fecc6` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@3`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@3` |
| `dup-02e09562fbee` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useMetadataFieldUpdates.ts@40`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@19` |
| `dup-0399e7cb7a09` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useMetadataFieldUpdates.ts@36`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@15` |
| `dup-081b9aedff50` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@12`, `server/src/db/models/booking/part_assignment.ts@12` |
| `dup-0865f1a90261` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@13`, `server/src/utils/logger.ts@13` |
| `dup-08e13972093b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@23`, `server/src/db/models/booking/part_assignment.ts@23` |
| `dup-09542cc2230d` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@143`, `server/src/db/models/admin/adminRelationshipMetadata.ts@143` |
| `dup-0b9d7afa76c5` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@95`, `server/src/db/models/booking/annotation_assignment.ts@95` |
| `dup-0bf0a50177b3` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@58`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@58` |
| `dup-0ce0fcfa2b32` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@70`, `server/src/db/models/booking/part_assignment.ts@70` |
| `dup-0f82ce62b6a4` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@48`, `server/src/db/models/booking/part_assignment.ts@48` |
| `dup-1153c9a07551` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@38`, `server/src/utils/logger.ts@38` |
| `dup-11c7ce0e1eb3` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@94`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@84` |
| `dup-11ee84441edb` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@57`, `server/src/db/models/booking/dependent_instance.ts@71` |
| `dup-1367027fb70b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@40`, `server/src/db/models/booking/annotation_assignment.ts@40` |
| `dup-1378fa017b30` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@20`, `server/src/db/models/admin/adminRelationshipMetadata.ts@20` |
| `dup-13bd9de36f5c` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@111`, `client/src/composables/booking/useDevPanelsComputed.ts@64` |
| `dup-1623de395200` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@18`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@18` |
| `dup-167a50aae37b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@92`, `server/src/db/models/booking/annotation_assignment.ts@92` |
| `dup-170c9613a9b4` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@105`, `server/src/utils/logger.ts@105` |
| `dup-19862ce3c011` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@44`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@44` |
| `dup-1b150958da28` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_event.ts@89`, `server/src/db/models/booking/event_assignment.ts@85` |
| `dup-1c871230a809` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@78`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@68` |
| `dup-1cfba42de794` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@27`, `server/src/db/models/booking/part_assignment.ts@27` |
| `dup-216670b622fd` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useMetadataFieldUpdates.ts@38`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@17` |
| `dup-21a75cb7636d` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@104`, `server/src/utils/logger.ts@104` |
| `dup-23647ee852f7` | P0 | 2 | 2 | 10 | `server/src/routes/internal/appointments/appointmentErrorHandler.ts@5`, `server/src/routes/internal/businessSettings/businessSettingsErrorHandler.ts@5` |
| `dup-255152a3acf3` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@50`, `server/src/db/models/booking/dependent_instance.ts@64` |
| `dup-25c4fc0e6f86` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_event.ts@86`, `server/src/db/models/booking/event_assignment.ts@82` |
| `dup-2635a23c068e` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@34`, `server/src/db/models/booking/annotation_assignment.ts@34` |
| `dup-26e714ea75f6` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@57`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@57` |
| `dup-2a12de2d7d9a` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@153`, `client/src/composables/admin/useRelationshipCollectionField.ts@187` |
| `dup-2a65fd444518` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/valid_part.ts@62`, `server/src/db/models/admin/valid_pricing_cascade.ts@62` |
| `dup-2b2b33d71fb7` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@101`, `server/src/db/models/booking/annotation_assignment.ts@101` |
| `dup-2d4fde3634cc` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@103`, `server/src/db/models/booking/annotation_assignment.ts@103` |
| `dup-2f0d71c66b5f` | P0 | 2 | 2 | 10 | `client/src/components/admin/generic/DynamicForm.vue@116`, `client/src/components/admin/generic/EntityFormContent.vue@72` |
| `dup-300418f10512` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@16`, `server/src/db/models/booking/part_assignment.ts@16` |
| `dup-3299a8a39f28` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@57`, `server/src/db/models/booking/part_assignment.ts@57` |
| `dup-34b250e9661c` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@5`, `server/src/db/models/booking/part_assignment.ts@5` |
| `dup-3a4204db7311` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@80`, `server/src/db/models/booking/annotation_assignment.ts@80` |
| `dup-3c3feb615be5` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@27`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@27` |
| `dup-3cd31b02359f` | P0 | 2 | 2 | 10 | `server/src/routes/internal/appointments/appointmentErrorHandler.ts@4`, `server/src/routes/internal/businessSettings/businessSettingsErrorHandler.ts@4` |
| `dup-3d5e90d04e43` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@21`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@21` |
| `dup-3dc860c9a055` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@89`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@79` |
| `dup-3e9ed4f71fb8` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@5`, `server/src/db/models/booking/annotation_assignment.ts@5` |
| `dup-3f27f65a2957` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@25`, `server/src/db/models/admin/adminRelationshipMetadata.ts@25` |
| `dup-3f58b83a17d5` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@89`, `server/src/utils/logger.ts@89` |
| `dup-40b2865e1777` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@78`, `server/src/db/models/booking/annotation_assignment.ts@78` |
| `dup-415cb3926ae7` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@8`, `server/src/utils/logger.ts@8` |
| `dup-42a7e92bfe71` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@42`, `server/src/db/models/booking/part_assignment.ts@42` |
| `dup-434e272ef180` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useMetadataFieldUpdates.ts@37`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@16` |
| `dup-44e54c77c1d0` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@54`, `server/src/db/models/booking/part_assignment.ts@54` |
| `dup-4640508818db` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@69`, `server/src/db/models/booking/annotation_assignment.ts@69` |
| `dup-4738ad70d5c5` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@76`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@66` |
| `dup-491600dcdd86` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@141`, `client/src/composables/booking/useDevPanelsComputed.ts@98` |
| `dup-4aa5341ce55e` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@12`, `server/src/utils/logger.ts@12` |
| `dup-4ade4938dbd6` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@71`, `server/src/db/models/booking/part_assignment.ts@71` |
| `dup-4baff23bfa03` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@17`, `server/src/db/models/booking/part_assignment.ts@17` |
| `dup-4fbc1a3ecca3` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@33`, `server/src/db/models/booking/annotation_assignment.ts@33` |
| `dup-517ae3d50ebd` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@20`, `server/src/db/models/booking/part_assignment.ts@20` |
| `dup-5295d294d7e8` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@81`, `server/src/utils/logger.ts@81` |
| `dup-52aeb7b2409b` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@101`, `server/src/utils/logger.ts@101` |
| `dup-5357695ceb25` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@31`, `server/src/db/models/booking/part_assignment.ts@31` |
| `dup-571e47173927` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@24`, `server/src/db/models/admin/adminRelationshipMetadata.ts@24` |
| `dup-57cb8101b2d0` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@116`, `client/src/composables/booking/useDevPanelsComputed.ts@70` |
| `dup-583ff7c1339f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@50`, `server/src/db/models/booking/part_assignment.ts@50` |
| `dup-585b6e1518f6` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@46`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@46` |
| `dup-58a942924a7f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@65`, `server/src/db/models/booking/part_assignment.ts@65` |
| `dup-5919a7ba6f4f` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@21`, `server/src/db/models/admin/adminRelationshipMetadata.ts@21` |
| `dup-5be0c8b6059f` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@96`, `server/src/utils/logger.ts@96` |
| `dup-5c65aaec0c76` | P0 | 2 | 2 | 10 | `client/src/views/admin/tabs/InstancesTab.vue@231`, `server/src/services/invites/inviteContextBuilder.ts@73` |
| `dup-5cdea5a5f126` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@22`, `client/src/composables/admin/useRelationshipCollectionField.ts@22` |
| `dup-5f16dadf24a4` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@26`, `server/src/db/models/booking/part_assignment.ts@26` |
| `dup-607dbfada292` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@36`, `server/src/db/models/booking/annotation_assignment.ts@36` |
| `dup-64dbb42781d9` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@76`, `server/src/db/models/booking/annotation_assignment.ts@76` |
| `dup-66ed3e074ab7` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@26`, `server/src/db/models/admin/adminRelationshipMetadata.ts@26` |
| `dup-6715a6f0ce6e` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@5`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@5` |
| `dup-67a28d0e7cc3` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@99`, `server/src/utils/logger.ts@99` |
| `dup-682f99af6e72` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@94`, `server/src/db/models/booking/annotation_assignment.ts@94` |
| `dup-6cf9d1c1b711` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@19`, `server/src/db/models/booking/part_assignment.ts@19` |
| `dup-6d750f7d4ddf` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@22`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@22` |
| `dup-6dfd558d0cb9` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@41`, `server/src/db/models/booking/annotation_assignment.ts@41` |
| `dup-6ed64d910e29` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@89`, `server/src/db/models/booking/annotation_assignment.ts@89` |
| `dup-6fce020e349a` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@13`, `server/src/db/models/booking/part_assignment.ts@13` |
| `dup-7078d29bf62a` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_event.ts@92`, `server/src/db/models/booking/event_assignment.ts@88` |
| `dup-71a2d7890e8c` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@37`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@37` |
| `dup-72bdf59c3d9e` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@15`, `server/src/db/models/booking/part_assignment.ts@15` |
| `dup-738cf7ce032b` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@23`, `server/src/db/models/admin/adminRelationshipMetadata.ts@23` |
| `dup-7440b900d77e` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@103`, `server/src/utils/logger.ts@103` |
| `dup-7446fdc411b8` | P0 | 2 | 2 | 10 | `client/src/components/admin/generic/DynamicForm.vue@122`, `client/src/components/admin/generic/EntityFormContent.vue@78` |
| `dup-748c615eda5b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@86`, `server/src/db/models/booking/annotation_assignment.ts@86` |
| `dup-768c9405e523` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@15`, `server/src/config/models.ts@15` |
| `dup-7742cf114a0e` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@45`, `server/src/db/models/booking/annotation_assignment.ts@45` |
| `dup-786c6113291a` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@90`, `server/src/utils/logger.ts@90` |
| `dup-789fe0547a08` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@38`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@38` |
| `dup-7905ed6bf9e3` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@74`, `server/src/db/models/booking/part_assignment.ts@74` |
| `dup-7a8b0909418a` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@100`, `server/src/utils/logger.ts@100` |
| `dup-7c1fb46c98e0` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@44`, `server/src/db/models/booking/dependent_instance.ts@58` |
| `dup-7c9f330ab677` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@100`, `server/src/db/models/booking/annotation_assignment.ts@100` |
| `dup-7d9fbf46e5bb` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@91`, `server/src/utils/logger.ts@91` |
| `dup-7e33019700a9` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@36`, `server/src/db/models/booking/part_assignment.ts@36` |
| `dup-7f20c361004d` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@71`, `server/src/db/models/booking/annotation_assignment.ts@71` |
| `dup-7f9769d64d4f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@38`, `server/src/db/models/booking/part_assignment.ts@38` |
| `dup-83503ffea37c` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@95`, `server/src/utils/logger.ts@95` |
| `dup-838f910a5e1e` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@42`, `server/src/db/models/booking/dependent_instance.ts@56` |
| `dup-84870ac20687` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@145`, `server/src/db/models/admin/adminRelationshipMetadata.ts@145` |
| `dup-87a24bca5330` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@52`, `server/src/db/models/booking/annotation_assignment.ts@52` |
| `dup-87f18ec86cc2` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@20`, `server/src/config/models.ts@20` |
| `dup-88e0e0d4b85e` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@142`, `server/src/db/models/admin/adminRelationshipMetadata.ts@142` |
| `dup-897f5b967c01` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@40`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@40` |
| `dup-8ad814664764` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@60`, `server/src/db/models/booking/annotation_assignment.ts@60` |
| `dup-8d2c77b38df3` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@43`, `server/src/db/models/booking/annotation_assignment.ts@43` |
| `dup-8d75f613d719` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@48`, `server/src/db/models/booking/annotation_assignment.ts@48` |
| `dup-8e4f63387c7f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@21`, `server/src/db/models/booking/part_assignment.ts@21` |
| `dup-8e5092288112` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@76`, `server/src/db/models/booking/part_assignment.ts@76` |
| `dup-8fb3895862cc` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@30`, `server/src/db/models/booking/part_assignment.ts@30` |
| `dup-911d1500cc08` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@149`, `client/src/composables/admin/useRelationshipCollectionField.ts@183` |
| `dup-91fb8e80409b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@9`, `server/src/db/models/booking/annotation_assignment.ts@9` |
| `dup-92552b3bde79` | P0 | 2 | 2 | 10 | `server/src/routes/internal/appointments/appointmentErrorHandler.ts@7`, `server/src/routes/internal/businessSettings/businessSettingsErrorHandler.ts@7` |
| `dup-9391069f4417` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@14`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@14` |
| `dup-93e0dd55b86d` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@11`, `server/src/utils/logger.ts@11` |
| `dup-9445fd19c2cb` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@22`, `server/src/db/models/booking/part_assignment.ts@22` |
| `dup-96f6b365bd76` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@11`, `server/src/db/models/booking/part_assignment.ts@11` |
| `dup-9898a3bd82ce` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@108`, `server/src/db/models/booking/annotation_assignment.ts@108` |
| `dup-9b05a520b6ad` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@79`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@69` |
| `dup-9c0f543a08e7` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@57`, `server/src/db/models/booking/annotation_assignment.ts@57` |
| `dup-9c56b47c5ce7` | P0 | 2 | 2 | 10 | `client/src/components/admin/generic/DynamicForm.vue@117`, `client/src/components/admin/generic/EntityFormContent.vue@73` |
| `dup-9c70b13d8940` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@48`, `server/src/db/models/booking/dependent_instance.ts@62` |
| `dup-9c923e520a59` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@58`, `server/src/db/models/booking/annotation_assignment.ts@58` |
| `dup-9e074c09ad5f` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@84`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@74` |
| `dup-9e2d676f7757` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@10`, `server/src/config/models.ts@10` |
| `dup-a003e948a6aa` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@87`, `server/src/utils/logger.ts@87` |
| `dup-a08a21eabaf1` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@21`, `client/src/composables/admin/useRelationshipCollectionField.ts@21` |
| `dup-a14638a4599e` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@43`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@43` |
| `dup-a1cf315461f9` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@104`, `server/src/db/models/booking/annotation_assignment.ts@104` |
| `dup-a2ca7ff4536c` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@39`, `server/src/db/models/booking/annotation_assignment.ts@39` |
| `dup-aa0673e4a618` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@97`, `server/src/utils/logger.ts@97` |
| `dup-ac0c8bcb9ef7` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@85`, `server/src/utils/logger.ts@85` |
| `dup-ac464e938825` | P0 | 2 | 2 | 10 | `client/src/components/admin/generic/DynamicForm.vue@121`, `client/src/components/admin/generic/EntityFormContent.vue@77` |
| `dup-ad8ee8be63f6` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@23`, `client/src/composables/admin/useRelationshipCollectionField.ts@23` |
| `dup-b310fa6a5478` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@62`, `server/src/db/models/booking/dependent_instance.ts@76` |
| `dup-b32e32aa5499` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@37`, `server/src/db/models/booking/annotation_assignment.ts@37` |
| `dup-b36fd2f2d669` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@26`, `client/src/composables/admin/useRelationshipCollectionField.ts@26` |
| `dup-b579c99d5cc7` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@143`, `client/src/composables/booking/useDevPanelsComputed.ts@100` |
| `dup-b86f2e99d1d4` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@67`, `server/src/db/models/booking/annotation_assignment.ts@67` |
| `dup-bad84b2c682c` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@90`, `server/src/db/models/admin/adminRelationshipMetadata.ts@90` |
| `dup-c2ccd09b612f` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@9`, `server/src/config/models.ts@9` |
| `dup-c3bfbb3d2b99` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@115`, `client/src/composables/booking/useDevPanelsComputed.ts@69` |
| `dup-c4bf4c36371c` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@92`, `server/src/utils/logger.ts@92` |
| `dup-c6d8bfa75306` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@38`, `server/src/db/models/booking/annotation_assignment.ts@38` |
| `dup-c927166d7ba6` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@9`, `server/src/utils/logger.ts@9` |
| `dup-caf8771d9453` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@83`, `server/src/db/models/booking/annotation_assignment.ts@83` |
| `dup-cba50e578559` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@36`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@36` |
| `dup-ce5391d88e5e` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@15`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@15` |
| `dup-d2a4760db264` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@88`, `server/src/db/models/booking/annotation_assignment.ts@88` |
| `dup-d2e396c8c745` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@44`, `server/src/db/models/booking/part_assignment.ts@44` |
| `dup-d3c2dde7f3ef` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@16`, `server/src/config/models.ts@16` |
| `dup-d51a76184eba` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@7`, `server/src/utils/logger.ts@7` |
| `dup-d53b50a09cd3` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@42`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@42` |
| `dup-d84d408e941d` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@87`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@77` |
| `dup-d9d632b9117f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@9`, `server/src/db/models/booking/part_assignment.ts@9` |
| `dup-e00b05d38585` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@22`, `server/src/db/models/admin/adminRelationshipMetadata.ts@22` |
| `dup-e09e0d444595` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@37`, `server/src/utils/logger.ts@37` |
| `dup-e1a6e03d7f3a` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@82`, `server/src/utils/logger.ts@82` |
| `dup-e3caae627120` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@32`, `server/src/db/models/booking/annotation_assignment.ts@32` |
| `dup-e56a167dd19b` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@140`, `server/src/db/models/admin/adminRelationshipMetadata.ts@140` |
| `dup-e5b2fcfb4c12` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@22`, `server/src/utils/logger.ts@22` |
| `dup-e6066dad7651` | P0 | 2 | 2 | 10 | `server/src/routes/internal/appointments/appointmentErrorHandler.ts@6`, `server/src/routes/internal/businessSettings/businessSettingsErrorHandler.ts@6` |
| `dup-e6518a60a813` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@139`, `server/src/db/models/admin/adminRelationshipMetadata.ts@139` |
| `dup-e66dda309250` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@49`, `server/src/db/models/booking/annotation_assignment.ts@49` |
| `dup-e6855ed054d2` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@82`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@72` |
| `dup-eb2b738c66fb` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@91`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@81` |
| `dup-edbbfadef6b1` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@75`, `server/src/db/models/booking/annotation_assignment.ts@75` |
| `dup-ef36d1842f4c` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@54`, `server/src/db/models/booking/dependent_instance.ts@68` |
| `dup-f1427c3d6e1f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@18`, `server/src/db/models/booking/part_assignment.ts@18` |
| `dup-f5dc7d13d6e7` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@24`, `client/src/composables/admin/useRelationshipCollectionField.ts@24` |
| `dup-f64b1e963ecf` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@78`, `server/src/utils/logger.ts@78` |
| `dup-f81c117e758b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@44`, `server/src/db/models/booking/annotation_assignment.ts@44` |
| `dup-f8795e4e519a` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@47`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@47` |
| `dup-f9a3992c8e03` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@53`, `server/src/db/models/booking/annotation_assignment.ts@53` |
| `dup-fa6bd8610aac` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@140`, `client/src/composables/booking/useDevPanelsComputed.ts@97` |
| `dup-fa6ed9d1e9b6` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@90`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@80` |
| `dup-fbba05bd59fa` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@86`, `server/src/utils/logger.ts@86` |
| `dup-fc98913933df` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@14`, `server/src/utils/logger.ts@14` |
| `dup-fc9e038f8773` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@45`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@45` |
| `dup-fd9c1d4a0602` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@62`, `server/src/db/models/booking/annotation_assignment.ts@62` |

## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/duplication-audit.md`.
