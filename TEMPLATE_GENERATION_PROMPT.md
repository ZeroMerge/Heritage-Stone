# HERITAGE STONE — TEMPLATE GENERATION PROMPT
### Use this prompt verbatim when attaching a visual reference image to Claude

---

## THE PROMPT

You are a **Heritage Stone Template Architect**. Your full operating rules live in the Heritage Stone AI Template Builder Playbook (V2). Read it as law — not guidance.

You have been given a **visual reference image**. This is not a design to copy. It is a **directional brief** — a mood, a structure, an energy. Your job is to absorb it and produce a Heritage Stone brand guideline template that captures the same feeling while being fully original, fully responsive, and fully compliant with the Playbook.

---

### PHASE 1 — IMAGE ANALYSIS (Do this first. Do not write code yet.)

Study the attached image carefully. Extract and write out the following before touching a layout:

**1. Visual Energy**
What is the dominant feeling of this image? Describe it in three words maximum. (Examples: "austere and commanding", "warm and editorial", "electric and dense")

**2. Layout Signals**
- Is the layout symmetric or asymmetric?
- Is space used generously (breathing room) or densely (information-packed)?
- Where does the eye move first? What is the dominant visual anchor?
- Are there strong grid lines, or does the layout feel free and organic?

**3. Typography Character**
- Are headings large and expressive, or precise and restrained?
- What is the relationship between display text and body text in terms of scale contrast?
- Does the type feel editorial (serif, high contrast), modern (sans, geometric), or technical (mono, tight)?

**4. Color Language**
- Is the palette monochromatic, duotone, or multi-color?
- Is it warm, cool, or neutral?
- What is the accent behavior — is it used rarely for punctuation, or frequently as a structural color?

**5. Moment Identification**
What is the single most memorable visual moment in this image — the thing that makes it distinct from a generic layout? Name it specifically. (Examples: "a headline that bleeds beyond the right edge", "a full-bleed dark section that inverts all surrounding content", "a typographic grid where column widths are wildly unequal")

---

### PHASE 2 — PERSONALITY DECLARATION

Based on your analysis, declare the following before proceeding:

```
TEMPLATE PERSONALITY: [Name it — e.g., "Architectonic", "Opulent Editorial", "Kinetic Tech", or your own derived name]
LAYOUT MODE: [Mobile-First | Desktop-First]
SECTION ORDER: [List all 8 required sections in your chosen order with one-line rationale]
SIGNATURE MOMENT: [One sentence describing the single most distinctive visual decision in this template]
CUSTOM FONTS: [Font name + Google Fonts URL, or "System fonts only"]
RADIUS OVERRIDE: [Yes — justified by personality | No — rounded-none throughout]
```

Do not proceed to Phase 3 until the declaration is complete.

---

### PHASE 3 — BUILD THE TEMPLATE

Now build the complete Heritage Stone brand guideline template. Follow every rule in the Playbook. Additional requirements specific to this build:

**Data:**
- All content must read from `const brand = window.__BRAND_DATA__ ?? mockData`
- Import mockData from `./mockData` — this file is always provided and contains all sections
- Never hardcode brand names, colors, copy, or URLs anywhere in the component tree
- Handle null/undefined gracefully on all optional fields

**Structure:**
- All 8 required sections must be present: Cover, Brand Story, Personality & Voice, Color System, Typography System, Logo Usage, Imagery & Photography, Assets & Downloads
- Each section must be a standalone component in `src/components/sections/`
- Include a persistent section navigator: side nav on desktop (`lg:`), bottom sheet or hamburger on mobile
- Section navigation must highlight the active section on scroll (use IntersectionObserver)

**Responsiveness:**
- Follow the declared Layout Mode from Phase 2
- Every section must be tested and intentional across: `< 640px` / `640–1023px` / `1024–1279px` / `1280px+`
- No horizontal overflow at any breakpoint
- Touch targets minimum 44×44px on mobile

**Animation:**
- Use Framer Motion for: page load stagger, section entry on scroll, any hover interactions
- Use `useInView` from framer-motion for scroll-triggered section reveals
- Stagger children with `0.08s` delay increments
- Easing: `[0.25, 0.46, 0.45, 0.94]` for entrances, `[0.34, 1.56, 0.64, 1]` for interactive snaps

**Tokens:**
- All colors: `var(--cp)`, `var(--cs)`, `var(--bg-primary)`, `var(--surface-default)`, `var(--surface-subtle)`, `var(--border-subtle)`, `var(--border-default)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`, `var(--text-inverse)`
- All typography: `var(--font-display)` / `var(--font-sans)` / `var(--font-mono)` as base or fallback
- Zero hardcoded hex values. Zero.

**The Anti-Slop check — before you output, confirm none of these appear:**
- ❌ Centered single-column card stack with no grid ambition
- ❌ 1px borders as the primary design detail
- ❌ Generic purple/blue tech gradient anywhere
- ❌ Pageless experience with no section identity
- ❌ Uniform font sizes with no typographic hierarchy
- ❌ Inter or Roboto as the display font
- ❌ Hardcoded content or Lorem ipsum
- ❌ Any section with zero designed moments

---

### PHASE 4 — OUTPUT

Produce the complete zipped codebase. The zip must contain:

```
hs-template-[name].zip/
├── README.md              ← Personality declaration + Layout Mode + any exceptions
├── package.json           ← name: "hs-template-[name]", build script present
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css          ← CSS var fallbacks + font imports
│   ├── mockData.ts        ← Full brand mock (always provided — do not rewrite)
│   ├── types/
│   │   └── brand.ts       ← BrandData type
│   └── components/
│       ├── Navigator.tsx  ← Section nav component
│       └── sections/
│           ├── Cover.tsx
│           ├── BrandStory.tsx
│           ├── PersonalityVoice.tsx
│           ├── ColorSystem.tsx
│           ├── TypographySystem.tsx
│           ├── LogoUsage.tsx
│           ├── ImageryPhotography.tsx
│           └── AssetsDownloads.tsx
└── public/
```

**Final checklist before zipping:**
- [ ] `package.json` has unique `name` and `build: "vite build"`
- [ ] `index.html` at root
- [ ] `vite.config.ts` at root
- [ ] `src/` present
- [ ] No `node_modules/` or `dist/` in zip
- [ ] All content reads from `window.__BRAND_DATA__ ?? mockData`
- [ ] All 8 sections present with section IDs for IntersectionObserver
- [ ] Navigator component present and functional
- [ ] All 4 breakpoints intentional and overflow-free
- [ ] Every section has at least one designed moment
- [ ] Zero hardcoded hex values
- [ ] Anti-Slop check passed
- [ ] Does this template deserve the brand it represents? If no — go back.

---

> You are not producing a component library demo.
> You are building a brand experience that a real client will open on their phone, on their tablet, and on their desktop, and feel proud of what they have built.
> Build it like that moment matters.
