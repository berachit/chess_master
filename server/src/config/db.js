import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/chessMaster`);
    console.log("MongoDB connected!!");
  } catch (error) {
    console.error("MongoDB connection failed!!!", error);
    process.exit(1);
  }
};
