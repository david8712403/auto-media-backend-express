import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { tokenHandler } from "../middleware/authHandler";

dotenv.config();
const router = express.Router();

// TODO: 取得App list
router.get("/app", tokenHandler, async (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
  }
  return res.sendStatus(200);
});

// TODO: 建立App
router.post("/app", tokenHandler, async (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
  }
  return res.sendStatus(200);
});

// TODO: 更新App內容
router.put("/app", tokenHandler, async (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.log(error);
  }
  return res.sendStatus(200);
});

export { router as amAppRouter };
