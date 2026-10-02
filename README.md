# ZAZISE wireframes + sample registration (NOT live)

Local demo only. **Do not deploy** to zazise.africa. This extends the existing wireframe kit (`register.html`, `thank-you.html`, SA doodle + Joburg + Cape Town backgrounds, 3D icon + flat wordmark, brand colours `#E2AE41` / `#183D83` / `#317045`).

## How to run the demo

```bash
cd /workspace/zazise-wireframes
npm install
npm start
```

Open **http://127.0.0.1:8787/register.html**

- `POST /api/register` accepts `{ name, email, humanVerified }` — **no password from the client**
- Server stores `passwordHash` = **Argon2id of a random secret generated server-side** (never emailed, never logged in plaintext). This keeps a password column in the local DB without collecting one from the user.
- Success redirects to `thank-you.html`
- Validation / captcha / server errors show as **toasts** on the register screen

Health check: `GET /api/health`

## Where users / hashes are stored

- File: `data/users.json`
- Shape: `{ "users": [ { "id", "name", "email", "passwordHash", "passwordSource": "server-random", "createdAt" } ] }`
- `passwordHash` is a PHC-encoded Argon2id string (`$argon2id$v=19$m=…`) of a **server-generated random token** — not a user-chosen password
- The random token is discarded after hashing; it is never emailed or written to notification logs

Demo parameters (not production hardening): `m=65536` KiB, `t=3`, `p=1`, 16-byte random salt, 32-byte hash.

## Auth UI (register)

1. Required fields: **full name + email** only (password field removed)
2. **Human check:** “Verify I'm human” checkbox + honeypot — must pass before submit (toast on fail)
3. Google / Apple OAuth buttons **removed**
4. “Sign in” / already-have-account link **hidden** for now
5. Success → thank-you; CTA back to register with light green hover
6. Responsive mobile (~44–48px taps)

## Background animation

On **register** and **thank-you**, three full-bleed images crossfade every **3 seconds**:

1. `assets/login-bg-sa-doodle.jpg` (existing SA doodle)
2. `assets/login-bg-joburg.jpg`
3. `assets/login-bg-cape-town.jpg`

Implementation: `.auth-bg` fixed layers + `js/auth-bg.js` toggles `.is-active` with CSS opacity transition (~1.05s). `background-size: cover; background-position: center;` — zero page margin.

## Argon2id library

- **Server:** Node + Express + **`hash-wasm`** `argon2id()` (pure WASM — no native compile)
- Chosen because the native `argon2` npm package requires `node-gyp`/`make`, which is not available in this box

## i18n (language toggle)

- Works on **register** and **thank-you**
- Languages: EN, AF, ZU, XH, ST, TN, NSO, TS, SS, VE, NR (+ SASL uses EN UI strings)
- Curated static JSON — `i18n/ui.json`
- Preference persisted in `localStorage` key `zazise.lang`
- Client: `js/i18n.js`

## Samples

Watermarked (`#TruthCorner` ~2%) under `samples/`:

| File | Size |
|------|------|
| `samples/register.png` | 1920×1200 |
| `samples/thank-you.png` | 1920×1200 |
| `samples/register-mobile.png` | 390×844 @2x (780×1688) |
| `samples/thank-you-mobile.png` | 390×844 @2x (780×1688) |
| `samples/zazise-icon-3d-stripped.png` | fresh 3D icon, soft shadows stripped, transparent |

Regen (with demo server running):

```bash
npm run capture-samples
```

## Notifications — "Zazise Early Adopters"

On **every successful registration**, the demo emits a notification with title exactly:

> **Zazise Early Adopters**

Body includes **registrant name + email only** (never a password).

### Delivery (local demo — NOT live)

1. **JSON log:** `data/notifications.json`
2. **Markdown log:** `data/early-adopters-notifications.md`
3. **In-UI inbox:** http://127.0.0.1:8787/notifications.html
4. **Console banner** (title + registrant name/email + file paths — never prints `ZAZISE_NOTIFY_EMAIL`)
5. **API:** `GET /api/notifications`
6. **Outbound mail (optional):** if `ZAZISE_NOTIFY_EMAIL` is set (env or loaded from `/home/box/agent-data/box-secrets.json` card on start), nodemailer tries SMTP. Local `.eml` draft always written under `data/mail-drafts/` (To line redacted).

**Never commit or paste the notify address into README, samples, logs, or source.**

Server listens on **127.0.0.1 only** — sample / not live; do not deploy.

## Limitations

- Server binds **127.0.0.1** only — local demo; **do not deploy**
- Outbound notify mail requires env/secrets + SMTP; otherwise local logs/drafts only
- **Sample / not live** — no OAuth
- Local JSON store is not multi-process safe; fine for a single demo server
- Argon2 memory/time params are demo-friendly, not a production policy
