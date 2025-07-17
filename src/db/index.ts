import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}`);
    console.log(
      `🛢 Database connect with host: ${connectionInstance.connection.host}:${connectionInstance.connection.port}`,
    );
  } catch (error) {
    console.error("🛢 MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;
