const crypto = require("crypto");
const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

const VALID_PIGEONS = new Set(["classic", "snow", "chestnut"]);
const THIRTY_DAYS = 60 * 60 * 24 * 30;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const message = String(body.message || "").trim();
    const fromName = String(body.fromName || "").trim();
    const pigeon = VALID_PIGEONS.has(body.pigeon) ? body.pigeon : "classic";

    if (!message) {
      return res.status(400).json({ error: "The pigeon needs a message to carry." });
    }
    if (message.length > 600) {
      return res.status(400).json({ error: "Keep it under 600 characters -- pigeons aren't that strong." });
    }
    if (fromName.length > 60) {
      return res.status(400).json({ error: "That name's a bit long for a luggage tag." });
    }

    const id = crypto.randomBytes(5).toString("hex"); // 10 chars, plenty for a shareable link
    const record = { message, fromName, pigeon, createdAt: Date.now() };

    await redis.set(`pigeon:${id}`, JSON.stringify(record), { ex: THIRTY_DAYS });

    res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error("Failed to create pigeon message:", err);
    res.status(500).json({ error: "The pigeon dropped the letter. Try again." });
  }
};
