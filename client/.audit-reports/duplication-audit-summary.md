**Instructions for AI / tooling:** Treat the findings in this report as canonical. Do not plan or change the audit scripts unless you have asked the user and received explicit approval to do so.

**When fixing a finding:** Search the codebase for the same rule or pattern (same ruleId or equivalent) and fix all similar occurrences consistently. Ensure the fix does not introduce new violations of this or related rules.


# Duplication Audit Summary (Generated)

Generated from `client/.audit-reports/duplication-audit.json`.

## Index (ranked)

| Group | Priority | unique files | occurrences | lineCount | sample locations |
| --- | --- | ---: | ---: | ---: | --- |
| `dup-132c63251d30` | P0 | 4 | 10 | 10 | `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@74`, `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataHelpers.ts@24`, `server/src/utils/adminPrimitiveMetadataComposer.ts@33`, … |
| `dup-3000bf634a1d` | P0 | 4 | 10 | 10 | `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@75`, `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataHelpers.ts@25`, `server/src/utils/adminPrimitiveMetadataComposer.ts@34`, … |
| `dup-00c9105755d8` | P0 | 3 | 3 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@53`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@53`, `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataValidators.ts@53` |
| `dup-0d3194f54d5e` | P0 | 3 | 3 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@209`, `client/src/components/dev/DevPanelButtons.vue@16`, `client/src/composables/booking/useWizardDevMode.ts@70` |
| `dup-0df82f50465a` | P0 | 3 | 3 | 10 | `server/src/utils/adminMetadataComposer.ts@135`, `server/src/utils/adminPrimitiveMetadataComposer.ts@112`, `server/src/utils/adminRelationshipMetadataComposer.ts@116` |
| `dup-433b7c717ff1` | P0 | 3 | 3 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@52`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@52`, `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataValidators.ts@52` |
| `dup-4e4d3c29d4fd` | P0 | 3 | 3 | 10 | `server/src/utils/adminMetadataComposer.ts@134`, `server/src/utils/adminPrimitiveMetadataComposer.ts@111`, `server/src/utils/adminRelationshipMetadataComposer.ts@115` |
| `dup-62f6fece13d9` | P0 | 3 | 3 | 10 | `server/src/db/models/booking/active_part.ts@72`, `server/src/db/models/booking/part_assignment.ts@72`, `server/src/db/models/booking/pricing_cascade.ts@72` |
| `dup-69c0d3151348` | P0 | 3 | 3 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@50`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@50`, `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataValidators.ts@50` |
| `dup-b91a6eb83ee2` | P0 | 3 | 3 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@48`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@48`, `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataValidators.ts@48` |
| `dup-faf7bc22dbba` | P0 | 3 | 3 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@210`, `client/src/components/dev/DevPanelButtons.vue@17`, `client/src/composables/booking/useWizardDevMode.ts@71` |
| `dup-af67935eba71` | P0 | 2 | 4 | 10 | `server/src/utils/adminPrimitiveMetadataComposer.ts@81`, `server/src/utils/adminPrimitiveMetadataComposer.ts@97`, `server/src/utils/adminRelationshipMetadataComposer.ts@85`, … |
| `dup-012f8e607c7e` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@32`, `server/src/utils/logger.ts@32` |
| `dup-02e09562fbee` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useMetadataFieldUpdates.ts@51`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@36` |
| `dup-0399e7cb7a09` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useMetadataFieldUpdates.ts@47`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@32` |
| `dup-054b5d13687d` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@65`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@65` |
| `dup-0650894690ad` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@73`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@73` |
| `dup-067a7f23cd4b` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@46`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@46` |
| `dup-081b9aedff50` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@22`, `server/src/db/models/booking/part_assignment.ts@22` |
| `dup-0865f1a90261` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@30`, `server/src/utils/logger.ts@30` |
| `dup-08e13972093b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@33`, `server/src/db/models/booking/part_assignment.ts@33` |
| `dup-09542cc2230d` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@150`, `server/src/db/models/admin/adminRelationshipMetadata.ts@148` |
| `dup-09b54b2c0516` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@47`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@47` |
| `dup-0b9d7afa76c5` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@97`, `server/src/db/models/booking/annotation_assignment.ts@97` |
| `dup-0bf0a50177b3` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@86`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@86` |
| `dup-0ce0fcfa2b32` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@80`, `server/src/db/models/booking/part_assignment.ts@80` |
| `dup-0f82ce62b6a4` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@58`, `server/src/db/models/booking/part_assignment.ts@58` |
| `dup-0fa97a246cb3` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@57`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@57` |
| `dup-1153c9a07551` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@56`, `server/src/utils/logger.ts@56` |
| `dup-11c7ce0e1eb3` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@102`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@91` |
| `dup-11ee84441edb` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@69`, `server/src/db/models/booking/dependent_instance.ts@73` |
| `dup-1367027fb70b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@42`, `server/src/db/models/booking/annotation_assignment.ts@42` |
| `dup-1378fa017b30` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@27`, `server/src/db/models/admin/adminRelationshipMetadata.ts@25` |
| `dup-13bd9de36f5c` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@119`, `client/src/composables/booking/useDevPanelsComputed.ts@67` |
| `dup-1623de395200` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@25`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@25` |
| `dup-167a50aae37b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@94`, `server/src/db/models/booking/annotation_assignment.ts@94` |
| `dup-170c9613a9b4` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@128`, `server/src/utils/logger.ts@128` |
| `dup-180c0392849d` | P0 | 2 | 2 | 10 | `server/src/utils/adminPrimitiveMetadataComposer.ts@54`, `server/src/utils/adminRelationshipMetadataComposer.ts@58` |
| `dup-1b150958da28` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_event.ts@91`, `server/src/db/models/booking/event_assignment.ts@87` |
| `dup-1c871230a809` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@86`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@75` |
| `dup-1cfba42de794` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@37`, `server/src/db/models/booking/part_assignment.ts@37` |
| `dup-216670b622fd` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useMetadataFieldUpdates.ts@49`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@34` |
| `dup-21a75cb7636d` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@127`, `server/src/utils/logger.ts@127` |
| `dup-23647ee852f7` | P0 | 2 | 2 | 10 | `server/src/routes/internal/appointments/appointmentErrorHandler.ts@12`, `server/src/routes/internal/businessSettings/businessSettingsErrorHandler.ts@12` |
| `dup-255152a3acf3` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@62`, `server/src/db/models/booking/dependent_instance.ts@66` |
| `dup-25c4fc0e6f86` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_event.ts@88`, `server/src/db/models/booking/event_assignment.ts@84` |
| `dup-2635a23c068e` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@36`, `server/src/db/models/booking/annotation_assignment.ts@36` |
| `dup-26e714ea75f6` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@85`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@85` |
| `dup-2a12de2d7d9a` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@229`, `client/src/composables/admin/useRelationshipCollectionField.ts@282` |
| `dup-2a65fd444518` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/valid_part.ts@72`, `server/src/db/models/admin/valid_pricing_cascade.ts@71` |
| `dup-2b2b33d71fb7` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@103`, `server/src/db/models/booking/annotation_assignment.ts@103` |
| `dup-2d4fde3634cc` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@105`, `server/src/db/models/booking/annotation_assignment.ts@105` |
| `dup-2f0d71c66b5f` | P0 | 2 | 2 | 10 | `client/src/components/admin/generic/DynamicForm.vue@154`, `client/src/components/admin/generic/EntityFormContent.vue@86` |
| `dup-300418f10512` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@26`, `server/src/db/models/booking/part_assignment.ts@26` |
| `dup-3299a8a39f28` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@67`, `server/src/db/models/booking/part_assignment.ts@67` |
| `dup-34b250e9661c` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@5`, `server/src/db/models/booking/part_assignment.ts@5` |
| `dup-3a4204db7311` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@82`, `server/src/db/models/booking/annotation_assignment.ts@82` |
| `dup-3cd31b02359f` | P0 | 2 | 2 | 10 | `server/src/routes/internal/appointments/appointmentErrorHandler.ts@11`, `server/src/routes/internal/businessSettings/businessSettingsErrorHandler.ts@11` |
| `dup-3dc860c9a055` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@97`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@86` |
| `dup-3e9ed4f71fb8` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@5`, `server/src/db/models/booking/annotation_assignment.ts@5` |
| `dup-3f27f65a2957` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@32`, `server/src/db/models/admin/adminRelationshipMetadata.ts@30` |
| `dup-3f58b83a17d5` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@112`, `server/src/utils/logger.ts@112` |
| `dup-40b2865e1777` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@80`, `server/src/db/models/booking/annotation_assignment.ts@80` |
| `dup-415cb3926ae7` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@25`, `server/src/utils/logger.ts@25` |
| `dup-42a7e92bfe71` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@52`, `server/src/db/models/booking/part_assignment.ts@52` |
| `dup-434e272ef180` | P0 | 2 | 2 | 10 | `client/src/composables/admin/useMetadataFieldUpdates.ts@48`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@33` |
| `dup-44e54c77c1d0` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@64`, `server/src/db/models/booking/part_assignment.ts@64` |
| `dup-4640508818db` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@71`, `server/src/db/models/booking/annotation_assignment.ts@71` |
| `dup-4738ad70d5c5` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@84`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@73` |
| `dup-491600dcdd86` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@149`, `client/src/composables/booking/useDevPanelsComputed.ts@101` |
| `dup-4aa5341ce55e` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@29`, `server/src/utils/logger.ts@29` |
| `dup-4ade4938dbd6` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@81`, `server/src/db/models/booking/part_assignment.ts@81` |
| `dup-4baff23bfa03` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@27`, `server/src/db/models/booking/part_assignment.ts@27` |
| `dup-4fbc1a3ecca3` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@35`, `server/src/db/models/booking/annotation_assignment.ts@35` |
| `dup-517ae3d50ebd` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@30`, `server/src/db/models/booking/part_assignment.ts@30` |
| `dup-5295d294d7e8` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@104`, `server/src/utils/logger.ts@104` |
| `dup-52aeb7b2409b` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@124`, `server/src/utils/logger.ts@124` |
| `dup-5357695ceb25` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@41`, `server/src/db/models/booking/part_assignment.ts@41` |
| `dup-55b5877b8e57` | P0 | 2 | 2 | 10 | `server/src/utils/adminPrimitiveMetadataComposer.ts@36`, `server/src/utils/adminRelationshipMetadataComposer.ts@40` |
| `dup-571e47173927` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@31`, `server/src/db/models/admin/adminRelationshipMetadata.ts@29` |
| `dup-57cb8101b2d0` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@124`, `client/src/composables/booking/useDevPanelsComputed.ts@73` |
| `dup-583ff7c1339f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@60`, `server/src/db/models/booking/part_assignment.ts@60` |
| `dup-58a942924a7f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@75`, `server/src/db/models/booking/part_assignment.ts@75` |
| `dup-5919a7ba6f4f` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@28`, `server/src/db/models/admin/adminRelationshipMetadata.ts@26` |
| `dup-5be0c8b6059f` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@119`, `server/src/utils/logger.ts@119` |
| `dup-5cdea5a5f126` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@34`, `client/src/composables/admin/useRelationshipCollectionField.ts@35` |
| `dup-5f16dadf24a4` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@36`, `server/src/db/models/booking/part_assignment.ts@36` |
| `dup-607dbfada292` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@38`, `server/src/db/models/booking/annotation_assignment.ts@38` |
| `dup-64dbb42781d9` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@78`, `server/src/db/models/booking/annotation_assignment.ts@78` |
| `dup-66ed3e074ab7` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@33`, `server/src/db/models/admin/adminRelationshipMetadata.ts@31` |
| `dup-67a28d0e7cc3` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@122`, `server/src/utils/logger.ts@122` |
| `dup-682f99af6e72` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@96`, `server/src/db/models/booking/annotation_assignment.ts@96` |
| `dup-6c77005d3647` | P0 | 2 | 2 | 10 | `server/src/utils/adminPrimitiveMetadataComposer.ts@52`, `server/src/utils/adminRelationshipMetadataComposer.ts@56` |
| `dup-6cf9d1c1b711` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@29`, `server/src/db/models/booking/part_assignment.ts@29` |
| `dup-6dfd558d0cb9` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@43`, `server/src/db/models/booking/annotation_assignment.ts@43` |
| `dup-6ed64d910e29` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@91`, `server/src/db/models/booking/annotation_assignment.ts@91` |
| `dup-6fce020e349a` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@23`, `server/src/db/models/booking/part_assignment.ts@23` |
| `dup-7078d29bf62a` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_event.ts@94`, `server/src/db/models/booking/event_assignment.ts@90` |
| `dup-72bdf59c3d9e` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@25`, `server/src/db/models/booking/part_assignment.ts@25` |
| `dup-738cf7ce032b` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@30`, `server/src/db/models/admin/adminRelationshipMetadata.ts@28` |
| `dup-7440b900d77e` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@126`, `server/src/utils/logger.ts@126` |
| `dup-7446fdc411b8` | P0 | 2 | 2 | 10 | `client/src/components/admin/generic/DynamicForm.vue@160`, `client/src/components/admin/generic/EntityFormContent.vue@92` |
| `dup-748c615eda5b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@88`, `server/src/db/models/booking/annotation_assignment.ts@88` |
| `dup-768c9405e523` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@15`, `server/src/config/models.ts@15` |
| `dup-7742cf114a0e` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@47`, `server/src/db/models/booking/annotation_assignment.ts@47` |
| `dup-786c6113291a` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@113`, `server/src/utils/logger.ts@113` |
| `dup-7905ed6bf9e3` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@84`, `server/src/db/models/booking/part_assignment.ts@84` |
| `dup-7a8b0909418a` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@123`, `server/src/utils/logger.ts@123` |
| `dup-7c1fb46c98e0` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@56`, `server/src/db/models/booking/dependent_instance.ts@60` |
| `dup-7c202ef97610` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@29`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@29` |
| `dup-7c9f330ab677` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@102`, `server/src/db/models/booking/annotation_assignment.ts@102` |
| `dup-7d9fbf46e5bb` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@114`, `server/src/utils/logger.ts@114` |
| `dup-7e33019700a9` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@46`, `server/src/db/models/booking/part_assignment.ts@46` |
| `dup-7f20c361004d` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@73`, `server/src/db/models/booking/annotation_assignment.ts@73` |
| `dup-7f9769d64d4f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@48`, `server/src/db/models/booking/part_assignment.ts@48` |
| `dup-83503ffea37c` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@118`, `server/src/utils/logger.ts@118` |
| `dup-838f910a5e1e` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@54`, `server/src/db/models/booking/dependent_instance.ts@58` |
| `dup-84870ac20687` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@152`, `server/src/db/models/admin/adminRelationshipMetadata.ts@150` |
| `dup-858445fb9a60` | P0 | 2 | 2 | 10 | `server/src/utils/adminPrimitiveMetadataComposer.ts@35`, `server/src/utils/adminRelationshipMetadataComposer.ts@39` |
| `dup-87a24bca5330` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@54`, `server/src/db/models/booking/annotation_assignment.ts@54` |
| `dup-87f18ec86cc2` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@20`, `server/src/config/models.ts@20` |
| `dup-88e0e0d4b85e` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@149`, `server/src/db/models/admin/adminRelationshipMetadata.ts@147` |
| `dup-8947a6ba4d82` | P0 | 2 | 2 | 10 | `server/src/utils/adminPrimitiveMetadataComposer.ts@53`, `server/src/utils/adminRelationshipMetadataComposer.ts@57` |
| `dup-8ad814664764` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@62`, `server/src/db/models/booking/annotation_assignment.ts@62` |
| `dup-8d2c77b38df3` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@45`, `server/src/db/models/booking/annotation_assignment.ts@45` |
| `dup-8d75f613d719` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@50`, `server/src/db/models/booking/annotation_assignment.ts@50` |
| `dup-8e4f63387c7f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@31`, `server/src/db/models/booking/part_assignment.ts@31` |
| `dup-8e5092288112` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@86`, `server/src/db/models/booking/part_assignment.ts@86` |
| `dup-8fb3895862cc` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@40`, `server/src/db/models/booking/part_assignment.ts@40` |
| `dup-911d1500cc08` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@225`, `client/src/composables/admin/useRelationshipCollectionField.ts@278` |
| `dup-91fb8e80409b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@9`, `server/src/db/models/booking/annotation_assignment.ts@9` |
| `dup-92552b3bde79` | P0 | 2 | 2 | 10 | `server/src/routes/internal/appointments/appointmentErrorHandler.ts@14`, `server/src/routes/internal/businessSettings/businessSettingsErrorHandler.ts@14` |
| `dup-9391069f4417` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@21`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@21` |
| `dup-93e0dd55b86d` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@28`, `server/src/utils/logger.ts@28` |
| `dup-9445fd19c2cb` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@32`, `server/src/db/models/booking/part_assignment.ts@32` |
| `dup-9646ef22a0ba` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@62`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@62` |
| `dup-96b4794c0ffb` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@28`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@28` |
| `dup-96f6b365bd76` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@21`, `server/src/db/models/booking/part_assignment.ts@21` |
| `dup-9898a3bd82ce` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@110`, `server/src/db/models/booking/annotation_assignment.ts@110` |
| `dup-9b05a520b6ad` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@87`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@76` |
| `dup-9c0f543a08e7` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@59`, `server/src/db/models/booking/annotation_assignment.ts@59` |
| `dup-9c56b47c5ce7` | P0 | 2 | 2 | 10 | `client/src/components/admin/generic/DynamicForm.vue@155`, `client/src/components/admin/generic/EntityFormContent.vue@87` |
| `dup-9c70b13d8940` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@60`, `server/src/db/models/booking/dependent_instance.ts@64` |
| `dup-9c923e520a59` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@60`, `server/src/db/models/booking/annotation_assignment.ts@60` |
| `dup-9e074c09ad5f` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@92`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@81` |
| `dup-9e216e560354` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@68`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@68` |
| `dup-9e2d676f7757` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@10`, `server/src/config/models.ts@10` |
| `dup-9f579fadeb7d` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@34`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@34` |
| `dup-a003e948a6aa` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@110`, `server/src/utils/logger.ts@110` |
| `dup-a08a21eabaf1` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@33`, `client/src/composables/admin/useRelationshipCollectionField.ts@34` |
| `dup-a1cf315461f9` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@106`, `server/src/db/models/booking/annotation_assignment.ts@106` |
| `dup-a2ca7ff4536c` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@41`, `server/src/db/models/booking/annotation_assignment.ts@41` |
| `dup-a34a3f8b2931` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@67`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@67` |
| `dup-a5ed8811e8e3` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@58`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@58` |
| `dup-aa0673e4a618` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@120`, `server/src/utils/logger.ts@120` |
| `dup-ac0c8bcb9ef7` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@108`, `server/src/utils/logger.ts@108` |
| `dup-ac464e938825` | P0 | 2 | 2 | 10 | `client/src/components/admin/generic/DynamicForm.vue@159`, `client/src/components/admin/generic/EntityFormContent.vue@91` |
| `dup-ad8ee8be63f6` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@35`, `client/src/composables/admin/useRelationshipCollectionField.ts@36` |
| `dup-b310fa6a5478` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@74`, `server/src/db/models/booking/dependent_instance.ts@78` |
| `dup-b32e32aa5499` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@39`, `server/src/db/models/booking/annotation_assignment.ts@39` |
| `dup-b36fd2f2d669` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@43`, `client/src/composables/admin/useRelationshipCollectionField.ts@44` |
| `dup-b579c99d5cc7` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@151`, `client/src/composables/booking/useDevPanelsComputed.ts@103` |
| `dup-b86f2e99d1d4` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@69`, `server/src/db/models/booking/annotation_assignment.ts@69` |
| `dup-bad84b2c682c` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@97`, `server/src/db/models/admin/adminRelationshipMetadata.ts@95` |
| `dup-c27098ef8302` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataHelpers.ts@76`, `server/src/routes/internal/admin-relationship-metadata/adminRelationshipMetadataHelpers.ts@26` |
| `dup-c2ccd09b612f` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@9`, `server/src/config/models.ts@9` |
| `dup-c3bfbb3d2b99` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@123`, `client/src/composables/booking/useDevPanelsComputed.ts@72` |
| `dup-c4bf4c36371c` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@115`, `server/src/utils/logger.ts@115` |
| `dup-c6d8bfa75306` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@40`, `server/src/db/models/booking/annotation_assignment.ts@40` |
| `dup-c927166d7ba6` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@26`, `server/src/utils/logger.ts@26` |
| `dup-caf8771d9453` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@85`, `server/src/db/models/booking/annotation_assignment.ts@85` |
| `dup-ce13cf1a9cb0` | P0 | 2 | 2 | 10 | `server/src/utils/adminPrimitiveMetadataComposer.ts@55`, `server/src/utils/adminRelationshipMetadataComposer.ts@59` |
| `dup-ce5391d88e5e` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@22`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@22` |
| `dup-d2a4760db264` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@90`, `server/src/db/models/booking/annotation_assignment.ts@90` |
| `dup-d2e396c8c745` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@54`, `server/src/db/models/booking/part_assignment.ts@54` |
| `dup-d3c2dde7f3ef` | P0 | 2 | 2 | 10 | `server/src/config/app.ts@16`, `server/src/config/models.ts@16` |
| `dup-d51a76184eba` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@24`, `server/src/utils/logger.ts@24` |
| `dup-d84d408e941d` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@95`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@84` |
| `dup-d9d632b9117f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@9`, `server/src/db/models/booking/part_assignment.ts@9` |
| `dup-da1c0ab7c1c2` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@54`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@54` |
| `dup-e00b05d38585` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@29`, `server/src/db/models/admin/adminRelationshipMetadata.ts@27` |
| `dup-e09e0d444595` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@55`, `server/src/utils/logger.ts@55` |
| `dup-e1a6e03d7f3a` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@105`, `server/src/utils/logger.ts@105` |
| `dup-e3caae627120` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@34`, `server/src/db/models/booking/annotation_assignment.ts@34` |
| `dup-e56a167dd19b` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@147`, `server/src/db/models/admin/adminRelationshipMetadata.ts@145` |
| `dup-e5b2fcfb4c12` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@39`, `server/src/utils/logger.ts@39` |
| `dup-e6066dad7651` | P0 | 2 | 2 | 10 | `server/src/routes/internal/appointments/appointmentErrorHandler.ts@13`, `server/src/routes/internal/businessSettings/businessSettingsErrorHandler.ts@13` |
| `dup-e6518a60a813` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminPrimitiveMetadata.ts@146`, `server/src/db/models/admin/adminRelationshipMetadata.ts@144` |
| `dup-e66dda309250` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@51`, `server/src/db/models/booking/annotation_assignment.ts@51` |
| `dup-e6855ed054d2` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@90`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@79` |
| `dup-eb2b738c66fb` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@99`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@88` |
| `dup-edbbfadef6b1` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@77`, `server/src/db/models/booking/annotation_assignment.ts@77` |
| `dup-ef36d1842f4c` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/booking_cascade.ts@66`, `server/src/db/models/booking/dependent_instance.ts@70` |
| `dup-f1427c3d6e1f` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_part.ts@28`, `server/src/db/models/booking/part_assignment.ts@28` |
| `dup-f5dc7d13d6e7` | P0 | 2 | 2 | 10 | `client/src/composables/admin/usePartsCollectionField.ts@36`, `client/src/composables/admin/useRelationshipCollectionField.ts@37` |
| `dup-f64b1e963ecf` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@101`, `server/src/utils/logger.ts@101` |
| `dup-f81c117e758b` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@46`, `server/src/db/models/booking/annotation_assignment.ts@46` |
| `dup-f9a3992c8e03` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@55`, `server/src/db/models/booking/annotation_assignment.ts@55` |
| `dup-fa6bd8610aac` | P0 | 2 | 2 | 10 | `client/src/components/booking/dev/DevPanelsContainer.vue@148`, `client/src/composables/booking/useDevPanelsComputed.ts@100` |
| `dup-fa6ed9d1e9b6` | P0 | 2 | 2 | 10 | `server/src/db/models/admin/adminMetadata.ts@98`, `server/src/db/models/admin/adminPrimitiveMetadata.ts@87` |
| `dup-fbba05bd59fa` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@109`, `server/src/utils/logger.ts@109` |
| `dup-fc6ae43d12ec` | P0 | 2 | 2 | 10 | `server/src/routes/internal/admin-metadata/adminMetadataValidators.ts@56`, `server/src/routes/internal/admin-primitive-metadata/adminPrimitiveMetadataValidators.ts@56` |
| `dup-fc98913933df` | P0 | 2 | 2 | 10 | `client/src/utils/logger.ts@31`, `server/src/utils/logger.ts@31` |
| `dup-fd9c1d4a0602` | P0 | 2 | 2 | 10 | `server/src/db/models/booking/active_annotation.ts@64`, `server/src/db/models/booking/annotation_assignment.ts@64` |

## Notes

- This is a *signal* index. Use the full report: `client/.audit-reports/duplication-audit.md`.
