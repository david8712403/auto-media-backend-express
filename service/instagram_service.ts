import { IgApiClient } from "instagram-private-api";
import { IgSession } from "../model/document/igSession";
import { IAutoMedia, SocialMediaPlatform } from "../model/myExpress";
import bigint from "big-integer";
import dotenv from "dotenv";

dotenv.config();

const saveSession = async (data: object) => {
  await IgSession.build({ data: data }).save();
  return data;
};

const sessionExists = async () => {
  const session = await IgSession.countDocuments();
  console.log(`session count: ${session}`);
  return session !== 0;
};

const loadSession = async () => {
  const session = await IgSession.findOne().sort("-createdAt");

  return session?.data;
};

let ig = new IgApiClient();

const initIgClient = async () => {
  // 改用timestamp當作seed，也許會增加登入成功的機率？（之前都用username）
  ig.state.generateDevice(Date.now().toString());
  // This function executes after every request
  ig.request.end$.subscribe(async () => {
    const serialized = await ig.state.serialize();
    delete serialized.constants; // this deletes the version info, so you'll always use the version provided by the library
    saveSession(serialized);
  });
  const sessionExist = await sessionExists();
  if (sessionExist) {
    // import state accepts both a string as well as an object
    // the string should be a JSON object
    const session = await loadSession();

    await ig.state.deserialize(session);
    console.log("sign in by session");
    return;
  }
  // This call will provoke request.end$ stream
  try {
    console.log("sign in by username, password");
    await ig.account.login(process.env.IG_USERNAME!, process.env.IG_PASSWORD!);
  } catch (error) {
    console.log(ig.state.checkpoint); // Checkpoint info here
    await ig.challenge.auto(true); // Requesting sms-code or click "It was me" button
    console.log(ig.state.checkpoint); // Challenge info here
  }
};

const supportType = ["p", "post", "tv", "reel", "stories", "s"];

const shortCodeToMediaId = (shortCode: string) => {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = lower.toUpperCase();
  const numbers = "0123456789";
  const ig_alphabet = upper + lower + numbers + "-_";
  const bigint_alphabet = numbers + lower;
  const o = shortCode.replace(/\S/g, (m) => {
    const c = ig_alphabet.indexOf(m);
    const b = bigint_alphabet.charAt(c);
    return b != "" ? b : `<${c}>`;
  });
  return bigint(o, 64).toString(10);
};

const getIgMediaDetail = async (path: string): Promise<IAutoMedia> => {
  let url = new URL(path);
  const mediaType = url.pathname.split("/")[1];
  if (!supportType.includes(mediaType)) throw new Error("Invlid IG URL");
  let mediaId = url.pathname.split("/")[mediaType === "stories" ? 3 : 2];
  // 精選限時動態
  if (mediaType === "s")
    mediaId = url.searchParams.get("story_media_id") as string;

  let userName = mediaType === "stories" ? url.pathname.split("/")[2] : null;
  let userId: string | null = null;
  if (
    !(
      url.hostname.includes("instagram.com") &&
      (mediaId.length === 11 || mediaId.length === 19)
    )
  )
    throw new Error("Invlid IG URL");

  if (mediaId.length === 11) mediaId = shortCodeToMediaId(mediaId);

  if (userName) {
    userId = (await ig.user.searchExact(userName)).pk.toString();
    // 等待一下，否則跟下一個request間隔太短會被誤認為機器人帳號
    await new Promise((res) => setTimeout(res, 5000));
  }

  return {
    type: SocialMediaPlatform.instagram,
    userId: userId,
    mediaId: mediaId,
  };
};

export { ig as IgClient, getIgMediaDetail, initIgClient };
