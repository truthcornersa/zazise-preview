# ZaZise static preview (GitHub Pages)

Static HTML/CSS/JS preview of the ZaZise UI for design review.

- **Preview:** https://truthcornersa.github.io/zazise-preview/
- **Live Afrihost site:** https://www.zazise.africa (separate — not modified by this repo)

## Notes

- PHP `/api/*` endpoints do **not** run on GitHub Pages (registration/login are UI-only).
- Image/video/ favicon assets are loaded from `www.zazise.africa` so this repo stays small and MIME-correct.
- CSS, JS, and HTML shells are served from this Pages site.
- No secrets, user DBs, mail drafts, or deploy scripts.

| Path | What |
|------|------|
| `/` | Home / guest preview |
| `index-register.html` / `register.html` | Registration UI |
| `login.html` | Login UI |
| `watch.html` | Watch player |
