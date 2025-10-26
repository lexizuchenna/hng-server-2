import express, { Request, Response } from "express";
import "reflect-metadata";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db";
import countryRouter from "./routes/country";
import { getStatus } from "./controller/country";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/countries", countryRouter);
app.get("/status", getStatus);

app.use("/", (req: Request, res: Response) => {
  try {
    return res.status(200).json("Hello World!");
  } catch (error) {
    return res.status(500).json({
      message: "Internal sever error",
      status: "failed",
      error: error,
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
