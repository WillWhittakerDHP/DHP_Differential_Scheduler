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
import { CalendarSettingsRouter } from "./calendarSettings/calendarSettingsRouter.js";
import { WizardSettingsRouter } from "./wizardSettings/wizardSettingsRouter.js";
import { OrganizationDefaultsRouter } from "./organizationDefaults/organizationDefaultsRouter.js";
import BusinessRulesRouter from "./businessRulesRouter.js";
import { DevStatusRouter } from "./dev/devStatusRouter.js";
import { BetaFeedbackRouter } from "./beta-feedback/betaFeedbackRouter.js";
import { PropertyMappingsRouter } from "./property-mappings/propertyMappingsRouter.js";
import { EventInstancePreviewRouter } from "./event-instance-preview/eventInstancePreviewRouter.js";
import { UserRoleBlockAlignmentRouter } from "./userRoleBlockAlignment/userRoleBlockAlignmentRouter.js";

const router = Router();

router.use('/entities', EntityRouter);

router.use('/relationships', RelationshipRouter);

router.use('/properties', PropertyRouter);
router.use('/users', UserRouter);
router.use('/appointments', AppointmentRouter);
router.use('/appointment-fee-summaries', AppointmentFeeRouter);

router.use('/availability', AvailabilityRouter);

router.use('/business-settings', BusinessSettingsRouter);
router.use('/calendar-settings', CalendarSettingsRouter);
router.use('/wizard-settings', WizardSettingsRouter);

router.use('/organization-defaults', OrganizationDefaultsRouter);

router.use(BUSINESS_RULES_ROUTE, BusinessRulesRouter);

router.use('/dev', DevStatusRouter);

router.use('/beta-feedback', BetaFeedbackRouter);
router.use('/property-mappings', PropertyMappingsRouter);

router.use('/event-instance-preview', EventInstancePreviewRouter);

router.use('/user-role-block-alignment', UserRoleBlockAlignmentRouter);

export { router as InternalRouter };
