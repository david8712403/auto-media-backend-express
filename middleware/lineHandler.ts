import { Request, Response } from "express";
import { AutoMediaRequest, SocialMediaPlatform } from "../model/myExpress";
import { LineUser } from "../model/document/lineUser";
import { MessageEvent, TextEventMessage } from "@line/bot-sdk";
import { LineClient } from "../service/line_service";
import { getIgMediaDetail } from "../service/instagram_service";
import { getTwitterMediaDetail } from "../service/twitter_service";

const lineMessageHandler = async (req: Request, res: Response, next: any) => {
  const event = req.body.events[0] as MessageEvent;
  // 不支援group/room, 傳送文字外的訊息也略過
  if (!(event.source.type === "user" && event.message.type === "text"))
    return res.sendStatus(200);
  const user = await LineClient.getProfile(event.source.userId);
  const userExists = await LineUser.findOne({ userId: user.userId });
  if (!userExists) {
    await LineUser.build({
      userId: user.userId,
      displayName: user.displayName,
      language: user.language ?? null,
      pictureUrl: user.pictureUrl,
    }).save();
  }
  console.log(user.userId, user.displayName);

  const message = event.message as TextEventMessage;
  // Parse IG media id
  try {
    const igMediaDetail = await getIgMediaDetail(message.text);
    (req as AutoMediaRequest).autoMedia = igMediaDetail;
    console.log(message.text);
    return next();
  } catch (error) {
    // console.log(error);
  }

  // Parse Twitter media id
  try {
    const twitterMediaDetail = getTwitterMediaDetail(message.text);
    (req as AutoMediaRequest).autoMedia = twitterMediaDetail;
    console.log(message.text);
    return next();
  } catch (error) {
    // console.log(error);
  }
  return res.sendStatus(200);
};

export { lineMessageHandler };
