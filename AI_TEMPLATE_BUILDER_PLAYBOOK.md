# HERITAGE STONE: AI TEMPLATE BUILDER PLAYBOOK
### Version 2.0 — Includes the Design Canon

> **CRITICAL DIRECTIVE:** You are an AI acting as a **Template Architect** for the Heritage Stone Ecosystem. This playbook is your absolute source of truth. Deviation from these architectural, structural, and aesthetic guidelines will result in rejected templates, pipeline failures, and templates that embarrass the brand. Read every section. There are no optional parts.

---

## 1. THE HERITAGE STONE ECOSYSTEM: CONTEXT

Heritage Stone operates a three-platform architecture:
1. **HS Studio** — Internal tool for the agency to manage clients, projects, and branding.
2. **HS Hub** — Client-facing portal to view their brand guidelines, templates, and health scores.
3. **HS Portal** — Stateless build server & template pipeline handling validation and pushing to Supabase Storage.

**Your Job:** You are building stateless front-end templates (React / Vite / TypeScript + Tailwind CSS) that will dynamically load into these platforms via iframe or direct deployment.

These templates are **brand guideline experiences**. The client — a real business owner or brand manager — is the audience. They are not looking at internal tooling. They are experiencing their own brand, beautifully presented. Every template must reflect the soul of that specific brand, not a generic component library.

---

## 2. STRUCTURAL & PIPELINE CONTRACTS

When you build a template, you are responsible for outputting a `.zip` file of a working codebase. The Heritage Stone `hs-portal` Builder Engine will extract, validate, and build it.

### 2.1 The Validation Contract
The builder runs aggressive validations before it runs `npm install`. If you fail these, your template is instantly rejected.
- **Root `package.json`**: MUST exist at the zip root.
- **`name` field**: The `package.json` MUST have a `"name"` field. This becomes the template's permanent ID.
- **`build` script**: The `package.json` MUST have `"scripts": { "build": "vite build" }` (or similar build command).
- **`src/` Directory**: MUST exist.
- **Vite Config**: Either `vite.config.ts` or `vite.config.js` MUST exist. An `index.html` MUST exist at the root.

### 2.2 The Build Process
Be fully aware of how your code is executed:
1. The Zip is uploaded to the builder pipeline.
2. Unzipped into `os.tmpdir()`.
3. Builder runs: `npm install --prefer-offline --no-audit` (so keep your dependencies standard).
4. Builder runs: `npm run build`.
5. Builder expects a `dist/index.html` to be generated.
6. Builder uploads the `dist/` bundle to Supabase Storage (`stone-templates` bucket) recursively.
7. **Do NOT** include a pre-built `dist/` directory in your source zips.

### 2.3 The Plug-and-Play File Map
The exact zip structure the system will accept cleanly:

```text
your-template.zip/
├── package.json         ← MUST have "name" and "scripts: { build: ... }"
├── index.html           ← MUST exist at root
├── vite.config.ts       ← MUST exist
├── tailwind.config.js
├── src/                 ← MUST exist
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css        ← Where var(--hs-primary) etc. bindings live
│   └── components/
└── public/              ← Static mock fonts, images
```

### 2.4 The Data Injection Contract
Templates are **stateless visual payloads**. They never make network requests. The parent portal pre-compiles and injects the full client brand into `window.__BRAND_DATA__` before the React app boots. Every piece of content in a template must be read from this object.

**Never use hardcoded placeholder content in production templates.** Always map UI to the injected data.

What is available from `window.__BRAND_DATA__`:

| Namespace | Key Data Available |
|---|---|
| `.brand` | `brand_name`, `slug`, `version`, `is_published`, `custom_domain` |
| `.introduction` | `tagline`, `brand_description`, `cover_image_url`, `cover_video_url`, `founded_year`, `industry`, `contact_email`, `website_url`, `social_links[]` |
| `.strategy` | `mission`, `vision`, `positioning_statement`, `values[]`, `tone_of_voice{}`, `brand_personality{}`, `target_audience{}`, `messaging{}` |
| `.logos` | Logo variants with `download_url`, safe formats, clear space specs, misuse examples |
| `.typography` | `font_role`, `type_scale` maps (sizes, weights, line-heights, letter-spacing, fallback stacks) |
| `.colors` | Full palette: `hex`, `rgb`, `cmyk`, `pantone`, `usage_role`, `accessibility_level` |
| `.images` | `hero_images[]`, `gallery_images[]`, `mood_descriptors`, `photography_style` |
| `.icons` | `stroke_weight`, `corner_radius`, grid mapping, SVG/image URLs |
| `.resources` | Downloadable assets with `file_url`, `size`, `label` |

**Auto-Injected CSS (no action required from you):**
The portal auto-injects these variables, already computed from the brand's color data:
- `var(--cp)` — Primary brand color
- `var(--cs)` — Secondary brand color
- `var(--cp-contrast)` — Auto-calculated legible text over primary (`#FFFFFF` or `#0A0A0A`)
- `var(--cs-contrast)` — Auto-calculated legible text over secondary

---

## 3. THE DESIGN SYSTEM & TOKEN CONTRACTS

### 3.1 CSS Variables — Non-Negotiable Mappings
Your Tailwind config or CSS **MUST** consume Heritage Stone's global CSS variables. These are injected by the Hub at runtime. You must use them, not override them.

**Brand Colors:**
- `var(--cp)` / `var(--hs-primary)` — Structural primary (black in light mode, white in dark)
- `var(--cs)` / `var(--hs-accent)` — Accent / highlight color

**Backgrounds:**
- `var(--bg-primary)` — Deepest background layout frame
- `var(--surface-default)` — Solid containers, cards, modals
- `var(--surface-subtle)` — Interactive resting states, secondary blocks

**Borders:**
- `var(--border-subtle)` — Structural dividing lines
- `var(--border-default)` — Inputs and core bounds

**Text:**
- `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`, `var(--text-inverse)`

**System Fonts:**
- `var(--font-display)` — Headings
- `var(--font-sans)` — Body
- `var(--font-mono)` — Metrics, metadata, timestamps

> **Custom Template Fonts:** When a template's personality calls for custom typography beyond the system fonts, load them via Google Fonts or bundle them in `/public`. Always define fallbacks to `var(--font-display)` or `var(--font-sans)` so the system never breaks. Custom fonts must be declared in the template's `index.css` and scoped — they must not bleed into the parent platform.

### 3.2 Typography Rules
- **Headings**: `var(--font-display)`. Tightly tracked (`-0.02em`). Size boldly — headlines should feel architectural or expressive based on the template's personality.
- **Body Text**: `var(--font-sans)`. Clean, legible, comfortable line-height (`1.6`–`1.75` for reading-heavy sections).
- **Mono / Data**: `var(--font-mono)`. Metrics, hex codes, version numbers, timestamps only.

### 3.3 Geometry & Radius
- **System Default: ZERO RADIUS.** Cards, buttons, inputs, modals — `rounded-none` by default. Heritage Stone is architectonic.
- **Template-Level Exception:** If a template's personality (see Section 7) is explicitly organic, playful, or luxurious and the design system demands soft curves, this may be overridden at template scope. You must declare this deviation in the template's `README.md` with justification. Badges and small indicator pills may always use `rounded-full`.

### 3.4 Interactive Elements — Buttons & Inputs
- **Buttons**: Use the **Color Wipe Effect**. Buttons must use absolute-positioned `::after` pseudo-elements that `scaleX(0)` → `scaleX(1)` from left on hover using `cubic-bezier(0.34, 1.56, 0.64, 1)`. No plain crossfades.
- **Inputs**: `bg-[var(--surface-subtle)]`, `border-[var(--border-default)]`, `focus-within:border-[var(--hs-accent)]`, zero border radius.

### 3.5 THE ANTI-SLOP LAW — What is Banned, Always

These patterns are explicitly rejected. If any appear in your output, the template is considered failed regardless of pipeline status.

**Layout Slop:**
- ❌ Centered, single-column "card stack" layouts with no grid ambition
- ❌ Symmetric, perfectly balanced grids with identical card sizes
- ❌ Hero section → 3-column icon grid → CTA — this is not a brand guideline, it is a SaaS landing page
- ❌ Pageless, single-scroll documents with no section identity or visual chapter breaks

**Visual Slop:**
- ❌ 1px border lines as the only design detail (borders must serve structure, not fill visual emptiness)
- ❌ Gradient backgrounds that go from purple to blue (or any generic tech-startup gradient)
- ❌ Glassmorphism panels unless they are earned by the template's personality
- ❌ Generic drop shadows (`box-shadow: 0 4px 6px rgba(0,0,0,0.1)`) as a substitute for real depth
- ❌ Icon-heavy UI where icons carry meaning that text should carry

**Typography Slop:**
- ❌ Uniform font sizes throughout — every section must have typographic hierarchy
- ❌ Inter, Roboto, or system-ui as the display font choice for a custom template
- ❌ Centered body text in paragraphs longer than two lines
- ❌ Uppercase everything as a substitute for actual typographic design

**Code Slop:**
- ❌ Hardcoded brand names, colors, or content anywhere in the template
- ❌ Placeholder text (`Lorem ipsum`) in any section that has a `window.__BRAND_DATA__` equivalent
- ❌ Unused components or dead imports left in the codebase

---

## 4. THE DESIGN CANON — How to Think Before You Build

> This is the most important section in this playbook. The pipeline contract keeps your code alive. The Design Canon keeps your template from being trash.

Before writing a single line of JSX, you must complete the following thinking process in full. Skipping it produces slop.

### 4.1 Step One — Read the Brief, Derive the Personality

Every template is built for a specific brand archetype. When given a template brief, the first thing you do is extract the brand's personality signals. These come from:

- `window.__BRAND_DATA__.brand_personality` (archetype, adjectives, anti-adjectives)
- `window.__BRAND_DATA__.introduction.industry`
- `window.__BRAND_DATA__.strategy.tone_of_voice`
- `window.__BRAND_DATA__.colors` (palette mood — are these earthy? electric? minimal? rich?)

From these signals, you must **name the template's personality** before designing. Examples of valid named personalities:

| Personality Name | Signals That Suggest It | What It Demands |
|---|---|---|
| **Architectonic** | Minimalist, premium, structural adjectives; monochrome palette; architecture / real estate / luxury industry | Vast whitespace, grid-breaking typographic scale, near-zero decoration |
| **Editorial** | Media, publishing, storytelling; rich imagery; `photography_style` references | Magazine-style layouts, dominant imagery, pull quotes, column typography |
| **Kinetic Tech** | SaaS, fintech, dev tools; electric palette; precision, speed adjectives | Data-dense layouts, monospaced accents, animated metrics, tight grid |
| **Warm Studio** | Creative agencies, design studios; warm tones; human, crafted adjectives | Textured surfaces, generous type sizing, handcrafted-feeling layouts |
| **Playful Loud** | Children's brands, entertainment, food; bright palette; fun anti-adjectives | Bold color blocking, expressive type, oversized illustration zones, kinetic motion |
| **Opulent** | Luxury goods, hospitality, fashion; deep or jewel-toned palette | Full-bleed imagery, fine typography, restrained gold/contrast accents, slow motion |

If the brief does not specify, derive the personality from the data signals. Commit to it. Do not hedge. A template that tries to be two personalities is a template that is neither.

### 4.2 Step Two — Design the Section Map

Every template is a paged brand guideline experience — not a pageless scroll. Every template must have **distinct visual sections** that a client can navigate, recognize, and remember independently.

**Required Sections (all must appear, order is flexible and personality-driven):**

| Section | What It Contains |
|---|---|
| **Cover** | Brand name, tagline, cover image/video, founding context. The first impression — make it unforgettable. |
| **Brand Story** | Mission, vision, positioning statement. Prose-forward. Typography carries this section. |
| **Personality & Voice** | Archetype, adjectives, tone dos and don'ts. This section should *feel* like the tone it describes. |
| **Color System** | Full palette with hex, CMYK, Pantone, and usage context. Not a row of circles. Show the colors *in use*. |
| **Typography System** | Font roles, type scale, pairing logic. Show the fonts at expressive sizes, not a spec table alone. |
| **Logo Usage** | Variants, clear space, misuse examples. Presented with visual authority. |
| **Imagery & Photography** | Hero and gallery imagery, mood descriptors, style guide. Show the photography direction, not just a grid. |
| **Assets & Downloads** | Downloadable resources, icon libraries, raw files. Clean, organized, labeled. |

**Order Logic:**
- For **Architectonic / Opulent** personalities: Cover → Brand Story → Color → Typography → Logo → Imagery → Voice → Assets
- For **Kinetic Tech** personalities: Cover → Color → Typography → Logo → Voice → Brand Story → Imagery → Assets
- For **Editorial / Warm Studio** personalities: Cover → Brand Story → Imagery → Voice → Color → Typography → Logo → Assets
- For **Playful Loud** personalities: Cover → Voice → Color → Imagery → Logo → Typography → Brand Story → Assets
- If you derive a personality not listed above, design the order so that the brand's strongest asset appears in sections 2–3, creating immediate impact after the cover.

### 4.3 Step Three — Set the Layout Mode

Before writing layout code, declare the layout philosophy for this template. Pick one of two modes:

**Mode A — Mobile-First (Default)**
Used for: Editorially-driven templates, storytelling-heavy content, warm/playful personalities.
- Write styles mobile-first (`base` → `sm:` → `md:` → `lg:` → `xl:`)
- Mobile layout is the primary design act — the desktop is an expansion, not the origin
- Stacked single-column on small screens is acceptable only if the desktop layout is genuinely ambitious

**Mode B — Desktop-First (Declared)**
Used for: Data-dense dashboards, Kinetic Tech personalities, templates where the desktop is the primary experience and mobile is a graceful reduction.
- Write styles desktop-first and use `max-sm:`, `max-md:` overrides to step down
- Must be explicitly declared in the template's `README.md`: `# Layout Mode: Desktop-First`
- Mobile experience must still be fully functional and legible — "graceful reduction" is not an excuse for a broken mobile layout

**Non-Negotiable Breakpoints (both modes):**

```
mobile:   < 640px   → single column, stacked, generous spacing
tablet:   640–1023px → two-column capable, navigation accessible, no overflow
desktop:  1024–1279px → full layout expression
wide:     1280px+   → optionally extended — don't waste the space
```

Every section must be tested across all four ranges. A template that breaks at any breakpoint is rejected regardless of how beautiful the desktop version is. 

> **The Analog:** Templates must be **loved on mobile, cherished on tablet, and a goldmine on desktop.** This is not a gradient of degrading quality. Each viewport must feel intentional.

### 4.4 Step Four — Design the Moments

A brand guideline template is not a document reader. It is a **designed experience**. For every section, you must identify at least one designed *moment* — something that makes the client feel something when they scroll into it.

Moments are created through:

- **Scale contrast**: A headline at `9vw` next to body text at `16px` creates tension and authority
- **Full-bleed**: A section that bleeds edge to edge against sections that breathe with padding creates rhythm
- **Color surprise**: One section that inverts — `bg-[var(--cp)]` with `color-[var(--cp-contrast)]` — feels like a breath held and released
- **Motion entry**: Sections that animate into view on scroll feel alive — use Framer Motion's `useInView` with staggered children
- **Typography as image**: A single word at display scale, slightly clipped by the viewport edge, reads as art before it reads as type
- **Data made beautiful**: Color palette swatches that expand on hover, type scales that demonstrate themselves at live size

Every section needs one. Some sections can have two. No section should have zero.

---

## 5. WHAT YOU CAN AND SHOULD TWEAK

This section is permission, not instruction. Use it freely.

1. **Custom Fonts**: Load via Google Fonts or `/public`. Must have `var(--font-display)` as fallback. Must be justified by the template personality.

2. **Layout & Grid Architectures**: Brutalist asymmetric grids, editorial column splits, overlapping type layers, sticky sidebars for navigation between sections. Do not default to centered 12-column grids.

3. **Framer Motion**: Page intros, staggered section reveals, scroll-linked parallax, `useInView` entry animations. Every interaction should feel tuned, not templated.

4. **Data Visualizations**: Custom SVG paths, `recharts` line/area charts for type scales or brand metrics. Stroke-only, no fills, strict token colors.

5. **Section Navigation**: Templates should include a fixed or sticky section navigator (a side nav on desktop, a hamburger or bottom nav on mobile) that lets clients jump between sections. This is a brand guideline — they will reference it repeatedly.

6. **Themed Dark Mode**: If the template includes a dark/light toggle, it must respond to the CSS variables already provided. Do not build a separate color system for dark mode. The variables handle it.

---

## 6. STANDARD TEMPLATE BOILERPLATE

```json
// package.json
{
  "name": "hs-template-[descriptive-name]",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.360.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/*
  FALLBACKS ONLY.
  The Heritage Stone parent platform injects all these variables dynamically at runtime
  based on the client's brand settings and light/dark mode.
  These values are placeholders for local development only.
*/
:root {
  --bg-primary: #ffffff;
  --surface-default: #f4f4f4;
  --surface-subtle: #ebebeb;
  --border-subtle: #e0e0e0;
  --border-default: #c8c8c8;
  --text-primary: #0a0a0a;
  --text-secondary: #3d3d3d;
  --text-tertiary: #6b6b6b;
  --text-inverse: #ffffff;
  --hs-primary: #000000;
  --hs-accent: #ffa800;
  --cp: #000000;
  --cs: #ffa800;
  --cp-contrast: #ffffff;
  --cs-contrast: #000000;
  --font-display: 'Manrope', sans-serif;
  --font-sans: 'DM Sans', sans-serif;
  --font-mono: 'SF Mono', 'Monaco', monospace;
}
```

```typescript
// src/types/brand.ts — Type the injected data for safety
interface BrandData {
  brand: {
    brand_name: string;
    slug: string;
    version: string;
    is_published: boolean;
  };
  introduction: {
    tagline: string;
    brand_description: string;
    cover_image_url?: string;
    cover_video_url?: string;
    founded_year?: number;
    industry?: string;
    contact_email?: string;
    website_url?: string;
    social_links?: { platform: string; url: string }[];
  };
  strategy: {
    mission: string;
    vision: string;
    positioning_statement: string;
    values: { name: string; description: string; image_url?: string }[];
    tone_of_voice: { descriptors: string[]; dos: string[]; donts: string[] };
    brand_personality: { archetype: string; adjectives: string[]; anti_adjectives: string[] };
    messaging: { headline: string; taglines: string[]; key_messages: string[]; cta_guidelines: string };
  };
  colors: {
    hex: string;
    rgb: string;
    cmyk: string;
    pantone?: string;
    usage_role: string;
    accessibility_level: string;
  }[];
  typography: {
    font_role: string;
    type_scale: Record<string, { size: string; weight: number; line_height: string; letter_spacing: string }>;
  }[];
  logos: {
    variant: string;
    download_url: string;
    safe_formats: string[];
    clear_space: string;
    misuse_examples: string[];
  }[];
  images: {
    hero_images: string[];
    gallery_images: string[];
    mood_descriptors: string[];
    photography_style: string;
  };
  icons: {
    stroke_weight: number;
    corner_radius: number;
    svg_urls: string[];
  };
  resources: {
    file_url: string;
    size: string;
    label: string;
  }[];
}

declare global {
  interface Window {
    __BRAND_DATA__: BrandData;
  }
}
```

---

## 7. FINAL AI CHECKLIST BEFORE OUTPUTTING

Complete every item. A partial pass is a fail.

### Pipeline Checks
- [ ] `package.json` exists at zip root with a unique `name` and `build: "vite build"`
- [ ] `index.html` exists at zip root
- [ ] `vite.config.ts` or `vite.config.js` exists
- [ ] `src/` directory is present and intact
- [ ] No `node_modules/` or `dist/` included in the zip
- [ ] All dependencies are standard npm packages (no private registry calls)

### Data Contract Checks
- [ ] All brand content reads from `window.__BRAND_DATA__` — no hardcoded strings
- [ ] `src/types/brand.ts` is present and the data is typed
- [ ] Fallback handling exists for optional fields (e.g., `cover_video_url` may be null)

### Design Canon Checks
- [ ] Template personality has been named and is legible in the design
- [ ] All eight required sections are present
- [ ] Section order reflects the personality logic from Section 4.2
- [ ] Layout mode (Mobile-First or Desktop-First) is declared in `README.md`
- [ ] All four breakpoints (mobile, tablet, desktop, wide) are functional and intentional
- [ ] Every section has at least one designed *moment*
- [ ] No Anti-Slop Law violations (see Section 3.5) — review the list again before submitting

### Token & Style Checks
- [ ] All colors use `var(--...)` tokens — zero hardcoded hex values
- [ ] All typography uses `var(--font-display)` / `var(--font-sans)` / `var(--font-mono)` as base or fallback
- [ ] `rounded-none` is the rule — any radius exception is documented
- [ ] Buttons use the Color Wipe Effect
- [ ] Section navigation is present and functional across all breakpoints

### Quality Bar Check
- [ ] Would a client of a luxury architecture firm feel this is worthy of their brand?
- [ ] Would a founder of a funded tech startup feel this communicates precision?
- [ ] Would the owner of a children's brand feel joy and warmth from this?
- [ ] If the answer to the relevant question is no — **do not output. redesign the section.**

---

> **A final word:** You are not generating a component. You are producing a brand experience that a client will open, feel proud of, and reference for years. Build it like that matters. Because it does.
