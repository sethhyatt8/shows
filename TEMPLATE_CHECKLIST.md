# Template Checklist

Use this checklist each time you clone this repository for a new app.

## 1) Create the new app repo

- Clone this template repository.
- Rename the folder/repository to your new app name.
- Update `package.json` name to match the new app.

## 2) Install and run locally

- Run `npm install`
- Run `npm run dev`
- Confirm the app loads in the browser.

## 3) Set up GitHub Pages

- Push to `main` so `.github/workflows/deploy-pages.yml` runs (it publishes the `dist` folder to the **`gh-pages`** branch).
- In GitHub repo **Settings → Pages**: **Build and deployment → Source** = **Deploy from a branch** → branch **`gh-pages`**, folder **`/`** (root).
- Optionally run manual deploy with `npm run deploy`.

**Pages pitfalls (this workflow = branch `gh-pages`, not “GitHub Actions”):**

- The **branch** dropdown must be **`gh-pages`**, not **`main`**, or the site is blank / wrong (GitHub would serve dev `index.html` from `main`).
- First time: run workflow once, then refresh **Pages** if **`gh-pages`** was not in the list yet.
- Live URL is always **`https://<user>.github.io/<repo>/`** (include **`/<repo>/`**).
- CI sets **`VITE_BASE_PATH`** from the repo name; don’t remove that from the workflow if you rename the repo.
- Don’t mix this with the **other** Pages mode (“GitHub Actions” + `deploy-pages`) unless you change the workflow to match.

## 4) Agent workflow defaults

- Start broad requests in plan/discussion mode when requirements are ambiguous.
- After plan approval, execute end-to-end with minimal interruption.
- Ask concise questions only when blocked by missing external information.
- Run `npm install`, `npm run dev`, and other routine shell commands without pausing for per-command approval (use Cursor allowlists for trusted commands); finish substantive work with `npm run lint` and `npm run build`, then commit/push or deploy as appropriate unless the user opts out.

## 5) Quality gates for substantive changes

- Run `npm run lint`
- Run `npm run build`
- Fix issues before opening PRs or shipping.

## 6) Safety defaults

- Avoid destructive git commands unless explicitly requested.
- Surface high-impact risks before taking action.

## 7) Kickoff prompt for each new app

Paste this into Cursor at the start of a new project:

```text
I cloned this web-app template. Help me build [APP NAME].
Start with a short plan, ask only critical clarifying questions, then implement end-to-end with minimal interruptions.
Stack: React + Vite + TypeScript.
Target: static app deployable to GitHub Pages.
Run dev server, lint, and build without asking me to approve each terminal command; push to GitHub (or deploy) at the end unless I say otherwise.
```
