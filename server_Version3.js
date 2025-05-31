const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

// Firebase config from environment variables
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
const db = admin.database().ref("inventory");

// Get all items
app.get("/api/items", async (req, res) => {
  const snap = await db.once("value");
  res.json(snap.val() || {});
});

// Add item
app.post("/api/items", async (req, res) => {
  const newItem = db.push();
  await newItem.set(req.body);
  res.json({ success: true, id: newItem.key });
});

// Update item
app.put("/api/items/:id", async (req, res) => {
  await db.child(req.params.id).update(req.body);
  res.json({ success: true });
});

// Delete item
app.delete("/api/items/:id", async (req, res) => {
  await db.child(req.params.id).remove();
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));