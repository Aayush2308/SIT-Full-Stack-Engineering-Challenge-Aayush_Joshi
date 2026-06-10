import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { processGraph } from "./src/processGraph.js";

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const profile = {
  user_id: process.env.USER_ID || "aayushjoshi_20040823",
  email_id: process.env.EMAIL_ID || "aayush.joshi.btech2023@sitpune.edu.in",
  enrollment_number: process.env.ENROLLMENT_NUMBER || "23070122008"
};

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.post("/api/graph", (req, res) => {
  try {
    res.json(processGraph(req.body, profile));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
