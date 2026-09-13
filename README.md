# Pigeon Post — link version

No email sending at all anymore. Instead:

1. Someone writes a message and picks a pigeon (Classic, Snow, or Chestnut).
2. The site stores it and hands back a private link, like
   `https://your-site.vercel.app/?id=a1b2c3d4e5`.
3. Whoever opens that link sees the pigeon fly in and the message unroll on
   a little scroll. Nothing is emailed to anyone automatically, and your
   own email account is never involved.

Links expire automatically after 30 days.

```
pigeon-post-link/
├─ index.html              the whole site (compose view + delivery view)
├─ api/
│  ├─ create-message.js     POST -> stores a message, returns an id
│  └─ get-message.js        GET  -> looks up a message by id
├─ package.json
└─ .env.example
```

## 1. Push this to GitHub

If you're replacing the previous version in the same repo:

```bash
cd your-repo-folder
rm -rf api index.html package.json vercel.json server public
cp -r /path/to/pigeon-post-link/. .
git add -A
git commit -m "Switch to link-based pigeon post (no email)"
git push
```

## 2. Add a database (Upstash Redis, via Vercel's Storage tab)

This replaces all the SMTP/Gmail setup from before — no app passwords, no
mail provider signup.

1. Open your project on vercel.com.
2. Click the **Storage** tab.
3. Click **Create Database**, choose **Upstash** → **Redis** (sometimes
   listed under "Marketplace Database Providers").
4. Follow the prompts to create a small/free database and connect it to
   this project.

That's it — Vercel automatically adds `UPSTASH_REDIS_REST_URL` and
`UPSTASH_REDIS_REST_TOKEN` as environment variables on your project. You
don't need to copy or type these yourself.

## 3. Redeploy

Since connecting a new storage integration changes environment variables,
trigger one fresh deploy: **Deployments** tab → **⋯** on the latest one →
**Redeploy**.

## 4. Test it

Open your site, write a message, pick a pigeon, click **Create pigeon
link**. You'll get a link back — open it (in the same browser, an
incognito window, or send it to a friend) and the pigeon should fly in
with your message.

To test the API directly:

```bash
curl -X POST https://your-site.vercel.app/api/create-message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hey! Just flying by to say hi.","fromName":"Alex","pigeon":"chestnut"}'
```

That returns `{"ok":true,"id":"..."}` — open
`https://your-site.vercel.app/?id=...` with that id to see it delivered.

## Notes on the change from the email version

- The old `api/send-pigeon.js`, `api/email-template.js`, SMTP settings,
  and Gmail app password are no longer used — you can remove them if
  they're still in your repo.
- Nothing sends mail on your behalf anymore, so the "is this a liability"
  question from before goes away: the worst someone can do with the link
  is write their own message and share their own link, same as any
  link-sharing tool.
- Links aren't unguessable in a cryptographic sense (they're a random
  10-character id, not a password) — fine for a fun, low-stakes tool
  between friends, not intended for anything sensitive.
- Messages are capped at 600 characters and names at 60, same as before,
  enforced both in the form and on the server.
