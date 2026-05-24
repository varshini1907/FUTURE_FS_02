import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

let cachedConnection = null;
const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL environment variable is missing");
  }
  cachedConnection = await mongoose.connect(process.env.MONGO_URL, {
    serverSelectionTimeoutMS: 5000
  });
  return cachedConnection;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error in serverless:", err.message);
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);

if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;