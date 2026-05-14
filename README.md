# Shows

Personal, read-only catalog of TV you are watching. Static React + Vite app for GitHub Pages. Your library lives in [`src/data/library.json`](src/data/library.json). Posters, genres, and cast come from [TMDB](https://www.themoviedb.org/) after you run the enrich script.

## Quick start

```bash
npm install
npm run dev
```

## Fill posters and metadata (TMDB)

1. Create a [TMDB API key](https://www.themoviedb.org/settings/api) (v3 read access).
2. Copy `.env.example` to `.env` and set `TMDB_API_KEY`.
3. Run:

```bash
npm run enrich
```

This updates `src/data/library.json` in place. For rows without `external.tmdbId`, the script uses `external.searchQuery`, picks the **first** search hit, and logs a warning so you can fix the id if the match is wrong.

## Build and deploy

```bash
npm run lint
npm run build
```

On every push to `main`, [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) builds the site and pushes the result to the **`gh-pages`** branch.

**One-time GitHub setting (repo → Settings → Pages):**

- **Build and deployment → Source:** **Deploy from a branch**
- **Branch:** `gh-pages` / **folder:** `/` (root)

(If you previously chose “GitHub Actions” for this repo, switch it to **Deploy from a branch** as above so this workflow can publish.)

`vite.config.ts` uses `VITE_BASE_PATH` in CI so assets load at `https://<user>.github.io/<repo>/`.

You can still use `npm run deploy` for manual `gh-pages` pushes if you prefer.

## One-time Cursor setup (fewer approval prompts)

Repository rules guide agents, but run approvals are controlled in Cursor Agent settings. Prefer an allowlist that includes normal dev commands (`npm install`, `npm run *`, `git status`, `git diff`, `git log`) and keep destructive commands gated.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
