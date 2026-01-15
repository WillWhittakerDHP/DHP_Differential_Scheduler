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
import adminInputMetadataRouter from "./admin-input-metadata/adminInputMetadataRouter.js";
import adminRelationshipMetadataRouter from "./admin-relationship-metadata/adminRelationshipMetadataRouter.js";

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

// ✅ Admin input metadata CRUD routes (unified metadata for all entity types)
router.use('/admin-input-metadata', adminInputMetadataRouter);

// ✅ Admin relationship metadata CRUD routes (relationship field metadata for all entity types)
router.use('/admin-relationship-metadata', adminRelationshipMetadataRouter);

export { router as InternalRouter };
