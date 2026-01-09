import { Router } from "express";
import { apiGet, apiPost } from "./api.controller";

const router = Router();

/* Get Route v1/get */
router.get("/get", apiGet);

/* Post Route v1/post */
router.post("/post", apiPost);

export { router };
