import { IAutoMedia, SocialMediaPlatform } from "../model/myExpress";
import { Client } from "twitter-api-sdk";

import dotenv from "dotenv";
import { findTweetById, TwitterParams } from "twitter-api-sdk/dist/types";

dotenv.config();

// Pass auth credentials to the library client
const TwitterClient = new Client(process.env.TWITTER_API_TOKEN as string);

export const twitterParams: TwitterParams<findTweetById> = {
  expansions: ["attachments.media_keys", "author_id"],
  "media.fields": [
    "media_key",
    "preview_image_url",
    "type",
    "url",
    "variants",
    "width",
    "height",
  ],
  "tweet.fields": ["entities"],
};

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
