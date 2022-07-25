import { Request, Response } from "express";
import { AutoMediaRequest, SocialMediaPlatform } from "../model/myExpress";
import { MessageEvent, TextEventMessage } from "@line/bot-sdk";
import { getIgMediaId } from "../service/instagram_service";

const lineMessageHandler = async (req: Request, res: Response, next: any) => {
  const event = req.body.events[0] as MessageEvent;
  // 不支援group, room
  if (!(event.source.type === "user" && event.message.type === "text"))
    return res.sendStatus(200);
  const message = event.message as TextEventMessage;
  // Parse IG media id
  try {
    const id = await getIgMediaId(message.text);
    (req as AutoMediaRequest).autoMedia = id;
    return next();
  } catch (error) {
    // console.log(error);
  }
  // TODO: Parse Twitter media id
  return res.sendStatus(200);
};

export { lineMessageHandler };
