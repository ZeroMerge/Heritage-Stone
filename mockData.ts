/**
 * HERITAGE STONE — TEMPLATE DEVELOPMENT MOCK DATA
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS FILE IS FOR LOCAL DEVELOPMENT AND PREVIEW ONLY.
 *
 * In production, this entire object is injected by the Heritage Stone Portal
 * as `window.__BRAND_DATA__` before the React app boots. The template never
 * fetches data. It reads from the window object.
 *
 * HOW TO USE IN YOUR TEMPLATE:
 *
 *   const brand = window.__BRAND_DATA__ ?? mockData;
 *
 * That single line is the only reference to this file that should exist.
 * All component props, display logic, and content must read from `brand`.
 * Never import mockData directly inside a component.
 *
 * When the template is deployed, `window.__BRAND_DATA__` will always be
 * present and this file becomes irrelevant — it is never bundled into prod.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { BrandData } from "./types/brand";

export const mockData: BrandData = {

  // ─── BRAND META ────────────────────────────────────────────────────────────
  brand: {
    brand_name: "Aurelian Studio",
    slug: "aurelian-studio",
    version: "3.2.1",
    is_published: true,
    custom_domain: "brand.aurelianstudio.com",
  },

  // ─── INTRODUCTION ──────────────────────────────────────────────────────────
  introduction: {
    tagline: "Craft that endures. Identity that commands.",
    tagline_size: "large",
    brand_description:
      "Aurelian Studio is a full-spectrum creative and brand consultancy built for founders and institutions who understand that identity is infrastructure. We architect brands that do not follow trends — they set the standard that others measure themselves against.",
    cover_image_url:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1800&q=90",
    cover_video_url: null,
    founded_year: 2017,
    industry: "Creative Strategy & Brand Architecture",
    contact_email: "studio@aurelianstudio.com",
    website_url: "https://aurelianstudio.com",
    social_links: [
      { platform: "Instagram", url: "https://instagram.com/aurelianstudio" },
      { platform: "LinkedIn", url: "https://linkedin.com/company/aurelianstudio" },
      { platform: "Behance", url: "https://behance.net/aurelianstudio" },
      { platform: "X", url: "https://x.com/aurelianstudio" },
    ],
  },

  // ─── STRATEGY ──────────────────────────────────────────────────────────────
  strategy: {
    mission:
      "To give ambitious builders the brand clarity and creative infrastructure they need to lead their category — not compete in it.",
    vision:
      "A world where the most important ideas are represented by the most intentional brands. We exist to close that gap.",
    positioning_statement:
      "For founders and institutions who demand permanence over trend, Aurelian Studio delivers brand architecture that commands rooms, closes deals, and compounds in value over time — unlike agencies that sell aesthetics, we engineer identity.",

    values: [
      {
        name: "Permanence",
        description:
          "We build for decades, not campaigns. Every decision is weighed against the question: will this matter in ten years?",
        image_url:
          "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
      },
      {
        name: "Precision",
        description:
          "Ambiguity is a luxury we don't afford. Every word, every pixel, every system we ship is deliberate and exact.",
        image_url:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      },
      {
        name: "Authority",
        description:
          "We don't ask to be taken seriously. We build brands that make that question irrelevant.",
        image_url:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      },
      {
        name: "Restraint",
        description:
          "The most powerful brands know what to leave out. Restraint is not timidity — it is confidence made visible.",
        image_url:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
      },
    ],

    tone_of_voice: {
      descriptors: [
        "Authoritative",
        "Precise",
        "Warm but uncompromising",
        "Direct without arrogance",
        "Confident, never loud",
      ],
      dos: [
        "Speak to the reader as a peer, not a prospect",
        "Use short, declarative sentences for impact",
        "Lead with the point — context follows, never precedes",
        "Reference specifics over generalities",
        "Let silence and whitespace carry weight",
      ],
      donts: [
        "Never use jargon as a substitute for clarity",
        "Avoid superlatives without evidence ('world-class', 'unparalleled')",
        "Do not hedge — qualify only when it adds precision",
        "Avoid filler phrases ('In today's fast-paced world...')",
        "Never use passive voice in primary messaging",
      ],
    },

    brand_personality: {
      archetype: "The Ruler",
      adjectives: [
        "Commanding",
        "Refined",
        "Deliberate",
        "Enduring",
        "Exact",
        "Considered",
      ],
      anti_adjectives: [
        "Trendy",
        "Loud",
        "Approachable",
        "Playful",
        "Casual",
        "Reactive",
      ],
    },

    target_audience: {
      primary: {
        demographic: "Founders and C-suite executives, 32–55, building category-defining companies",
        behaviors: [
          "Invests in quality over speed",
          "Values long-term equity over short-term growth hacks",
          "Makes decisions with advisors, not committees",
          "Reads widely outside their industry",
        ],
      },
      secondary: {
        demographic: "Creative directors and brand leads at mid-to-large institutions seeking external brand counsel",
        behaviors: [
          "Has an existing brand but feels it no longer reflects their scale",
          "Appreciates process and thinking as much as output",
          "References benchmark brands like Apple, Hermès, and Patagonia",
        ],
      },
    },

    messaging: {
      headline: "Your identity is your most compounding asset.",
      taglines: [
        "Craft that endures. Identity that commands.",
        "Built to last. Designed to lead.",
        "The brand your ambition deserves.",
        "Identity is infrastructure.",
      ],
      key_messages: [
        "Aurelian Studio operates at the intersection of strategy and craft — we don't separate thinking from making.",
        "Our work is not decoration. It is a competitive advantage with a measurable return.",
        "We work with a small number of clients at a time. Depth over breadth, always.",
        "Every engagement begins with a brand audit. We will tell you what you need to hear, not what you want to hear.",
      ],
      cta_guidelines:
        "CTAs must be specific and action-forward. Use 'Begin Your Brand Audit', 'Schedule a Strategy Call', or 'See the Work' — never 'Learn More', 'Click Here', or 'Get Started'.",
    },
  },

  // ─── COLORS ────────────────────────────────────────────────────────────────
  colors: [
    {
      name: "Obsidian",
      hex: "#0A0A0A",
      rgb: "rgb(10, 10, 10)",
      cmyk: "C:0 M:0 Y:0 K:96",
      pantone: "Black 6 C",
      usage_role: "Primary structural color. Backgrounds, dominant type.",
      accessibility_level: "AAA",
    },
    {
      name: "Stone White",
      hex: "#F5F2EE",
      rgb: "rgb(245, 242, 238)",
      cmyk: "C:0 M:1 Y:3 K:4",
      pantone: "9183 C",
      usage_role: "Background canvas. Light mode primary surface.",
      accessibility_level: "AAA",
    },
    {
      name: "Aurelian Gold",
      hex: "#C9A84C",
      rgb: "rgb(201, 168, 76)",
      cmyk: "C:0 M:16 Y:62 K:21",
      pantone: "7562 C",
      usage_role: "Accent. Highlight lines, hover states, active indicators.",
      accessibility_level: "AA",
    },
    {
      name: "Ash",
      hex: "#6B6B6B",
      rgb: "rgb(107, 107, 107)",
      cmyk: "C:0 M:0 Y:0 K:58",
      pantone: "Cool Gray 8 C",
      usage_role: "Secondary text. Captions, metadata, secondary labels.",
      accessibility_level: "AA",
    },
    {
      name: "Slate",
      hex: "#1E1E1E",
      rgb: "rgb(30, 30, 30)",
      cmyk: "C:0 M:0 Y:0 K:88",
      pantone: "Black 3 C",
      usage_role: "Surface color. Cards, elevated containers in dark contexts.",
      accessibility_level: "AAA",
    },
  ],

  // ─── TYPOGRAPHY ────────────────────────────────────────────────────────────
  typography: [
    {
      font_role: "Display",
      font_family: "Cormorant Garamond",
      font_source: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap",
      specimen_text: "Identity is infrastructure.",
      type_scale: {
        "display-2xl": { size: "clamp(4rem, 8vw, 9rem)", weight: 300, line_height: "0.95", letter_spacing: "-0.03em" },
        "display-xl": { size: "clamp(3rem, 6vw, 6.5rem)", weight: 300, line_height: "1.0", letter_spacing: "-0.025em" },
        "display-lg": { size: "clamp(2.25rem, 4vw, 4.5rem)", weight: 400, line_height: "1.05", letter_spacing: "-0.02em" },
        "display-md": { size: "clamp(1.75rem, 3vw, 3rem)", weight: 400, line_height: "1.1", letter_spacing: "-0.015em" },
      },
    },
    {
      font_role: "Body",
      font_family: "DM Sans",
      font_source: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap",
      specimen_text: "We architect brands that do not follow trends.",
      type_scale: {
        "body-lg": { size: "1.125rem", weight: 300, line_height: "1.75", letter_spacing: "0" },
        "body-md": { size: "1rem", weight: 400, line_height: "1.65", letter_spacing: "0" },
        "body-sm": { size: "0.875rem", weight: 400, line_height: "1.6", letter_spacing: "0.01em" },
        "label": { size: "0.75rem", weight: 500, line_height: "1.4", letter_spacing: "0.08em" },
        "overline": { size: "0.6875rem", weight: 500, line_height: "1.2", letter_spacing: "0.12em" },
      },
    },
    {
      font_role: "Mono",
      font_family: "JetBrains Mono",
      font_source: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400&display=swap",
      specimen_text: "v3.2.1 — 2024",
      type_scale: {
        "mono-sm": { size: "0.75rem", weight: 300, line_height: "1.5", letter_spacing: "0.02em" },
        "mono-md": { size: "0.875rem", weight: 400, line_height: "1.5", letter_spacing: "0.01em" },
      },
    },
  ],

  // ─── LOGOS ─────────────────────────────────────────────────────────────────
  logos: [
    {
      variant: "Primary — Dark on Light",
      download_url: "/assets/logos/aurelian-primary-dark.svg",
      safe_formats: ["SVG", "PDF", "PNG (transparent)"],
      clear_space: "Equal to the cap-height of the wordmark on all sides (approx. 1×)",
      background_usage: "Use on Stone White (#F5F2EE) or white backgrounds only",
      misuse_examples: [
        "Do not stretch or distort the proportions",
        "Do not place on busy photographic backgrounds without an overlay",
        "Do not recolor the wordmark — use the correct variant for each background",
        "Do not add drop shadows or effects",
        "Do not reduce below 120px wide in digital or 35mm wide in print",
      ],
    },
    {
      variant: "Reversed — Light on Dark",
      download_url: "/assets/logos/aurelian-reversed-light.svg",
      safe_formats: ["SVG", "PDF", "PNG (transparent)"],
      clear_space: "Equal to the cap-height of the wordmark on all sides",
      background_usage: "Use on Obsidian (#0A0A0A) or deep dark backgrounds",
      misuse_examples: [
        "Do not use the reversed variant on light backgrounds",
        "Do not use on medium-dark backgrounds where contrast is uncertain",
      ],
    },
    {
      variant: "Monogram — A Mark",
      download_url: "/assets/logos/aurelian-monogram.svg",
      safe_formats: ["SVG", "PDF", "PNG (transparent)", "ICO"],
      clear_space: "0.5× the mark height on all sides",
      background_usage: "Flexible — adapts to both light and dark. Use Gold variant on dark.",
      misuse_examples: [
        "Do not use as a substitute for the full wordmark in primary brand positions",
        "Do not place alongside competitors' logos at equal scale",
      ],
    },
  ],

  // ─── IMAGERY ───────────────────────────────────────────────────────────────
  images: {
    hero_images: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1800&q=85",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=85",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1800&q=85",
    ],
    gallery_images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80",
      "https://images.unsplash.com/photo-1494959764136-6be9eb3c261e?w=900&q=80",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80",
    ],
    mood_descriptors: [
      "Still and considered",
      "Natural light with deep shadow",
      "Texture over perfection",
      "Human presence without faces",
      "Materials at close range",
      "Monochromatic with selective warmth",
    ],
    photography_style:
      "Photography favors restraint and atmosphere over documentation. Compositions use negative space deliberately. Color grading leans warm-neutral — desaturated with preserved skin tones and material warmth. Avoid stock imagery that reads as posed or corporate. Prefer editorial-quality photography that suggests rather than explains.",
  },

  // ─── ICONS ─────────────────────────────────────────────────────────────────
  icons: {
    stroke_weight: 1.5,
    corner_radius: 0,
    grid_size: 24,
    style_note: "Minimal, geometric line icons. No fills. No decorative flourishes. Lucide React is the approved library.",
    svg_urls: [],
  },

  // ─── RESOURCES ─────────────────────────────────────────────────────────────
  resources: [
    {
      label: "Brand Guidelines PDF",
      file_url: "/assets/downloads/aurelian-brand-guidelines.pdf",
      size: "4.2 MB",
      type: "PDF",
    },
    {
      label: "Logo Package (.zip)",
      file_url: "/assets/downloads/aurelian-logo-package.zip",
      size: "18.7 MB",
      type: "ZIP",
    },
    {
      label: "Color Palette — Adobe Swatch (.ase)",
      file_url: "/assets/downloads/aurelian-colors.ase",
      size: "12 KB",
      type: "ASE",
    },
    {
      label: "Typography Specimen Sheet",
      file_url: "/assets/downloads/aurelian-type-specimen.pdf",
      size: "1.8 MB",
      type: "PDF",
    },
    {
      label: "Icon Library (.svg bundle)",
      file_url: "/assets/downloads/aurelian-icons.zip",
      size: "540 KB",
      type: "ZIP",
    },
  ],
};
