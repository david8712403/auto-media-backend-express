import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { lineMessageHandler } from "../middleware/lineHandler";
import { IgClient, initIgClient } from "../service/instagram_service";
import { AutoMediaRequest, SocialMediaPlatform } from "../model/myExpress";
import { LineClient } from "../service/line_service";
import { MessageEvent, Message } from "@line/bot-sdk";
import { getIgPostMessages, getIgStoryMessages } from "../service/line_service";

dotenv.config();

initIgClient();
const router = express.Router();

// sign in
router.post(
  "/line/callback",
  lineMessageHandler,
  async (req: Request, res: Response) => {
    const autoMedia = (req as AutoMediaRequest).autoMedia;
    const event = req.body.events[0] as MessageEvent;
    let messages: Message[] = [];
    try {
      if (autoMedia.userId) {
        // story
        const rawData = await IgClient.feed
          .reelsMedia({ userIds: [autoMedia.userId] })
          .items();
        const mediaData = rawData.filter((x) => x.pk === autoMedia.mediaId)[0];
        messages = [...messages, ...getIgStoryMessages(mediaData)];
      } else {
        // reel, post
        const rawData = await IgClient.media.info(autoMedia.mediaId);
        const mediaData = rawData.items[0];
        messages = getIgPostMessages(mediaData) as Message[];
      }
      // 一次訊息只能有5個message
      const chunkSize = 5;
      for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize);
        if (i === 0) LineClient.replyMessage(event.replyToken, chunk);
        else LineClient.pushMessage(event.source.userId!, chunk);
      }
    } catch (error) {
      console.log(error);
    }
    return res.sendStatus(200);
  }
);

export { router as lineRouter };
