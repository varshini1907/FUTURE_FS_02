import express from "express";
import Client from "../models/Client.js";

const router = express.Router();

// GET all
router.get("/", async (req, res) => {
  const clients = await Client.find();
  res.json(clients);
});

// POST
router.post("/", async (req, res) => {
  const client = new Client(req.body);
  await client.save();
  res.json(client);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Client.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;