import { Request, Response } from "express";
import { sendWebhook } from "../service/webhook_service";
import { v4 as uuidv4 } from "uuid";
import { AutoMediaRequest, SocialMediaPlatform } from "../model/myExpress";
import { LineUser } from "../model/document/lineUser";
import { generateToken } from "../middleware/authHandler";
import { MessageEvent, TextEventMessage } from "@line/bot-sdk";
import { AutoMediaCommand, LineClient } from "../service/line_service";
import { getIgMediaDetail } from "../service/instagram_service";
import { getTwitterMediaDetail } from "../service/twitter_service";
import { AutoMediaApp } from "../model/document/amApp";

const lineMessageHandler = async (req: Request, res: Response, next: any) => {
  const event = req.body.events[0] as MessageEvent;
  const message = event.message as TextEventMessage;
  const messages: string[] = message.text.split(" ");
  let user = undefined;
  // 不支援group/room, 傳送文字外的訊息也略過
  if (!(event.message.type === "text")) return res.sendStatus(200);
  if (event.source.type === "user") {
    const lineUserProfile = await LineClient.getProfile(event.source.userId);
    user = await LineUser.findOne({ userId: lineUserProfile.userId });
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
    // 特殊指令，回傳API token
    switch (messages[0]) {
      case AutoMediaCommand.GET_TOKEN:
        const token = generateToken(user);
        LineClient.replyMessage(event.replyToken, {
          type: "text",
          text: token,
        });
        return res.sendStatus(200);
      case AutoMediaCommand.GET_WEBHOOK:
        LineClient.replyMessage(event.replyToken, {
          type: "text",
          text: JSON.stringify(
            await AutoMediaApp.findOne({ userId: user.userId }),
            null,
            "  "
          ),
        });
        return res.sendStatus(200);
      case AutoMediaCommand.SET_WEBHOOK:
        const webhook = messages[1];
        const doc = await AutoMediaApp.findOneAndUpdate(
          { userId: user.userId },
          {
            userId: user.userId,
            name: user.displayName,
            webhook: webhook,
            secret: uuidv4(),
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        LineClient.replyMessage(event.replyToken, {
          type: "text",
          text: JSON.stringify(doc, null, "  "),
        });
        return res.sendStatus(200);
      case AutoMediaCommand.TEST_WEBHOOK:
        const appDoc = await AutoMediaApp.findOne({ userId: user.userId });
        LineClient.replyMessage(event.replyToken, {
          type: "text",
          text: (await sendWebhook(appDoc, {})) as string,
        });
        return res.sendStatus(200);
    }
  }

  // Parse IG media id
  try {
    const igMediaDetail = await getIgMediaDetail(message.text);
    (req as AutoMediaRequest).autoMedia = igMediaDetail;
    (req as AutoMediaRequest).lineUseraId = user?.userId ?? undefined;
    console.log(message.text);
    return next();
  } catch (error) {
    // console.log(error);
  }

  // Parse Twitter media id
  try {
    const twitterMediaDetail = getTwitterMediaDetail(message.text);
    (req as AutoMediaRequest).autoMedia = twitterMediaDetail;
    (req as AutoMediaRequest).lineUseraId = user?.userId ?? undefined;
    console.log(message.text);
    return next();
  } catch (error) {
    // console.log(error);
  }
  return res.sendStatus(200);
};

export { lineMessageHandler };
