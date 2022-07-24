import type { ErrorRequestHandler } from "express";
import { ResponseBase } from "../model/response/responseBase";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const resposne = new ResponseBase();
  console.error(err.stack);
  resposne.setError(err.message);
  return res.status(500).send(resposne);
};

export { errorHandler };
