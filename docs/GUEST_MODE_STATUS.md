# ZAZISE guest view-only — status (2026-10-02 SAST)

## Done in kit (`/workspace/zazise-wireframes/`)
- Guest gate + welcome + limited tour + like toggle (`js/guest-gate.js`)
- whoami guest ZA, no login redirect (`js/whoami.js`)
- Pages: index (guest home), watch, clips, studio, upload, later, help
- i18n keys for gate/welcome/tour/errors/success/not-found (`i18n/ui.json`)
- Language pulls through on gate/welcome/tour/toasts (via `ZaziseI18n` + `zazise:lang`)
- cooking-toast wired on watch/clips/studio/upload/help for clear success/error
- Links: brand/canonical → `index.html` / `https://www.zazise.africa/`; `home-preview.html` redirects to index; later.html home links fixed
- Mail samples: `samples/mail/upload-is-live.html` + `guest-vs-member.html` (+ PNG)
- Deploy script + send scripts ready

## Local QA
`/tmp/zz-guest-qa.mjs` → **FAIL_COUNT=0** (links, AF gate copy, like toast, private not found, langs, mail sample)

## Blocked
- **Deploy:** `ZAZISE_CPANEL_PASS` → cPanel `invalid_login` on basim.aserv.co.za (+ alternates); FTP 530. Need fresh ClientZone/cPanel password (do not invent).
- **Send:** PHP `mail()` scripts need Afrihost box; box has no PHP. Graphic → okekana123@gmail.com then product mailer to confirmed users — ready once deploy/creds work OR parent sends via DraftExternalMessage / server CLI.

## Live spot-check
- Live already serves guest-gate.js and root canonical (partial earlier deploy).
- Live still `guest-gate.js?v=2`; kit is `v=3` with i18n/toast/link polish not uploaded yet.
