import mongoose from "mongoose";

const mongo_uri:string | undefined = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ux-project"; ;

export const runDatabase = async () => {
  try {
    await mongoose.connect(mongo_uri)
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
