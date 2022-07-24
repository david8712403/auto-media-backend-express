import { IgApiClient } from "instagram-private-api";
import { IgSession } from "../model/document/igSession";

const saveSession = async (data: object) => {
  await IgSession.build({ data: data }).save();
  return data;
};

const sessionExists = async () => {
  const datetime = new Date(Date.now() - 1000 * 60).getTime();
  const session = await IgSession.countDocuments()
    .where("createdAt")
    .gt(datetime)
    .sort("-createdAt");
  return session;
};

const loadSession = async () => {
  const datetime = new Date(Date.now() - 1000 * 60).getTime();
  const session = await IgSession.findOne()
    .where("createdAt")
    .gt(datetime)
    .sort("-createdAt");
  return session?.data;
};

let ig = new IgApiClient();

const initIgClient = async () => {
  ig.state.generateDevice(process.env.IG_USERNAME!);

  // This function executes after every request
  ig.request.end$.subscribe(async () => {
    const serialized = await ig.state.serialize();
    delete serialized.constants; // this deletes the version info, so you'll always use the version provided by the library
    await saveSession(serialized);
  });
  const exists = await sessionExists();
  if (exists) {
    // import state accepts both a string as well as an object
    // the string should be a JSON object
    console.log("Load IG session");

    await ig.state.deserialize(loadSession());
  }
  // This call will provoke request.end$ stream
  ig.account
    .login(process.env.IG_USERNAME!, process.env.IG_PASSWORD!)
    .then((value) =>
      console.log(`IG service login successful. (${value.username})`)
    )
    .catch((error) => console.error(`IG service login FAILED: ${error}`));
  // Most of the time you don't have to login after loading the state
};

export { ig as IgClient, initIgClient };
