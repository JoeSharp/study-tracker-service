import logger from "winston";

import { RequestHandler } from "express";
import { ObjectID } from "mongodb";

const checkPathId: RequestHandler = (req, res, next) => {
  const _id = req.params.id;

  if (!ObjectID.isValid(_id)) {
    logger.warn("Request made with missing id");
    return res.status(404).send();
  } else {
    next();
  }
};

export default checkPathId;
