import { Request, Response } from "express";

const apiGet = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ msg: "🚀 hello from v1 api" });
  } catch {
    res.status(500).json({ error: "An error occurred" });
  }
};

const apiPost = async (req: Request, res: Response): Promise<void> => {
  try {
    // @audit-allow:hardcoding:fieldMapping - Response shape
    res.status(200).json({ msg: req.body });
  } catch {
    res.status(500).json({ error: "An error occurred" });
  }
};
export { apiPost, apiGet };
