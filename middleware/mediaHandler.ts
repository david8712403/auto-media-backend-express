import { Request, Response } from "express";
import { AutoMediaRequest, SocialMediaPlatform } from "../model/myExpress";
import { getIgMediaDetail } from "../service/instagram_service";
import { getTwitterMediaDetail } from "../service/twitter_service";

const mediaFromUrlHandler = async (req: Request, res: Response, next: any) => {
  const url = req.query.url as string;

  // Parse IG media id
  try {
    const igMediaDetail = await getIgMediaDetail(url);
    (req as AutoMediaRequest).autoMedia = igMediaDetail;
    return next();
  } catch (error) {
    // console.log(error);
  }

  // Parse Twitter media id
  try {
    const twitterMediaDetail = getTwitterMediaDetail(url);
    (req as AutoMediaRequest).autoMedia = twitterMediaDetail;
    return next();
  } catch (error) {
    // console.log(error);
  }
  return res.sendStatus(400);
};

export { mediaFromUrlHandler };
