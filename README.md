# ZaZise static preview (GitHub Pages)

**Repo:** https://github.com/truthcornersa/zazise-preview  
**Preview URL (after Pages is enabled):** https://truthcornersa.github.io/zazise-preview/  
**Live Afrihost site (untouched):** https://www.zazise.africa/

## One-time: enable GitHub Pages (required)

GitHub Actions cannot create the Pages site for this account (`Resource not accessible by integration`). Do this once in the browser:

1. Open **https://github.com/truthcornersa/zazise-preview/settings/pages**
2. Under **Build and deployment → Source**, choose **Deploy from a branch**
3. Branch: **main** · Folder: **/ (root)** · **Save**
4. Wait 1–2 minutes, then open https://truthcornersa.github.io/zazise-preview/

(Optional alternative Source: **GitHub Actions** — then re-run the “Deploy GitHub Pages” workflow.)

## What is published

- `index.html` / `register.html` — registration UI (CSS/JS/assets from www.zazise.africa)
- `login.html`, `watch.html`, `help.html` — preview shells
- `.nojekyll`, README, robots, sitemap, 404

## Expected limitations

- PHP `/api/*` does **not** run (register/login are UI-only alerts)
- Image/CSS/JS loaded from live Afrihost CDN so this repo stays small
- Full home-preview HTML kit is staged locally; more pages can be added after Pages is on
- No secrets, user DBs, mail drafts, or Afrihost changes
