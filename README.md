# Melt The Machine

Community safety reporting app built with React + Vite + Supabase, with Netlify Functions for abuse controls.

## Stack

- React 19 + Vite + TypeScript
- Supabase (Postgres + Storage)
- Netlify (static hosting + serverless functions)

## What Changed

- Added Netlify deploy config: [`netlify.toml`](./netlify.toml)
- Added rate-limited server endpoints:
  - `/.netlify/functions/report-create`
  - `/.netlify/functions/sighting-vote`
- Added optional report image upload (JPG/PNG) with client-side validation:
  - Max file size: `2MB`
  - Allowed dimensions: `600x600` to `3000x3000`
  - Compression helper links shown in UI (`tinypng.com`, `compressjpeg.com`)
- Added schema support for:
  - Sighting image metadata (`image_url`, `image_path`)
  - Per-client vote tracking (`sighting_votes`)
  - Function rate-limit tracking (`api_rate_limits`)
  - Public bucket and policies for `sighting-images`

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Fill in `.env` values.
4. Start app:
   ```bash
   npm run dev
   ```

## Supabase Setup

1. Open SQL editor in Supabase.
2. Run [`src/lib/schema.sql`](./src/lib/schema.sql).
3. Confirm bucket `sighting-images` exists and is public.

Notes:
- The frontend uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Netlify Functions use `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-side secret).

## Netlify Deployment

1. Push repo to Git provider.
2. Create a Netlify site from that repo.
3. Build settings are auto-read from [`netlify.toml`](./netlify.toml):
   - Build command: `npm run build`
   - Publish dir: `dist`
   - Functions dir: `netlify/functions`
4. Add Netlify environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Optional: `RATE_LIMIT_WINDOW_SECONDS`, `REPORT_LIMIT_PER_WINDOW`, `VOTE_LIMIT_PER_WINDOW`
5. Deploy.

## Abuse Controls

- Report creation and voting now go through server endpoints, not direct anonymous DB writes from the browser.
- Rate limiting is tracked using IP + `client_id` and stored in `api_rate_limits`.
- Duplicate voting on one sighting by the same client is blocked via unique constraint in `sighting_votes`.

Important:
- This is a practical baseline, not bot-proof security.
- For stronger protection, add CAPTCHA/challenge flow before report creation.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
# Melt-The-Machine
# FUCK-ICE
