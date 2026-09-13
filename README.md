# Pigeon Post — Vercel version

Same pigeon site, restructured so Vercel hosts both the static page and the
email-sending backend together, on one domain, with no separate server.

```
pigeon-post-vercel/
├─ index.html              the site (served as a static file)
├─ api/
│  ├─ send-pigeon.js        serverless function -> POST /api/send-pigeon
│  ├─ email-template.js     builds the HTML/text email
│  └─ assets/                pigeon.png, scroll-top.png, scroll-bottom.png
├─ package.json              lists nodemailer so Vercel installs it
├─ vercel.json                makes sure the PNGs ship with the function
└─ .env.example
```

## 1. Get SMTP credentials

Same as before — any provider works:
- **Resend** (resend.com): host `smtp.resend.com`, user `resend`, password = API key.
- **Gmail**: host `smtp.gmail.com`, an "app password" from
  myaccount.google.com/apppasswords.
- Postmark / SendGrid / Mailgun / SES also fine.

## 2. Push this folder to GitHub

```bash
cd pigeon-post-vercel
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/pigeon-post.git
git branch -M main
git push -u origin main
```

## 3. Import it into Vercel

1. Go to vercel.com, sign in with GitHub.
2. Click **Add New... > Project**, select your repo.
3. Framework preset: leave as **Other** (it's not Next.js/React — just a
   static HTML file plus one API function). Root directory: leave as `.`.
4. Before clicking Deploy, open **Environment Variables** and add:
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`
   (same values as your `.env`).
5. Click **Deploy**.

Vercel gives you a URL like `https://pigeon-post.vercel.app`. That's it —
one link, and both the page and the sending function live there.

## 4. Test it

Open the deployed URL and release a pigeon. To test the function directly:

```bash
curl -X POST https://pigeon-post.vercel.app/api/send-pigeon \
  -H "Content-Type: application/json" \
  -d '{"to":"you@example.com","fromName":"Alex","message":"Hey! Just flying by to say hi."}'
```

## Testing locally before deploying (optional)

```bash
npm install -g vercel
cp .env.example .env   # fill in your SMTP details
vercel dev
```

This runs the site and the function together on `http://localhost:3000`,
matching production behavior.

## Notes

- `index.html` calls `/api/send-pigeon` as a relative path, so it always
  points at whatever domain it's served from — nothing to update after
  deploying, and no CORS configuration needed since it's the same origin.
- Every push to your GitHub repo's main branch triggers a new deploy
  automatically once the project is connected.
- Free-tier Vercel functions have a short execution timeout (10s by
  default), which is plenty for sending one email.
