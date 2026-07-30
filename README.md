# TapMind Resources

Minimal [Jamdesk](https://jamdesk.com) documentation site for TapMind SDK Integration:

| Page | Path | Live URL |
|------|------|----------|
| Glossary | `glossary.mdx` | `/glossary` |
| Changelog | `changelog.mdx` | `/changelog` |

`/` redirects to `/glossary`.

## Prerequisites

- Node.js **20+**
- A Jamdesk project already created in the [Jamdesk dashboard](https://dashboard.jamdesk.com)
- GitHub repo: [`tirthkanzariya201/tapmind_reference`](https://github.com/tirthkanzariya201/tapmind_reference)

## Set your Jamdesk `projectId`

1. Open the Jamdesk dashboard → your **TapMind Resources** (or equivalent) project.
2. Go to **Project settings** (or the project overview that shows the project ID).
3. Copy the **Project ID**.
4. Paste it into [`docs.json`](./docs.json) as `"projectId"`.

   Do not invent an ID. Do not commit API tokens.

## Local development

```bash
npm install
npm run dev
```

Dev server: [http://localhost:3457](http://localhost:3457) (port from `package.json`).

Validate before you push:

```bash
npm run validate
# or
npx jamdesk validate
```

## Deploy (primary): Jamdesk GitHub App

This site is meant to deploy on **push to `main`** via Jamdesk’s GitHub integration—no deploy tokens in this repo.

### One-time dashboard setup

1. In the [Jamdesk dashboard](https://dashboard.jamdesk.com) → connect the **GitHub App** to repo `tirthkanzariya201/tapmind_reference`.
2. Select branch **`main`**.
3. Set **Docs path** to the **repo root** (where `docs.json` lives).
4. Ensure `docs.json` **`projectId`** matches this Jamdesk project (see above).
5. Push to `main`. After the first successful build, pages are live at:
   - `https://<your-jamdesk-or-custom-domain>/glossary`
   - `https://<your-jamdesk-or-custom-domain>/changelog`

### What CI does in this repo

[`.github/workflows/validate.yml`](./.github/workflows/validate.yml) only runs `npx jamdesk validate` on push/PR. It does **not** publish docs and does **not** use Jamdesk API secrets.

Publishing is handled by the Jamdesk GitHub App after a successful push to `main`.

## Deploy (fallback): Jamdesk CLI

```bash
npx jamdesk login
npx jamdesk validate
npx jamdesk deploy
```

Or: `npm run deploy` after `npm install` and login.

## Project layout

```text
.
├── docs.json                 # Jamdesk site config
├── glossary.mdx              # → /glossary
├── changelog.mdx             # → /changelog
├── images/                   # Logo + favicon
├── package.json
├── .gitignore
└── .github/workflows/validate.yml
```

## Branding / UI

UI matches [docs.tapmind.io](https://docs.tapmind.io) (`TapMind CA Integration`):

- Theme `jam`, primary `#FE7B49`, light-only (`appearance.strict`)
- Logo light/dark + favicon under `images/`
- Navbar **Get Started** → `https://platform.tapmind.io/`
- Shared `style.css` (logo size, prose, callouts, code blocks)
