const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET." });

  try {
    const id = String(req.query.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id." });

    const raw = await redis.get(`pigeon:${id}`);
    if (!raw) {
      return res.status(404).json({ error: "This pigeon already delivered its message and flew home." });
    }

    // @upstash/redis may return the value already parsed as an object, or as a string.
    const record = typeof raw === "string" ? JSON.parse(raw) : raw;

    res.status(200).json({ ok: true, ...record });
  } catch (err) {
    console.error("Failed to fetch pigeon message:", err);
    res.status(500).json({ error: "Couldn't reach that pigeon right now." });
  }
};
