import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { envPath } from "./common/constant.js";

dotenv.config({ path: envPath });
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️ Server is running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGO db connection failed !!! ", error);
  });
