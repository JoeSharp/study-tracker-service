import logger from "winston";

import { RequestHandler } from "express";
import { ObjectID } from "mongodb";

const generateCheckPathId = (idFields: string[]): RequestHandler => (
  req,
  res,
  next
) => {
  const invalidField = idFields.find((id) => !ObjectID.isValid(req.params[id]));

  if (!!invalidField) {
    logger.warn(`Request made with invalid/missing ${invalidField}`);
    return res.status(400).send();
  } else {
    next();
  }
};

export default generateCheckPathId;
