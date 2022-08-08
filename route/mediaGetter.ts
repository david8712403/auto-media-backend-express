import { Message } from "@line/bot-sdk";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { mediaFromUrlHandler } from "../middleware/mediaHandler";
import { AutoMediaRequest, SocialMediaPlatform } from "../model/myExpress";
import { IgClient } from "../service/instagram_service";
import { getTweetMessages } from "../service/line_service";
import { getIgPostMessages, getIgStoryMessages } from "../service/line_service";
import { TwitterClient, twitterParams } from "../service/twitter_service";

dotenv.config();
const router = express.Router();

router.get(
  "/mediaGetter",
  [mediaFromUrlHandler],
  async (req: Request, res: Response) => {
    const autoMedia = (req as AutoMediaRequest).autoMedia;
    let messages: any[] = [];
    try {
      switch (autoMedia.type) {
        case SocialMediaPlatform.instagram:
          if (autoMedia.userId) {
            // story
            const rawData = await IgClient.feed
              .reelsMedia({ userIds: [autoMedia.userId] })
              .items();
            const mediaData = rawData.filter(
              (x) => x.pk === autoMedia.mediaId
            )[0];
            messages = getIgStoryMessages(mediaData);
          } else {
            // reel, post
            const rawData = await IgClient.media.info(autoMedia.mediaId);
            const mediaData = rawData.items[0];
            messages = getIgPostMessages(mediaData) as Message[];
          }
          break;
        case SocialMediaPlatform.twitter:
          const rawData = await TwitterClient.tweets.findTweetById(
            autoMedia.mediaId,
            twitterParams
          );
          messages = getTweetMessages(rawData) as Message[];
          break;
      }
      return res.status(200).send({ messages: messages });
    } catch (error) {
      console.log(error);
    }
    return res.sendStatus(200);
  }
);

export { router as mediaGetterRouter };
