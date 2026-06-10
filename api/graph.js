import { processGraph } from "../src/processGraph.js";

const profile = {
  user_id: process.env.USER_ID || "yourname_yyyymmdd",
  email_id: process.env.EMAIL_ID || "your.email@example.com",
  enrollment_number: process.env.ENROLLMENT_NUMBER || "YOUR_ROLL_NUMBER"
};

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    return res.status(200).json(processGraph(req.body, profile));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
