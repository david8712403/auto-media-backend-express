import { IgApiClient } from "instagram-private-api";
import { IgSession } from "../model/document/igSession";
import { IAutoMedia, SocialMediaPlatform } from "../model/myExpress";
import bigint from "big-integer";

const saveSession = async (data: object) => {
  await IgSession.build({ data: data }).save();
  return data;
};

const sessionExists = async () => {
  const session = await IgSession.countDocuments();
  return session;
};

const loadSession = async () => {
  const session = await IgSession.findOne().sort("-createdAt");

  return session?.data;
};

let ig = new IgApiClient();

const initIgClient = async () => {
  ig.state.generateDevice(process.env.IG_USERNAME!);

  // This function executes after every request
  ig.request.end$.subscribe(async () => {
    const serialized = await ig.state.serialize();
    delete serialized.constants; // this deletes the version info, so you'll always use the version provided by the library
    const afterDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await IgSession.deleteMany({ createdAt: { $lt: afterDate } });
    await saveSession(serialized);
  });
  try {
    const exists = await sessionExists();
    if (exists) {
      // import state accepts both a string as well as an object
      // the string should be a JSON object
      console.log("Login by IG session");

      await ig.state.deserialize(loadSession());
      const { cookies, deviceString, deviceId, uuid, phoneId, adid, build } =
        await loadSession();
      ig.state.deviceString = deviceString;
      ig.state.deviceId = deviceId;
      ig.state.uuid = uuid;
      ig.state.phoneId = phoneId;
      ig.state.adid = adid;
      ig.state.build = build;
      await ig.state.deserializeCookieJar(cookies);
    } else {
      igLogin();
    }
  } catch (error) {
    igLogin();
  }
};

const igLogin = () => {
  ig.account
    .login(process.env.IG_USERNAME!, process.env.IG_PASSWORD!)
    .then((value) =>
      console.log(`IG service login successful. (${value.username})`)
    )
    .catch((error) => console.error(`IG service login FAILED: ${error}`));
};

const supportType = ["p", "post", "tv", "reel", "stories"];

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

const getIgMediaId = async (path: string): Promise<IAutoMedia> => {
  let url = new URL(path);
  const mediaType = url.pathname.split("/")[1];
  if (!supportType.includes(mediaType)) throw new Error("Invlid IG URL");
  let mediaId = url.pathname.split("/")[mediaType === "stories" ? 3 : 2];
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

  if (userName)
    userId = await (await ig.user.searchExact(userName)).pk.toString();
  return {
    type: SocialMediaPlatform.instagram,
    userId: userId,
    mediaId: mediaId,
  };
};

export { ig as IgClient, getIgMediaId, initIgClient };
