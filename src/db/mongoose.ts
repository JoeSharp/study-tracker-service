import { connect, set } from "mongoose";

set("useFindAndModify", false);

export function connectDb() {
  connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
}
