import { Router } from "express";
import { EntityRouter } from "./entities/entityRouter.js";
import { RelationshipRouter } from "./relationships/relationshipRouter.js";
import { AnnotationInstanceRouter } from "./annotation-instances/annotationInstanceRouter.js";
import { AnnotationShapeRouter } from "./annotation-shapes/annotationShapeRouter.js";
import { PropertyRouter } from "./properties/propertyRouter.js";
import { UserRouter } from "./users/userRouter.js";
import { AppointmentRouter } from "./appointments/appointmentRouter.js";
import { AvailabilityRouter } from "./availabilityRouter.js";
import { BusinessSettingsRouter } from "./businessSettingsRouter.js";
import adminMetadataRouter from "./admin-metadata/adminMetadataRouter.js";

const router = Router();

// ✅ Generic entity CRUD routes
router.use('/entities', EntityRouter);

// ✅ Generic relationship CRUD routes (includes instanceComponents)
router.use('/relationships', RelationshipRouter);

// ✅ Annotation instance CRUD routes (annotation instances are NOT in ENTITY_KEYS, so they need their own router)
router.use('/annotation-instances', AnnotationInstanceRouter);

// ✅ Annotation shape CRUD routes (annotation shapes are NOT in ENTITY_KEYS, so they need their own router)
router.use('/annotation-shapes', AnnotationShapeRouter);

// ✅ Scheduler data CRUD routes (properties, users, appointments)
router.use('/properties', PropertyRouter);
router.use('/users', UserRouter);
router.use('/appointments', AppointmentRouter);

// ✅ Availability calculation route
router.use('/availability', AvailabilityRouter);

// ✅ Business settings CRUD routes
router.use('/business-settings', BusinessSettingsRouter);

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
