# hs-portal

Node/Express backend that serves Heritage Stone brand portals by subdomain slug. It hydrates brand data from Supabase, injects it into pre-built Vite template apps, handles template uploads and builds, manages section locks, exposes a public changelog API, and runs a live preview server for the Hub admin UI.

For full architecture documentation, read `MASTERCLASS.md` at the repo root.

---

## Quick start

```bash
# 1. Set up the database first (only needed once)
# Paste hs-portal/supabase/schema.sql into Supabase SQL Editor and run it.
# Then create a storage bucket: Dashboard → Storage → New Bucket → Name: portal-assets → Public: ON

# 2. Configure environment
cp .env.example .env
# Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HUB_SECRET, SESSION_SECRET

# 3. Generate secrets (paste output into .env)
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('HUB_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# 4. Install and run
npm install
npm run dev     # Hot-reload dev server at http://localhost:3001
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key — bypasses RLS. Keep secret. |
| `HUB_SECRET` | ✅ | Shared secret for all Hub→Portal admin API calls. Must match `VITE_HUB_SECRET` in hs-hub. |
| `SESSION_SECRET` | ✅ | Secret for signing session cookies (password-protected portals). Min 32 chars. |
| `PORT` | — | Default `3001` |
| `NODE_ENV` | — | `development` or `production` |
| `HUB_ORIGIN` | — | hs-hub URL for CORS. Default `http://localhost:5174` |
| `STUDIO_ORIGIN` | — | hs-studio URL for CORS. Default `http://localhost:5173` |
| `PORTAL_BASE_DOMAIN` | — | Base domain for subdomain routing. Set to `brand.ravennorth.com` in production. Leave blank for dev (use `/portal/:slug` directly). |
| `TEMPLATES_DIR` | — | Directory where uploaded template folders are stored. Use a persistent disk on Render. Default `./templates` |
| `CACHE_TTL_SECONDS` | — | Per-slug brand data cache TTL. Default `300` (5 minutes) |
| `PORTAL_INTERNAL_URL` | — | URL Puppeteer uses to reach the portal for thumbnail screenshots. Default `http://localhost:3001` |
| `THUMB_WIDTH` / `THUMB_HEIGHT` | — | Thumbnail screenshot dimensions. Default `1280×800` |

---

## All routes

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | public | Health check |
| `GET` | `/portal/:slug` | public | Serve brand portal |
| `GET` | `/portal/:slug/assets/*` | public | Serve template static assets |
| `GET` | `/preview/:slug/:templateId` | public | Render any template with any brand — Hub preview iframe |
| `GET` | `/auth/login/:slug` | public | Password-protected portal login page |
| `POST` | `/auth/login/:slug` | public | Validate password, set session |
| `POST` | `/upload/template` | HUB_SECRET | Upload + build a template zip |
| `DELETE` | `/upload/template/:id` | HUB_SECRET | Delete a template and its files |
| `POST` | `/invalidate/:slug` | HUB_SECRET | Evict a slug from cache |
| `POST` | `/invalidate/_all` | HUB_SECRET | Flush entire cache |
| `GET` | `/invalidate/stats` | HUB_SECRET | Cache statistics |
| `GET` | `/hub/brands` | HUB_SECRET | List all brands |
| `GET` | `/hub/brands/:slug` | HUB_SECRET | Get a single brand |
| `GET` | `/hub/templates` | HUB_SECRET | List all registered templates |
| `GET` | `/hub/templates/:id` | HUB_SECRET | Get a single template |
| `PATCH` | `/hub/templates/:id` | HUB_SECRET | Update template metadata |
| `POST` | `/hub/brands/:slug/assign-template` | HUB_SECRET | Assign a template to a brand |
| `GET` | `/hub/brands/:slug/value-mapping` | HUB_SECRET | Check which sections a brand is missing vs template requirements |
| `POST` | `/hub/templates/:id/thumbnail` | HUB_SECRET | Generate + upload Puppeteer screenshot |
| `GET` | `/hub/cache/stats` | HUB_SECRET | Cache stats (Hub version) |
| `GET` | `/api/v1/brand/:slug/changelog` | public | Public changelog entries |
| `POST` | `/api/v1/brand/:slug/changelog` | HUB_SECRET | Write a changelog entry |
| `GET` | `/api/v1/brand/:slug/colors` | public | Live color palette as JSON |
| `GET` | `/api/v1/brand/:slug/locks` | HUB_SECRET | List section locks |
| `POST` | `/api/v1/brand/:slug/locks` | HUB_SECRET | Lock a section |
| `DELETE` | `/api/v1/brand/:slug/locks/:type` | HUB_SECRET | Unlock a section |

All `HUB_SECRET` routes require the header `x-hub-secret: <HUB_SECRET>`.

---

## How templates work

A template is a pre-built Vite app. The portal serves its `dist/` folder with one modification: brand data is injected into `index.html` as `window.__BRAND_DATA__` before it's sent to the browser. The template reads this global on startup and renders.

**Templates never fetch data. They receive it.**

Template upload flow:
1. POST a `.zip` file (source code, no `node_modules`) to `/upload/template`
2. Server extracts to `TEMPLATES_DIR/<id>/`
3. Validates: `package.json` with `name` and `scripts.build`, `src/` directory present
4. `npm install --prefer-offline --no-audit`
5. `npm run build`
6. Verifies `dist/index.html` exists
7. Cleans `node_modules` to save disk space
8. Registers in Supabase `templates` table

See `MASTERCLASS.md` Chapter 4 for the complete template building guide.

---

## How the cache works

Each brand slug gets an in-memory entry containing the full `HydratedBrandData`. First request hydrates from Supabase (10 parallel queries). Subsequent requests within `CACHE_TTL_SECONDS` skip Supabase entirely.

**Invalidation:** `hs-studio` calls `POST /invalidate/:slug` after every save. The cache entry for that slug is deleted and the next request re-hydrates.

The cache is per-process and resets on server restart. To add Redis persistence, replace `cacheGet`/`cacheSet`/`cacheInvalidate` in `src/lib/cache.ts`.

---

## Subdomain routing in production

Set `PORTAL_BASE_DOMAIN=brand.ravennorth.com` and add a wildcard DNS record:
```
Type: A
Name: *.brand
Value: <your-server-IP>
```

The `subdomainRouter` middleware reads the `Host` header on every request. If the hostname ends with `.brand.ravennorth.com`, it extracts the slug and rewrites the request path to `/portal/:slug`. If the hostname matches a `custom_domain` in the `brands` table, it resolves to that brand instead.

Without `PORTAL_BASE_DOMAIN` set (local dev), use `/portal/:slug` directly.

---

## Adding a new route

1. Create `src/routes/yourRoute.ts` — export a `Router`
2. Add `requireSecret` middleware if the route is admin-only
3. Import and mount in `src/server.ts`:
   ```typescript
   import { yourRouter } from './routes/yourRoute.js';
   app.use('/your-path', yourRouter);
   ```
4. Add corresponding API method to `hs-hub/src/lib/api.ts`

---

## Production deployment on Render

1. New Web Service → connect repo → root directory: `hs-portal`
2. Build command: `npm install && npm run build`
3. Start command: `node dist/server.js`
4. Add Persistent Disk → Mount path: `/app/templates` → Size: 10GB+
5. Set `TEMPLATES_DIR=/app/templates`
6. Set all required env vars from `.env.example`
7. Under Settings → Add your domain → Set `PORTAL_BASE_DOMAIN` to match

---

## Supabase tables required

`brands`, `templates`, `brand_sections`, `brand_introductions`, `brand_strategies`, `brand_logos`, `brand_typography`, `brand_colors`, `brand_images`, `brand_icons`, `brand_resources`, `brand_section_locks`, `brand_changelog`, `template_assignments`

Run `supabase/schema.sql` to create all tables in one shot.
