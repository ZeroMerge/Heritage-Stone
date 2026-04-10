# RAVEN NORTH STUDIO — HERITAGE STONE PLATFORM
## The Architecture & Template Masterclass
*Version 2.0 — Updated April 2026 — Plug-and-Play Edition*

This document is the complete architectural guide for the Heritage Stone Ecosystem. If you are a developer, AI assistant, or template builder working on this platform, read this entire document before writing a single line of code. It defines every boundary, every data contract, and every decision made in the system.

---

## CHAPTER 1 — THE THREE-LAYER ECOSYSTEM

Everything in Heritage Stone is built on a unidirectional, decoupled 3-layer architecture.

**Layer 1 — The Database (Supabase)**
The single source of truth. All brand data lives here across 14 tables. Nothing is stored anywhere else permanently. The schema is defined in `hs-portal/supabase/schema.sql`.

**Layer 2 — The Studio (hs-studio)**
The admin application built in React + Zustand. Agencies use this to edit brand guidelines, manage team members, configure portals, and assign templates. It writes to Supabase. It sends a cache invalidation signal to the portal server on every save.

**Layer 3 — The Portal (hs-portal + hs-hub)**
The delivery application. `hs-portal` is the Express server that reads from Supabase and serves brand portals. `hs-hub` is the admin frontend for managing templates, previewing, and assigning them. The portal never writes to the database except to `template_assignments`, `brand_section_locks`, and `brand_changelog`.

**The Fundamental Principle:** Studio and Portal never talk to each other directly. They only communicate through Supabase and the single cache invalidation endpoint.

---

## CHAPTER 2 — HOW A PORTAL REQUEST IS SERVED

### Step-by-step: what happens when a client visits `meridian.brand.ravennorth.com`

1. **DNS resolution**: The wildcard DNS record `*.brand.ravennorth.com` points to your server. Any subdomain resolves to the same IP.

2. **Request arrives**: Express receives a GET `/` with Host header `meridian.brand.ravennorth.com`.

3. **Subdomain middleware** (`src/middleware/subdomainRouter.ts`): reads the hostname, extracts `meridian`, rewrites the request URL to `/portal/meridian`. This is the critical production step that was missing in the original code.

4. **Brand router** (`src/routes/brand.ts`): receives the request at `/portal/:slug` where slug = `meridian`.

5. **Cache check**: looks up `meridian` in the in-memory cache. If found and not expired, uses cached data. If not, proceeds to hydration.

6. **Hydration** (`src/lib/hydrator.ts`): runs a `Promise.all` across 10 Supabase queries simultaneously — brand row, sections, introduction, strategy, logos, typography, colors, images, icons, resources, and section locks. Assembles them into a single `HydratedBrandData` object.

7. **Password check**: if `brand.password_protected === true` and the session doesn't have `authenticatedSlug === 'meridian'`, redirect to the branded login page at `/auth/login/meridian`.

8. **Template resolution**: reads `brand.template.dist_path` to find the built Vite app on disk.

9. **Injection** (`src/lib/injector.ts`): reads the template's `dist/index.html`, injects:
   - `window.__BRAND_DATA__ = { ...full HydratedBrandData... }` as a `<script>` tag
   - `:root { --cp: #hexcolor; --cs: #hexcolor; }` CSS variables before `</head>`

10. **Response**: sends the modified HTML to the browser. The browser loads the template JS bundle, which immediately reads `window.__BRAND_DATA__` and renders the brand portal.

**The template never makes a network call. It reads what was placed there for it.**

### Custom domain flow (`guidelines.meridianstudio.com`)

Same flow, except in step 3, the subdomain middleware doesn't match the base domain pattern. It then queries Supabase for a brand where `custom_domain = 'guidelines.meridianstudio.com'`. If found, it resolves to that brand's slug and proceeds normally.

The client's visitors never see anything about Heritage Stone or Raven North.

### How two clients using the same template don't interfere

Template files are pre-built static assets on disk. When `meridian.brand.ravennorth.com` is requested, the server fetches Meridian's data and injects it. When `atlas.brand.ravennorth.com` is requested simultaneously, it fetches Atlas's data and injects that. Both requests use the same template HTML files — but each gets its own data injected before it's sent. They never share state. Each browser instance has its own copy of the data.

---

## CHAPTER 3 — THE HYDRATED BRAND DATA PAYLOAD

This is the template contract. Every template receives exactly this shape via `window.__BRAND_DATA__`. Do not change this shape without updating every template.

```typescript
interface HydratedBrandData {
  brand: BrandRow & { template: TemplateRow | null };
  sections: BrandSectionRow[];        // What sections exist and their order
  introduction: BrandIntroductionRow | null;
  strategy: BrandStrategyRow | null;
  logos: BrandLogoRow[];
  typography: BrandTypographyRow[];
  colors: BrandColorRow[];
  images: BrandImagesRow | null;
  icons: BrandIconsRow | null;
  resources: BrandResourceRow[];
  locks: BrandSectionLockRow[];       // Which sections are locked
}
```

Full type definitions are in `hs-portal/src/types/index.ts`. Do not modify these without also migrating the Supabase schema and updating all templates.

**CSS variables injected alongside the data:**
- `var(--cp)` — primary brand color (hex)
- `var(--cs)` — secondary brand color (hex)
- `var(--cp-contrast)` — white or black for text on `--cp` background
- `var(--cs-contrast)` — white or black for text on `--cs` background

---

## CHAPTER 4 — HOW TO BUILD A TEMPLATE

A template is a standalone Vite + React app that lives in its own folder. It reads `window.__BRAND_DATA__` and renders it however it wants. There is no single-file constraint. A template can have 50 components, its own routing, its own Framer Motion animations, anything.

### Folder structure for a template

```
my-template/
├── src/
│   ├── main.tsx          ← reads window.__BRAND_DATA__, renders App
│   ├── App.tsx           ← root component
│   ├── components/       ← your component tree
│   └── styles/
├── index.html
├── package.json          ← must have "name" and "scripts.build"
├── vite.config.ts
└── tsconfig.json
```

### The template entry point (main.tsx)

```tsx
import ReactDOM from 'react-dom/client';
import { App } from './App';
import type { HydratedBrandData } from './types'; // copy types/index.ts here

const data = (window as Window & { __BRAND_DATA__?: HydratedBrandData }).__BRAND_DATA__;

if (!data) {
  document.body.innerHTML = '<div style="padding:2rem;font-family:sans-serif">No brand data found.</div>';
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App data={data} />);
}
```

### The template root component (App.tsx)

```tsx
import type { HydratedBrandData } from './types';

interface Props {
  data: HydratedBrandData;
}

export function App({ data }: Props) {
  // Render however you want.
  // data.colors[0].hex, data.brand.brand_name, data.typography[0].font_name — all available.
  // Use var(--cp) and var(--cs) in CSS for the primary/secondary colors.
  return (
    <div>
      <h1>{data.brand.brand_name}</h1>
    </div>
  );
}
```

### Section ID contract (for scroll-spy)

If your template supports the portal's IntersectionObserver scroll-spy, every major section must use this exact ID format:

```tsx
<section id={`section-${section.section_type}`}>
  {/* your content */}
</section>
```

This is optional — if your template has its own navigation (horizontal scroll, tabs, pages), you don't need scroll-spy.

### Section lock contract

Every template must check the `data.locks` array before rendering change-request UI or feedback buttons. If a section is locked, hide that UI.

```tsx
const isLocked = (sectionType: string) =>
  data.locks.some((l) => l.section_type === sectionType);

// In your section render:
{!isLocked('color_palette') && <FeedbackButton section="color_palette" />}
```

### What templates CAN do
- Use any npm packages
- Have their own routing (React Router, TanStack Router, etc.)
- Use multi-page flows, horizontal scroll, tabbed interfaces, slideshows
- Load external fonts via Google Fonts or similar
- Use Framer Motion, GSAP, Three.js
- Use local state (`useState`, `useReducer`) for UI interactions
- Import Cloudinary URLs from `data.logos[0].file_url` directly

### What templates CANNOT do
- Fetch data from any API — all data is in `window.__BRAND_DATA__`
- Import or call `supabase` directly
- Write to any database
- Modify the shape of `HydratedBrandData`

---

## CHAPTER 5 — THE TEMPLATE UPLOAD PIPELINE

When you upload a template zip through the Hub:

1. The zip is posted to `POST /upload/template` with `x-hub-secret` header
2. Server extracts the zip to `TEMPLATES_DIR/<id>/`
3. Validator checks: `package.json` exists, has `name` and `scripts.build`, has `src/` directory
4. `npm install --prefer-offline --no-audit` runs (uses cache if available)
5. `npm run build` runs — Vite compiles to `dist/`
6. Verifies `dist/index.html` exists
7. `node_modules` is deleted to save disk space (source is kept for rebuilds)
8. Template is registered in Supabase `templates` table with its `dist_path`
9. Build log is returned to the Hub UI with per-line timestamps

If any step fails, the entire template folder is deleted and a detailed error is returned.

**What to zip:** the template source folder contents (not including node_modules or dist). The zip can have a single root folder inside it — the server flattens it automatically.

```
# Correct zip structure (both work):
my-template.zip
└── src/
└── package.json
└── vite.config.ts
└── index.html

# Also works (single root folder):
my-template.zip
└── my-template/
    ├── src/
    ├── package.json
    ├── vite.config.ts
    └── index.html
```

---

## CHAPTER 6 — CACHE SYSTEM

**How it works:** First request for a slug → Supabase hydration → stored in memory. All subsequent requests within the TTL window → served from memory, zero database calls.

**TTL:** Controlled by `CACHE_TTL_SECONDS` env var (default 300 = 5 minutes). After TTL expires, the next request triggers a fresh hydration.

**Invalidation:** When the Studio saves brand data, it calls `POST /invalidate/:slug` with the `x-hub-secret` header. The server deletes that slug's cache entry. The next request gets fresh data.

**Important:** The in-memory cache is per-process and does not persist across server restarts. On Render, the server restarts automatically on deploy — all caches are cold on startup. This is fine; the first request per slug after a restart will hydrate from Supabase.

**Upgrading to Redis:** Replace `cacheGet`, `cacheSet`, `cacheInvalidate` in `src/lib/cache.ts` with Redis adapter calls. The rest of the system doesn't change.

---

## CHAPTER 7 — SECTION LOCKS

Section locks prevent clients from requesting changes to approved brand elements. The lock state is part of `HydratedBrandData` and delivered to every template.

**Lock a section** (from Hub):
```
POST /api/v1/brand/:slug/locks
Body: { section_type: "color_palette", locked_by: "user@agency.com", reason: "Approved by client 2025-04-01" }
```

**Unlock a section:**
```
DELETE /api/v1/brand/:slug/locks/color_palette
```

After every lock/unlock operation, the cache for that slug is automatically invalidated so the next portal visit reflects the change.

**Template behavior when a section is locked:**
```tsx
// data.locks is an array of BrandSectionLockRow
const colorLock = data.locks.find(l => l.section_type === 'color_palette');

if (colorLock) {
  // Show lock badge with colorLock.reason and colorLock.locked_at
  // Hide any feedback/change-request buttons
} else {
  // Normal rendering with feedback UI
}
```

---

## CHAPTER 8 — CHANGELOG & COLORS API

### Public changelog
```
GET /api/v1/brand/:slug/changelog?limit=20
```
Returns the most recent public changelog entries for a brand. No authentication required. Safe to call from Figma plugins, Notion integrations, or any external tool.

### Live color palette
```
GET /api/v1/brand/:slug/colors
```
Returns the current color palette as a flat JSON array. Each color includes hex, rgb, cmyk, pantone, usage_role, and accessibility_level. Use this in CI pipelines to verify brand color compliance, or in Figma plugins to always show the current approved palette.

### Writing changelog entries (from Studio)
```
POST /api/v1/brand/:slug/changelog
Header: x-hub-secret: <HUB_SECRET>
Body: { section_type: "colors", change_summary: "Updated primary blue", changed_by: "user@agency.com", is_public: true }
```

---

## CHAPTER 9 — SUBDOMAIN & CUSTOM DOMAIN SETUP

### Setting up `*.brand.ravennorth.com`

In your DNS provider (Cloudflare, etc.):
```
Type: A
Name: *.brand
Value: <your-server-IP>
TTL: Auto
```

This routes `anything.brand.ravennorth.com` to your server. The `subdomainRouter` middleware handles the rest.

Set in your `.env`:
```
PORTAL_BASE_DOMAIN=brand.ravennorth.com
```

### Setting up a custom domain for a brand

1. The client adds a CNAME in their DNS:
   ```
   Type: CNAME
   Name: guidelines
   Value: brand.ravennorth.com
   TTL: 3600
   ```

2. You update the brand in Supabase:
   ```sql
   update brands set custom_domain = 'guidelines.meridianstudio.com' where slug = 'meridian';
   ```

3. That's it. The subdomainRouter checks `brands.custom_domain` on every request from an unrecognized hostname.

### SSL certificates

On Render, SSL is handled automatically for your primary domain. For custom client domains, use Cloudflare in front of Render — clients proxy their domain through Cloudflare, which handles SSL automatically with no configuration on your side.

---

## CHAPTER 10 — PASSWORD PROTECTION

Brands can be marked `password_protected = true` in Supabase. When set:
1. Visiting the portal redirects to `/auth/login/:slug`
2. A branded login page is shown (uses the brand name, dark theme)
3. Client enters the password
4. Server compares against `brands.password_hash`
5. On success, sets `req.session.authenticatedSlug = slug` and redirects to the portal
6. Session cookie persists for 24 hours

**IMPORTANT:** The current implementation does a plaintext comparison for simplicity. Before going live, upgrade to bcrypt:
```typescript
import bcrypt from 'bcrypt';
const match = await bcrypt.compare(password, brand.password_hash);
```
Store hashed passwords: `await bcrypt.hash(plaintext, 12)`.

---

## CHAPTER 11 — PRODUCTION DEPLOYMENT (RENDER)

### hs-portal (Web Service)

1. Create a new Web Service on Render, connect your git repo, set root directory to `hs-portal`
2. Build command: `npm install && npm run build`
3. Start command: `node dist/server.js`
4. Environment variables: copy from `.env.example`, fill in all values
5. Add a Persistent Disk: mount at `/app/templates`, size 10GB+ (template builds live here)
6. Set `TEMPLATES_DIR=/app/templates` in env vars

### hs-hub (Static Site)

1. Create a new Static Site on Render, connect your git repo, set root to `hs-hub`
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Environment variables: `VITE_PORTAL_URL` (your portal's Render URL), `VITE_HUB_SECRET` (same as `HUB_SECRET` in portal)

### hs-studio (existing app — one change needed)

Add this call in the Studio's save function (wherever it calls Supabase to persist brand data):

```typescript
// After the Supabase update succeeds:
await fetch(`${process.env.VITE_PORTAL_URL}/invalidate/${slug}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-hub-secret': process.env.VITE_PORTAL_SECRET,
  },
  body: JSON.stringify({ reason: 'Studio save' }),
}).catch(() => {}); // Never let a cache invalidation failure break a save
```

Add `VITE_PORTAL_URL` and `VITE_PORTAL_SECRET` to the Studio's `.env`.

---

## CHAPTER 12 — QUICK SETUP (NEW DEVELOPER)

```bash
# 1. Run the database schema in Supabase SQL Editor
#    Paste contents of hs-portal/supabase/schema.sql and run

# 2. Create the portal-assets storage bucket in Supabase
#    Dashboard → Storage → New Bucket → Name: portal-assets → Public: ON

# 3. Set up hs-portal
cd hs-portal
cp .env.example .env
# Fill in: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SESSION_SECRET, HUB_SECRET
npm install
npm run dev   # starts on http://localhost:3001

# 4. Set up hs-hub
cd ../hs-hub
cp .env.example .env
# Fill in: VITE_PORTAL_URL=http://localhost:3001, VITE_HUB_SECRET=<same as HUB_SECRET>
npm install
npm run dev   # starts on http://localhost:5174

# 5. Create your first brand in Supabase
#    Insert a row into the brands table with a slug, brand_name, is_published=true

# 6. Visit http://localhost:3001/portal/your-slug to see the portal
#    (No template assigned yet — you'll see the "being set up" page)

# 7. Upload a template via the Hub at http://localhost:5174/upload

# 8. Assign the template to your brand at http://localhost:5174/assign/your-slug

# 9. Visit http://localhost:3001/portal/your-slug — the brand portal loads
```

---

## APPENDIX — BUGS FIXED IN VERSION 2.0

| File | Bug | Fix |
|---|---|---|
| `src/lib/builder.ts` | `require("stream")` in ESM + wrong `Readable.from()` usage — zip extraction would corrupt or crash | Replaced with `import { Readable } from 'stream'` and proper `readable.push(buffer)` + `readable.push(null)` pattern |
| `src/server.ts` | `express-session` never mounted — `req.session` always `undefined`, crashing password-protected brand routes | Added `express-session` middleware with proper cookie config |
| `package.json` | `express-session` and `@types/express-session` missing | Added both dependencies |
| `src/middleware/subdomainRouter.ts` | Did not exist — all subdomain portals returned 404 in production | Created new middleware that reads `Host` header and rewrites URL to `/portal/:slug` |
| `src/lib/thumbnailer.ts` | `page.waitForTimeout()` removed in Puppeteer v22 — thumbnail generation would crash | Replaced with `await new Promise(r => setTimeout(r, 1500))` |
| `src/routes/hub.ts` | `req.hostname + PORT` for thumbnail URL broke behind proxies | Replaced with `PORTAL_INTERNAL_URL` env var read directly by thumbnailer |
| `supabase/schema.sql` | Did not exist — impossible to set up database without manually guessing table structures | Created complete 14-table schema with indexes, RLS, and storage bucket instructions |
| `.env.example` | Missing `SESSION_SECRET`, `PORTAL_BASE_DOMAIN`, `PORTAL_INTERNAL_URL` | Added all new variables with documentation |
