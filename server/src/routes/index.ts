import { Router } from "express";
import { generalRateLimiter, authRateLimiter } from "../middlewares/rateLimit.js";
import { AuthRouter } from "./internal/auth/authRouter.js";
import { InternalRouter } from "./internal/index.js";
import { ExternalRouter } from "./external/index.js";

const router = Router();

const v1Router = Router();
v1Router.use("/internal/auth", authRateLimiter, AuthRouter);
v1Router.use("/internal", generalRateLimiter, InternalRouter);
v1Router.use("/external", ExternalRouter);

router.use("/v1", v1Router);


export default router;
