import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, required: true },
  notes: String,
  createdBy: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Client", clientSchema);