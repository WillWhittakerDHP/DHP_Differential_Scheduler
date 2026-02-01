import { Router } from "express";
import { InternalRouter } from "./internal/index.js";
import { ExternalRouter } from "./external/index.js";

const router = Router();


const v1Router = Router();
v1Router.use("/external", ExternalRouter);
v1Router.use("/internal", InternalRouter);

router.use("/v1", v1Router);


export default router;
