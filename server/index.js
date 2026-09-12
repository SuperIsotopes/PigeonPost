require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const { buildPigeonEmail } = require("./email-template");

const app = express();
app.use(cors());
app.use(express.json());

// ---- Mail transport ----
// Works with ANY SMTP provider: Resend, Postmark, SendGrid, Mailgun,
// Amazon SES, or a plain Gmail account with an app password.
// Fill these in your .env file (see .env.example).
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for 587/25
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const ASSETS = path.join(__dirname, "assets");

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

app.post("/send-pigeon", async (req, res) => {
  try {
    const to = String(req.body.to || "").trim();
    const fromName = String(req.body.fromName || "").trim();
    const message = String(req.body.message || "").trim();

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

    await transporter.sendMail({
      from: process.env.FROM_EMAIL, // e.g. "Pigeon Post <post@yourdomain.com>"
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

    res.json({ ok: true });
  } catch (err) {
    console.error("Failed to send pigeon email:", err);
    res.status(500).json({ error: "The pigeon got lost along the way. Check the server logs." });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pigeon Post server listening on http://localhost:${PORT}`);
});
