import { Router } from "express";
import { BUSINESS_RULES_ROUTE } from "../../../../shared/constants/businessRulesConstants.js";
import { EntityRouter } from "./entities/entityRouter.js";
import { RelationshipRouter } from "./relationships/relationshipRouter.js";
import { PropertyRouter } from "./properties/propertyRouter.js";
import { UserRouter } from "./users/userRouter.js";
import { AppointmentRouter } from "./appointments/appointmentRouter.js";
import { AppointmentFeeRouter } from "./appointment-fees/appointmentFeeRouter.js";
import { AvailabilityRouter } from "./availabilityRouter.js";
import { BusinessSettingsRouter } from "./businessSettingsRouter.js";
import BusinessRulesRouter from "./businessRulesRouter.js";
import adminMetadataRouter from "./admin-metadata/adminMetadataRouter.js";
import { DevStatusRouter } from "./dev/devStatusRouter.js";
import { BetaFeedbackRouter } from "./beta-feedback/betaFeedbackRouter.js";
import { PropertyMappingsRouter } from "./property-mappings/propertyMappingsRouter.js";

const router = Router();

router.use('/entities', EntityRouter);

router.use('/relationships', RelationshipRouter);

router.use('/properties', PropertyRouter);
router.use('/users', UserRouter);
router.use('/appointments', AppointmentRouter);
router.use('/appointment-fee-summaries', AppointmentFeeRouter);

router.use('/availability', AvailabilityRouter);

router.use('/business-settings', BusinessSettingsRouter);

router.use(BUSINESS_RULES_ROUTE, BusinessRulesRouter);

// WHY: Matches entity pattern where single endpoint handles all fields, backend routes based on type
router.use('/admin-metadata', adminMetadataRouter);

router.use('/dev', DevStatusRouter);

router.use('/beta-feedback', BetaFeedbackRouter);
router.use('/property-mappings', PropertyMappingsRouter);

export { router as InternalRouter };
