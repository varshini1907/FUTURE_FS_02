import express from "express";
import Client from "../models/Client.js";

const router = express.Router();

// Authentication middleware to extract the session username
router.use((req, res, next) => {
  const username = req.headers["x-user-username"];
  if (!username) {
    return res.status(401).json({ message: "Unauthorized: Session username is missing." });
  }
  req.username = username;
  next();
});

// GET all clients for the logged-in user
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.username });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching clients" });
  }
});

// POST a new client linked to the logged-in user
router.post("/", async (req, res) => {
  try {
    const client = new Client({
      ...req.body,
      createdBy: req.username
    });
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: "Error saving client" });
  }
});

// PUT (update) client only if owned by the logged-in user
router.put("/:id", async (req, res) => {
  try {
    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.username },
      req.body,
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found or unauthorized" });
    }
    res.json(updatedClient);
  } catch (err) {
    res.status(400).json({ message: "Error updating client" });
  }
});

// DELETE client only if owned by the logged-in user
router.delete("/:id", async (req, res) => {
  try {
    const deletedClient = await Client.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.username
    });
    if (!deletedClient) {
      return res.status(404).json({ message: "Client not found or unauthorized" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting client" });
  }
});

export default router;