const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Pre-Prompt ---
const SYSTEM_PROMPT = `
You are AyurSutra Companion — an empathetic assistant for Panchakarma patients.
Provide guidance, support, and reminders. Never give medical prescriptions or diagnoses.
Always remain clear, safe, and compassionate.
`;

// Chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required." });

    // Combine system pre-prompt + user message as a single "user" content
    const prompt = SYSTEM_PROMPT + "\n\nUser: " + message;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: prompt }] }
          ]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply.";

    res.json({ reply });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/", (req, res) => {
  res.send("AyurSutra Companion Bot API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
