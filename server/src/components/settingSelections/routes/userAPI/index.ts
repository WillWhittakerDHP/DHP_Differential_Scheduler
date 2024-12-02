import { Router } from "express";
import {AdditionalServicesRouter} from "./additionalServicesRoutes.js";
import {AvailabilityOptionsRouter} from "./availabilityOptionsRoutes.js"
import {DwellingAdjustmentsRouter} from "./dwellingAdjustmentsRoutes.js"
import { ServicesRouter } from "./servicesRoutes.js";

const router = Router();

router.use('/additionalServices', AdditionalServicesRouter);
router.use('/availabilityOptions', AvailabilityOptionsRouter);
router.use('/dwellingAdjustments', DwellingAdjustmentsRouter);
router.use('/services', ServicesRouter);


export { router as UserApiRouter };
