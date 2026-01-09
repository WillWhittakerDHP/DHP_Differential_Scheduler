import { Request, Response } from "express";

const apiGet = async (req: Request, res: Response): Promise<void> => {
  try {
    // Your logic here
    res.status(200).json({ msg: "🚀 hello from v1 api" });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const apiPost = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ msg: req.body });
  } catch (err) {
    res.status(500).json({ error: "An error occurred" });
  }
};
export { apiPost, apiGet };
