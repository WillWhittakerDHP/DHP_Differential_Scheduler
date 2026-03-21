import { Router } from "express";
<<<<<<< HEAD
import { generalRateLimiter, authRateLimiter } from "../middlewares/rateLimit.js";
import { AuthRouter } from "./internal/auth/authRouter.js";
=======
import { generalRateLimiter } from "../middlewares/rateLimit.js";
>>>>>>> session-8.2.1
import { InternalRouter } from "./internal/index.js";
import { ExternalRouter } from "./external/index.js";

const router = Router();

const v1Router = Router();
<<<<<<< HEAD
v1Router.use("/internal/auth", authRateLimiter, AuthRouter);
=======
>>>>>>> session-8.2.1
v1Router.use("/internal", generalRateLimiter, InternalRouter);
v1Router.use("/external", ExternalRouter);

router.use("/v1", v1Router);


export default router;
