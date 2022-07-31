import { Request, Response } from "express";
import { oneDay } from "../util/datetime";

import { LineUserToken } from "../model/token";
import { ResponseBase } from "../model/response/responseBase";
import jwt from "jsonwebtoken";
import { LineUserDoc } from "../model/document/lineUser";
import { AutoMediaRequest } from "../model/myExpress";

// 驗證三方客戶token
export const tokenHandler = async (req: Request, res: Response, next: any) => {
  try {
    const response = new ResponseBase();
    if (!req.headers.authorization)
      return res.status(403).send(response.setError("Unauthorized"));
    const token = req.headers.authorization?.split(" ")[1];
    const lineUserId = (verifyToken(token) as LineUserToken).id;
    (req as AutoMediaRequest).lineUseraId = lineUserId;
    next();
  } catch (error) {
    next(error);
  }
};
export function generateToken(user: LineUserDoc) {
  const token: LineUserToken = { id: user.id };
  return jwt.sign(token, process.env.JWT_SECRET as string, {
    expiresIn: oneDay / 1000,
  });
}

export function verifyToken(token: string): LineUserToken {
  return jwt.verify(token, process.env.JWT_SECRET as string) as LineUserToken;
}
