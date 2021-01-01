import { RequestHandler } from "express";

const uiCors: RequestHandler = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.UI_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", [
    "authorization",
    "content-type",
    "accept",
  ]);
  res.setHeader("Access-Control-Allow-Methods", [
    "GET",
    "POST",
    "PUT",
    "DELETE",
  ]);
  next();
};

export default uiCors;
