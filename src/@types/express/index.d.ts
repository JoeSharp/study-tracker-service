import { LoginTicket } from "google-auth-library";

declare module "express-serve-static-core" {
  interface Request {
    googleTicket?: LoginTicket;
  }
  interface Response {
    myField?: string;
  }
}
