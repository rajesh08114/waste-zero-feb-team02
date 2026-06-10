import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("Missing MONGO_URI. Add it to backend/.env before starting the server.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
