import { Client, ClientConfig, Message } from "@line/bot-sdk";
import {
  ReelsMediaFeedResponseItem,
  MediaInfoResponseItemsItem,
} from "instagram-private-api";
import dotenv from "dotenv";
import { findTweetById, TwitterResponse } from "twitter-api-sdk/dist/types";

dotenv.config();

const lineConfig: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

// init LINE API client
const client = new Client(lineConfig);

const getIgPostMessages = (data: MediaInfoResponseItemsItem): Message[] => {
  let messages: Message[] = [];
  if ((data as any).carousel_media) {
    const carouselMedia = (data as any)
      .carousel_media as MediaInfoResponseItemsItem[];
    carouselMedia.forEach((media) => {
      messages = [...messages, ...getIgPostMessages(media)];
    });
    return messages;
  }
  if ((data as any).video_versions)
    return [
      {
        type: "video",
        previewImageUrl: data.image_versions2.candidates[0].url,
        originalContentUrl: (data as any).video_versions[0].url,
      },
    ];
  return [
    {
      type: "image",
      previewImageUrl: data.image_versions2.candidates[0].url,
      originalContentUrl: (data as any).image_versions2.candidates[0].url,
    },
  ];
};

const getIgStoryMessages = (data: ReelsMediaFeedResponseItem): Message[] => {
  const messages: Message[] = [];

  messages.push({
    type: data.video_versions ? "video" : "image",
    previewImageUrl: data.image_versions2.candidates[0].url,
    originalContentUrl: data.video_versions
      ? data.video_versions[0].url
      : data.image_versions2.candidates[0].url,
  });
  return messages;
};

const getTweetMessages = (data: TwitterResponse<findTweetById>): Message[] => {
  const messages: Message[] = [];
  data.includes?.media?.forEach((m: any) => {
    messages.push(getTweetMessage(m));
  });
  function getTweetMessage(media: any): Message {
    return {
      type: media.type === "photo" ? "image" : "video",
      previewImageUrl:
        media.type === "photo" ? media.url : media.preview_image_url,
      originalContentUrl:
        media.type === "photo"
          ? `${media.url}?name=orig`
          : getHighestBitrateVideoUrl(media.variants),
    };
  }
  function getHighestBitrateVideoUrl(variants: any[]): string {
    return variants.sort((a, b) => b.bit_rate - a.bit_rate)[0].url;
  }
  return messages;
};

export {
  client as LineClient,
  getIgPostMessages,
  getIgStoryMessages,
  getTweetMessages,
};
