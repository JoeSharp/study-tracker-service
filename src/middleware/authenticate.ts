import { RequestHandler } from "express";
import * as logger from "winston";

import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authenticate: RequestHandler = async (req, res, next) => {
  const idToken = req.header("Authorization").replace("Bearer ", "");

  logger.debug(`Request made with token: ${idToken}`);
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userId = payload.sub;
    req.googleTicket = ticket;
    logger.debug("Verified Google User ID: " + userId);
    next();
  } catch (err) {
    logger.warn("User idToken could not be validated");
    // next();
    res.sendStatus(401);
  }

  // User.findByToken(token)
  //   .then((user) => {
  //     if (!user) {
  //       return Promise.reject('No user found');
  //     }

  //     req.user = user;
  //     req.token = token;
  //     next();
  //   })
  //   .catch((e) => {
  //     res.status(401).send();
  //   });
};

export default authenticate;
