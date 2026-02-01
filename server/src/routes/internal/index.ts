import { Router } from "express";
import { EntityRouter } from "./entities/entityRouter.js";
import { RelationshipRouter } from "./relationships/relationshipRouter.js";
import { PropertyRouter } from "./properties/propertyRouter.js";
import { UserRouter } from "./users/userRouter.js";
import { AppointmentRouter } from "./appointments/appointmentRouter.js";
import { AvailabilityRouter } from "./availabilityRouter.js";
import { BusinessSettingsRouter } from "./businessSettingsRouter.js";
import BusinessRulesRouter from "./businessRulesRouter.js";
import adminMetadataRouter from "./admin-metadata/adminMetadataRouter.js";

const router = Router();

// ✅ Generic entity CRUD routes
router.use('/entities', EntityRouter);

// ✅ Generic relationship CRUD routes (includes instanceComponents)
router.use('/relationships', RelationshipRouter);

// ✅ Scheduler data CRUD routes (properties, users, appointments)
router.use('/properties', PropertyRouter);
router.use('/users', UserRouter);
router.use('/appointments', AppointmentRouter);

// ✅ Availability calculation route
router.use('/availability', AvailabilityRouter);

// ✅ Business settings CRUD routes
router.use('/business-settings', BusinessSettingsRouter);

// ✅ Business rules CRUD routes
router.use('/business-rules', BusinessRulesRouter);

// ✅ Admin metadata CRUD routes (unified metadata for all entity types - primitives + relationships)
// LEARNING: Single endpoint follows entity pattern - backend routes based on fieldKey type
// WHY: Matches entity pattern where single endpoint handles all fields, backend routes based on type
// NOTE: Keeping /admin-input-metadata and /admin-primitive-metadata paths for backward compatibility during transition
router.use('/admin-metadata', adminMetadataRouter);
// Backward compatibility routes (can be removed after frontend migration)
router.use('/admin-input-metadata', adminMetadataRouter);
router.use('/admin-primitive-metadata', adminMetadataRouter);
router.use('/admin-relationship-metadata', adminMetadataRouter);

export { router as InternalRouter };
