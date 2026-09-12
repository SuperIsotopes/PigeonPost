# Pigeon Post

A cute pigeon-flight animation on the front end, wired to a real backend
that sends an illustrated HTML email — pigeon art, a parchment scroll, and
your message — to whoever you send it to.

```
pigeon-post/
├─ public/
│  └─ index.html        the site (pigeon animation + form)
└─ server/
   ├─ index.js           Express server, POST /send-pigeon
   ├─ email-template.js  builds the HTML/text email
   ├─ assets/            pigeon.png, scroll-top.png, scroll-bottom.png
   ├─ package.json
   └─ .env.example       copy to .env and fill in
```

## 1. Get an email-sending account

You need SMTP credentials from *some* provider — this only takes a few
minutes. Any of these work with no code changes:

- **Resend** (resend.com) — easiest, generous free tier, SMTP host is
  `smtp.resend.com`, username `resend`, password is your API key.
- **Gmail** — works fine for personal use. Turn on 2-factor auth, then
  create an "app password" at myaccount.google.com/apppasswords and use
  that as `SMTP_PASS` (not your normal password).
- **Postmark / SendGrid / Mailgun / Amazon SES** — all give you SMTP
  credentials in their dashboard.

## 2. Configure the server

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
and `FROM_EMAIL`. For most providers other than Gmail, `FROM_EMAIL` needs
to be a verified sender or domain in that provider's dashboard first.

## 3. Run it

```bash
npm start
```

This starts the server at `http://localhost:3000`. Test it directly:

```bash
curl -X POST http://localhost:3000/send-pigeon \
  -H "Content-Type: application/json" \
  -d '{"to":"you@example.com","fromName":"Alex","message":"Hey! Just flying by to say hi."}'
```

You should get a `{"ok":true}` back and an illustrated email in your inbox
within a few seconds.

## 4. Point the site at your server

Open `public/index.html` and find this line near the bottom:

```js
const API_URL = 'http://localhost:3000/send-pigeon';
```

Change it to wherever you deploy the server (step 5). Then open
`public/index.html` in a browser (or host it anywhere static — Netlify,
Vercel, GitHub Pages, S3) and try releasing a pigeon.

## 5. Deploy the server somewhere it can stay running

`localhost` only works while your own machine is running the server.
For a link you can actually share, deploy `server/` to any Node host:

- **Render.com** — connect the repo, set the root directory to `server`,
  build command `npm install`, start command `npm start`, add your `.env`
  values as environment variables in the dashboard.
- **Railway.app** — same idea, very quick from a GitHub repo.
- **Fly.io / a small VPS** — works too if you want more control.

Whichever you pick, set the same environment variables from `.env` in
that platform's dashboard (never commit your real `.env` file), then
update `API_URL` in `public/index.html` to that deployed URL.

## Notes

- The pigeon and scroll images are attached to the email as inline (CID)
  images rather than linked or base64-embedded — that's the combination
  that renders most reliably across Gmail, Outlook, and Apple Mail.
- Messages are capped at 600 characters server-side as well as in the UI.
- `cors` is wide open in `index.js` for simplicity. If you deploy this
  publicly, consider restricting `origin` to your actual site's domain.
