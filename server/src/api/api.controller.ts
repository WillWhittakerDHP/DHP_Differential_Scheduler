import { Request, Response } from "express";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("api.controller");

const apiGet = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ msg: "🚀 hello from v1 api" });
  } catch (error) {
    logger.error("api GET error", { error });
    res.status(500).json({ error: "An error occurred" });
  }
};

const apiPost = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ msg: req.body });
  } catch (error) {
    logger.error("api POST error", { error });
    res.status(500).json({ error: "An error occurred" });
  }
};
export { apiPost, apiGet };
