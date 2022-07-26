import { IAutoMedia, SocialMediaPlatform } from "../model/myExpress";
import { Client } from "twitter-api-sdk";

import dotenv from "dotenv";

dotenv.config();

// Pass auth credentials to the library client
const TwitterClient = new Client(process.env.TWITTER_API_TOKEN as string);

const getTwitterMediaDetail = (path: string): IAutoMedia => {
  let url = new URL(path);
  let mediaId = url.pathname.split("/")[3];
  if (!(url.hostname.includes("twitter.com") && mediaId.length === 19))
    throw new Error("Invlid IG URL");
  return {
    type: SocialMediaPlatform.twitter,
    userId: null,
    mediaId: mediaId,
  };
};

export { TwitterClient, getTwitterMediaDetail };
