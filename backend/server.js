import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import clientRoutes from "./routes/clientRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use("/api/clients", clientRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});