import { Router } from "express";
import { InternalRouter } from "./internal/index.js";
import { ExternalRouter } from "./external/index.js";

const router = Router();


// Wrap all versioned routes under /v1
const v1Router = Router();
v1Router.use("/external", ExternalRouter);
v1Router.use("/internal", InternalRouter);

// Mount v1Router under /v1
router.use("/v1", v1Router);


export default router;
