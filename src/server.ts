import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { envPath } from "./common/constant.js";
import { prisma } from "./container.js";

dotenv.config({ path: envPath });

const startServer = async () => {
  await connectDB();

  const port = Number(process.env.PORT) || 5000;
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger docs: http://localhost:${port}/api-docs`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. Stop the other process or change PORT in .env`);
      process.exit(1);
    }
    throw error;
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer().catch((error) => {
  console.log("Database connection failed:", error);
});
