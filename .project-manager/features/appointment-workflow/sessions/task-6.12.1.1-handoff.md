# Task 6.12.1.1 handoff

**Completed:** 2026-03-21
**Description:** Event shape includeRescheduleLink/includeCancelLink + per-instance invite template stripping
**Goal:** DB migration, Sequelize model, admin toggles, templateResolver stripPlaceholderNames, invite orchestration loads EventShape per instance

**Files created:**
- server/src/db/migrations/20260327_000008_event_shape_invite_link_toggles.mjs

**Files modified:**
- server/src/db/migrations/20260327_000008_event_shape_invite_link_toggles.mjs
- server/src/db/models/booking/event_shape.ts
- server/src/services/invites/templateResolver.ts
- server/src/services/invites/inviteOrchestrationService.ts
- client/src/types/entities.ts
- client/src/configs/field/form/appliedForm/eventShapeFields.ts
- client/src/composables/admin/useShapesTab.ts
- client/src/utils/transformers/entityTransformers.ts

**Next:** 6.12.1.2

<!-- end excerpt task -->