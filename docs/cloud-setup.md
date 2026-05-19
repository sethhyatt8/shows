# One-time cloud setup (no terminal)

Your ratings live in **Supabase** (same kind of setup as the Emily calendar). **Anyone can browse** the site; the password is only for **editing** your ratings and reviews.

## 1. Create the reviews table

1. Open [Supabase](https://supabase.com/dashboard) and open the **same project** you use for Emily (or a new one).
2. Go to **SQL Editor** → **New query**.
3. Paste the contents of [`supabase/show-reviews.sql`](../supabase/show-reviews.sql) and click **Run**.

## 2. GitHub secrets (so the live site can connect)

In GitHub: **shows** repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add these three (same names exactly):

| Secret name | Value |
|-------------|--------|
| `VITE_SUPABASE_URL` | From Supabase → **Project Settings** → **API** → Project URL |
| `VITE_SUPABASE_ANON_KEY` | From the same page → `anon` / publishable key |
| `VITE_APP_PASSWORD` | Your site password |

After you save the secrets, push any change to `main` or re-run the **Deploy to GitHub Pages** workflow. The live site will then save reviews to the cloud.

## Security note

The password only hides the app UI. Someone very technical could still talk to Supabase directly unless you add stricter database rules later. For a personal TV list, that is usually fine.
