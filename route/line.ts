import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { Client, Message } from "@line/bot-sdk";
import { IgClient, initIgClient } from "../service/instagram_service";

dotenv.config();

initIgClient();
const router = express.Router();

// init LINE API client
const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
});

// sign in
router.post("/line/callback", async (req: Request, res: Response) => {
  const event = req.body.events[0];

  if (event.type === "message") {
    const message = event.message;

    if (message.type === "text") {
      client.replyMessage(event.replyToken, {
        type: "text",
        text: message.text,
      });
    }
  }
  return res.status(200).send({});
});

export { router as lineRouter };
