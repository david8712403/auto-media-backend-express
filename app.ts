import express, { Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";
import { json } from "body-parser";
import { lineRouter } from "./route/line";
import { amAppRouter } from "./route/amApp";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config({ path: __dirname + "/.env" });

const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000");

app.use(json());
app.enable("trust proxy");
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use(morgan("common"));
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Routes
app.use(lineRouter);
app.use(amAppRouter);

// Ignore not found methods
app.use((req, res, next) => (!req.route ? res.sendStatus(404) : next()));
// Error middleware
app.use(errorHandler);

// MongoDB client connection
mongoose.connect(
  process.env.MONGODB_URL!,
  {
    dbName: process.env.MONGODB_NAME!,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  },
  () => console.log("connected to database")
);

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
