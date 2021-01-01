import { RequestHandler } from "express";

const authorise = (requiredRoles: string[]): RequestHandler => (
  req,
  res,
  next
) => {
  const googleTicket = req.googleTicket;

  if (!googleTicket) {
    res.send(401);
  }

  next();
};

export default authorise;
