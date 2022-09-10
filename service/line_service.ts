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

// Instagram Messages
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

// Twitter Messages
const getTweetMessages = (data: TwitterResponse<findTweetById>): Message[] => {
  const messages: Message[] = [];
  data.includes?.media?.forEach((m: any) => {
    messages.push(getTweetMessage(m));
  });
  // messages.push(getFlexMessages(data.includes?.media as any[]));
  // function getFlexMessages(media: any[]): Message {
  //   const contents: FlexBubble[] = [];
  //   media.forEach((m: any) => {
  //     if (m.type === "photo")
  //       contents.push({
  //         type: "bubble",
  //         hero: {
  //           type: "image",
  //           url: m.url,
  //           size: "full",
  //           aspectRatio: `1:${m.height / m.width}`,
  //           aspectMode: "cover",
  //           action: { type: "uri", uri: m.url, label: "test" },
  //         },
  //       });
  //     else
  //       contents.push({
  //         type: "bubble",
  //         size: "mega",
  //         hero: {
  //           type: "video",
  //           url: getHighestBitrateVideoUrl(m.variants),
  //           previewUrl: m.preview_image_url,
  //           altContent: {
  //             type: "image",
  //             size: "full",
  //             aspectRatio: `${m.height}:${m.width}`,
  //             aspectMode: "cover",
  //             url: m.preview_image_url,
  //           },
  //           aspectRatio: `${m.height}:${m.width}`,
  //           // action: { type: "uri", uri: m.preview_image_url, label: "test" },
  //         },
  //       });
  //   });
  //   let message: FlexMessage;
  //   if (contents.length > 1)
  //     message = {
  //       type: "flex",
  //       altText: "this is a flex message",
  //       contents: {
  //         type: "carousel",
  //         contents: contents,
  //       },
  //     };
  //   else
  //     message = {
  //       type: "flex",
  //       altText: "this is a flex message",
  //       contents: contents[0],
  //     };
  //   return message;
  // }
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
    variants = variants.filter((v) => v.bit_rate);
    return variants.sort((a, b) => b.bit_rate - a.bit_rate)[0].url;
  }
  return messages;
};

// AutoMedia Commands
export enum AutoMediaCommand {
  GET_TOKEN = "GET_TOKEN",
  SET_WEBHOOK = "SET_WEBHOOK",
  GET_WEBHOOK = "GET_WEBHOOK",
  TEST_WEBHOOK = "TEST_WEBHOOK",
}

export {
  client as LineClient,
  getIgPostMessages,
  getIgStoryMessages,
  getTweetMessages,
};
