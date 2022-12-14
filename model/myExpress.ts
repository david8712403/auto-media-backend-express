import { Request, Response } from "express";

interface IAutoMedia {
  type: SocialMediaPlatform;
  userId: string | null;
  mediaId: string;
}

enum SocialMediaPlatform {
  instagram = "Instagram",
  twitter = "Twitter",
}

interface AutoMediaRequest extends Request {
  autoMedia: IAutoMedia;
  lineUseraId: string | undefined;
}

export { IAutoMedia, AutoMediaRequest, SocialMediaPlatform };
