import { Request, Response } from "express";
import { AutoMediaRequest, SocialMediaPlatform } from "../model/myExpress";
import { LineUser } from "../model/document/lineUser";
import { generateToken } from "../middleware/authHandler";
import { MessageEvent, TextEventMessage } from "@line/bot-sdk";
import { AutoMediaCommand, LineClient } from "../service/line_service";
import { getIgMediaDetail } from "../service/instagram_service";
import { getTwitterMediaDetail } from "../service/twitter_service";

const lineMessageHandler = async (req: Request, res: Response, next: any) => {
  const event = req.body.events[0] as MessageEvent;
  // 不支援group/room, 傳送文字外的訊息也略過
  if (!(event.source.type === "user" && event.message.type === "text"))
    return res.sendStatus(200);
  const lineUserProfile = await LineClient.getProfile(event.source.userId);
  let user = await LineUser.findOne({ userId: lineUserProfile.userId });
  if (!user) {
    user = LineUser.build({
      userId: lineUserProfile.userId,
      displayName: lineUserProfile.displayName,
      language: lineUserProfile.language ?? null,
      pictureUrl: lineUserProfile.pictureUrl,
    });
    await user.save();
  }
  console.log(lineUserProfile.userId, lineUserProfile.displayName);

  const message = event.message as TextEventMessage;

  // 特殊指令，回傳API token
  if (message.text === AutoMediaCommand.GET_TOKEN) {
    const token = generateToken(user);
    LineClient.replyMessage(event.replyToken, { type: "text", text: token });
    return res.sendStatus(200);
  }

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
