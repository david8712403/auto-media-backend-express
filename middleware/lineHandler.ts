import { Request, Response } from "express";
import { AutoMediaRequest, SocialMediaPlatform } from "../model/myExpress";
import { MessageEvent, TextEventMessage } from "@line/bot-sdk";
import { getIgMediaDetail } from "../service/instagram_service";
import { getTwitterMediaDetail } from "../service/twitter_service";

const lineMessageHandler = async (req: Request, res: Response, next: any) => {
  const event = req.body.events[0] as MessageEvent;
  // 不支援group, room
  if (!(event.source.type === "user" && event.message.type === "text"))
    return res.sendStatus(200);
  const message = event.message as TextEventMessage;
  // Parse IG media id
  try {
    const igMediaDetail = await getIgMediaDetail(message.text);
    (req as AutoMediaRequest).autoMedia = igMediaDetail;
    return next();
  } catch (error) {
    // console.log(error);
  }

  // TODO: Parse Twitter media id
  try {
    const twitterMediaDetail = getTwitterMediaDetail(message.text);
    (req as AutoMediaRequest).autoMedia = twitterMediaDetail;
    return next();
  } catch (error) {
    // console.log(error);
  }
  return res.sendStatus(200);
};

export { lineMessageHandler };
