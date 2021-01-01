import "./env";
import express from "express";
import bodyParser from "body-parser";
import * as logger from "winston";

import apis from "./api";

import { connectDb } from "./db/mongoose";
import uiCors from "./middleware/cors_ui";

logger.configure({
  level: "debug",
  transports: [new logger.transports.Console()],
});

connectDb();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(uiCors);

const PORT = process.env.PORT || 8080;

apis.forEach((api) => api({ app }));

// start the Express server
app.listen(PORT, () => {
  logger.info(`server started on port ${PORT}`);
});
