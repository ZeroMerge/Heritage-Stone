# hs-hub

React admin frontend for the Heritage Stone portal ecosystem. The agency uses this to manage brands, upload templates, preview and assign templates to brands, lock approved sections, and monitor the portal cache.

This is an internal tool — never expose it publicly. It talks to `hs-portal` using a shared `HUB_SECRET`.

---

## Quick start

```bash
cp .env.example .env
# VITE_PORTAL_URL — URL of hs-portal (http://localhost:3001 in dev)
# VITE_HUB_SECRET — must exactly match HUB_SECRET in hs-portal's .env

npm install
npm run dev     # Starts on http://localhost:5174
```

`hs-portal` must be running at `VITE_PORTAL_URL`.

---

## Environment variables

| Variable | Description |
|---|---|
| `VITE_PORTAL_URL` | hs-portal base URL. Default `http://localhost:3001` |
| `VITE_HUB_SECRET` | Shared secret — must match `HUB_SECRET` in hs-portal. Sent as `x-hub-secret` header on all admin API calls. |

---

## Pages

| Route | Page | What it does |
|---|---|---|
| `/` | BrandList | Dashboard of all brands with status, last updated, current template |
| `/templates` | TemplateGallery | All registered templates with thumbnails, active toggle, delete |
| `/upload` | UploadTemplate | Drag-and-drop zip upload with real-time build log |
| `/preview` | LivePreview | Select any brand + any template → see them live in an iframe |
| `/assign/:slug` | TemplateToggle | Split-screen: template list left, live iframe right. Click to preview, assign to make it live |
| `/mapping/:slug` | ValueMapping | Section completeness check — which sections a brand has vs what a template needs |
| `/locks` | SectionLocks | Per-brand section lock/unlock with locked-by metadata and reason |
| `/cache` | CacheAdmin | Cache statistics, per-slug invalidation, flush all |

---

## The core workflow: previewing and switching templates

1. Go to `/assign/:slug` for any brand
2. The left panel lists all active templates with thumbnails
3. Click any template — the right iframe loads `/preview/:slug/:templateId` in real time
4. This is **real brand data rendered by the real template** — exactly what the client would see
5. Click **Assign Template** — writes the assignment to Supabase and invalidates the cache
6. The next visitor to the live portal URL gets the new template

No page refresh, no build step, no touching the live URL until you explicitly assign.

---

## Template upload workflow

1. Go to `/upload`
2. Drag a `.zip` of your template's source code (no `node_modules`, no `dist`)
3. Enter your name for the audit trail
4. Click Upload & Build
5. Watch the real-time build log as the server runs `npm install` and `npm run build`
6. On success: template appears in the gallery and preview is available
7. On failure: full error log shown — fix the issue and try again

**What to zip:** the template folder contents. The zip can have a root folder inside — the server flattens it automatically.

---

## How API calls work

All calls go through `src/lib/api.ts`. Every admin call includes the `x-hub-secret` header. In development, Vite's proxy in `vite.config.ts` forwards `/hub`, `/upload`, `/invalidate`, `/api`, and `/preview` to `http://localhost:3001` — no CORS issues.

In production:
- Point `VITE_PORTAL_URL` to your Render portal URL
- Ensure `HUB_ORIGIN` in hs-portal's `.env` is set to your hs-hub deployment URL

---

## Adding a new page

1. Create `src/pages/YourPage.tsx`
2. Add the route in `src/App.tsx`:
   ```tsx
   <Route path="/your-path" element={<YourPage />} />
   ```
3. Add the nav link in `src/components/Sidebar.tsx`
4. Add API methods to `src/lib/api.ts` if needed

---

## Production deployment on Render

1. New Static Site → connect repo → root directory: `hs-hub`
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Environment variables: `VITE_PORTAL_URL` and `VITE_HUB_SECRET`

The hub is statically deployed — no server needed. All requests proxy through to `hs-portal`.
