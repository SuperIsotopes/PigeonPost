const path = require("path");
const nodemailer = require("nodemailer");
const { buildPigeonEmail } = require("./email-template");

const ASSETS = path.join(__dirname, "assets");

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

// One transporter, reused across warm invocations of the function.
let transporter;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

module.exports = async (req, res) => {
  // Allow the site to call this from the same Vercel domain.
  // If you ever host the frontend elsewhere, set an explicit origin here
  // instead of "*".
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const to = String(body.to || "").trim();
    const fromName = String(body.fromName || "").trim();
    const message = String(body.message || "").trim();

    if (!isValidEmail(to)) {
      return res.status(400).json({ error: "That recipient email address doesn't look valid." });
    }
    if (!message) {
      return res.status(400).json({ error: "The pigeon needs a message to carry." });
    }
    if (message.length > 600) {
      return res.status(400).json({ error: "Keep it under 600 characters -- pigeons aren't that strong." });
    }

    const { subject, html, text } = buildPigeonEmail({ message, fromName });

    await getTransporter().sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
      text,
      attachments: [
        { filename: "pigeon.png", path: path.join(ASSETS, "pigeon.png"), cid: "pigeon-image" },
        { filename: "scroll-top.png", path: path.join(ASSETS, "scroll-top.png"), cid: "scroll-top-image" },
        { filename: "scroll-bottom.png", path: path.join(ASSETS, "scroll-bottom.png"), cid: "scroll-bottom-image" },
      ],
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Failed to send pigeon email:", err);
    return res.status(500).json({ error: "The pigeon got lost along the way." });
  }
};
