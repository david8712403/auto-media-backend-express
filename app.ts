import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { json } from "body-parser";
import { lineRouter } from "./route/line";

dotenv.config({ path: __dirname + "/.env" });

const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000");

app.use(json());
app.use((req: express.Request, res: express.Response, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.use(lineRouter);
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
