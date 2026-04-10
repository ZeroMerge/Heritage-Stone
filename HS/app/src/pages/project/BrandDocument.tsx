/**
 * BrandDocument.tsx — Heritage Stone Studio
 * Total overhaul: fully responsive, premium colour architecture,
 * live font loading (Google Fonts + ZIP upload), accordion layout,
 * high-end feel across all sections.
 *
 * Dependencies already in project:
 *   framer-motion, lucide-react, react-colorful
 * New dependency needed:
 *   npm install jszip react-colorful
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import { HexColorPicker } from "react-colorful";
import {
  FileText, Target, Image, Type, Palette, Camera, Shapes, Download,
  Save, Settings, ChevronRight, Check, AlertCircle, Plus, X, Trash2,
  GripVertical, Upload, ChevronDown, ChevronUp,
  RefreshCw, Link, Copy, Globe, Mail, Instagram, Twitter, Linkedin,
  Youtube, Facebook, Replace, Menu, AlertTriangle, Loader2, Zap, Library
} from "lucide-react";
import { useDocumentEditorStore, useUIStore, useProjectsStore } from "@/store";
import { uploadFile, buildUrl } from "@/lib/cloudinary";
import { AssetPickerModal } from "@/components/studio/projects/AssetPickerModal";
import type {
  Project, SupabaseSectionType, BrandIntroduction, BrandStrategy,
  BrandLogo, BrandTypography, BrandColor, BrandImages, BrandIcons,
  BrandResource, BrandArchetype, LogoVariantType, FontWeight,
  ColorUsageRole, AccessibilityLevel, IconStyle, Asset, AssetCategory,
} from "@/types";
import { cn } from "@/lib/utils";

interface OverviewContext { project: Project }

// ─── Section Config ───────────────────────────────────────────────────────────

const sections: { id: SupabaseSectionType; label: string; icon: React.ElementType; description: string }[] = [
  { id: "introduction",  label: "Introduction",  icon: FileText, description: "Cover, tagline & contacts" },
  { id: "strategy",      label: "Strategy",       icon: Target,   description: "Mission, story & brand values" },
  { id: "logo",          label: "Logo",           icon: Image,    description: "Logo system & variants" },
  { id: "color_palette", label: "Colour Palette", icon: Palette,  description: "Palette, usage & accessibility" },
  { id: "typography",    label: "Typography",     icon: Type,     description: "Fonts & type scale" },
  { id: "photography",   label: "Photography",    icon: Camera,   description: "Photography direction & mood" },
  { id: "voice_tone",    label: "Voice & Tone",   icon: Shapes,   description: "Brand voice descriptors & rules" },
  { id: "messaging",     label: "Messaging",      icon: Globe,    description: "Headlines, taglines & key messages" },
  { id: "icons",         label: "Icons",          icon: Shapes,   description: "Icon system & symbols" },
  { id: "resources",     label: "Resources",      icon: Download, description: "Downloads & assets" },
];

// ─── Shared Primitives ────────────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2">
      <label className="text-label block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
        {children}
      </label>
      {hint && <p className="text-xs text-[var(--text-tertiary)] mt-0.5 normal-case font-normal">{hint}</p>}
    </div>
  );
}

/** Collapsible accordion panel — the core UI primitive for all sections */
function Accordion({ title, children, defaultOpen = true, badge }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--border-subtle)] bg-[var(--surface-default)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--surface-subtle)] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-widest">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.5 bg-[var(--hs-primary)]/10 text-[var(--hs-primary)] text-[10px] font-medium uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-2 border-t border-[var(--border-subtle)]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full px-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]",
        "focus:outline-none focus:border-[var(--hs-accent)] placeholder:text-[var(--text-muted)] placeholder:italic transition-colors",
        className
      )}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)] placeholder:text-[var(--text-muted)] placeholder:italic resize-none transition-colors"
    />
  );
}

function SelectField({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)] appearance-none cursor-pointer"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function NumberInput({ value, onChange, min, max, step = 1, unit }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min} max={max} step={step}
        className="w-24 px-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]"
      />
      {unit && <span className="text-sm text-[var(--text-tertiary)]">{unit}</span>}
    </div>
  );
}

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--hs-primary)] text-white text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity"><X className="w-3 h-3" /></button>
    </span>
  );
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) { onChange([...tags, val]); setInput(""); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => <TagChip key={t} label={t} onRemove={() => onChange(tags.filter((x) => x !== t))} />)}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)] placeholder:italic placeholder:text-[var(--text-muted)]"
        />
        <button onClick={add} className="px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)] transition-colors">Add</button>
      </div>
    </div>
  );
}

function UploadZone({ value, onChange, label, height = 160, accept = "image/*", onLibraryClick }: {
  value: string | null; onChange: (v: string | null) => void; label?: string; height?: number; accept?: string;
  onLibraryClick?: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    try {
      const publicId = await uploadFile(file);
      onChange(buildUrl(publicId));
    } catch {
      useUIStore.getState().showToast("Upload failed — please try again", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  if (value) {
    return (
      <div className="relative overflow-hidden" style={{ height }} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
        <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
        <AnimatePresence>
          {hovering && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 flex flex-wrap items-center justify-center gap-2 p-2">
              <label className="flex items-center gap-2 px-3 py-2 bg-[var(--hs-surface)] text-[var(--hs-text)] text-xs cursor-pointer hover:bg-[var(--hs-accent)] transition-colors">
                <Replace className="w-3.5 h-3.5" /> Replace
                <input type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </label>
              {onLibraryClick && (
                <button onClick={onLibraryClick} className="flex items-center gap-2 px-3 py-2 bg-[var(--hs-surface)] text-[var(--hs-text)] text-xs hover:bg-[var(--hs-accent)] transition-colors">
                  <Library className="w-3.5 h-3.5" /> Library
                </button>
              )}
              <button onClick={() => onChange(null)} className="flex items-center gap-2 px-3 py-2 bg-white text-red-600 text-xs hover:bg-red-50 transition-colors">
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center border border-dashed cursor-pointer transition-all relative",
          dragging ? "border-[var(--hs-accent)] bg-[var(--hs-accent)]/5" : "border-[var(--border-strong)] bg-[var(--surface-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--surface-hover)]",
          isUploading && "opacity-50 cursor-wait pointer-events-none"
        )}
        style={{ height }}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-[var(--hs-accent)] animate-spin" />
            <p className="text-xs text-[var(--text-secondary)] font-medium">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full px-6 text-center">
            <div className="flex flex-col items-center">
              <Upload className="w-5 h-5 text-[var(--text-tertiary)] mb-1.5" />
              <p className="text-sm text-[var(--text-secondary)]">Drop or <span className="text-[var(--hs-accent)] underline underline-offset-2">browse</span></p>
            </div>
            
            {onLibraryClick && (
              <div className="flex items-center gap-2 w-full max-w-[180px]">
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
                <span className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)] bg-[var(--surface-subtle)] px-2">OR</span>
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
              </div>
            )}

            {onLibraryClick && (
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLibraryClick(); }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-default)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)] transition-all"
              >
                <Library className="w-3.5 h-3.5" /> Select from Library
              </button>
            )}
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} disabled={isUploading} />
      </label>
    </div>
  );
}

// ─── 01 INTRODUCTION EDITOR ───────────────────────────────────────────────────

function IntroductionEditor({ data, setData, openAssetPicker }: { 
  data: Partial<BrandIntroduction>; 
  setData: (d: any) => void;
  openAssetPicker?: (cat: AssetCategory, onSelect: (url: string) => void) => void;
}) {
  const set = (key: string, val: any) => setData({ ...data, [key]: val });

  const SOCIAL_PLATFORMS = [
    { key: "instagram", icon: Instagram, label: "Instagram" },
    { key: "twitter",   icon: Twitter,   label: "X / Twitter" },
    { key: "linkedin",  icon: Linkedin,  label: "LinkedIn" },
    { key: "youtube",   icon: Youtube,   label: "YouTube" },
    { key: "facebook",  icon: Facebook,  label: "Facebook" },
  ];

  const getSocial = (platform: string) => (data.socialLinks || []).find((s) => s.platform === platform)?.url || "";
  const setSocial = (platform: string, url: string) => {
    const existing = (data.socialLinks || []).filter((s) => s.platform !== platform);
    set("socialLinks", url ? [...existing, { platform, url }] : existing);
  };

  return (
    <div className="space-y-5">
      <Accordion title="Cover & Identity">
        <div className="space-y-5 pt-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <FieldLabel hint="Full-width image leading the brand portal">Cover Image</FieldLabel>
              <UploadZone 
                value={data.coverImageUrl || null} 
                onChange={(v) => set("coverImageUrl", v)} 
                height={200}
                onLibraryClick={openAssetPicker ? () => openAssetPicker('photography', (url) => set("coverImageUrl", url)) : undefined}
              />
            </div>
            <div className="space-y-4">
              <div>
                <FieldLabel hint="Paste a direct video URL instead of image">Cover Video URL</FieldLabel>
                <TextInput value={data.coverVideoUrl || ""} onChange={(v) => set("coverVideoUrl", v)} placeholder="https://vimeo.com/..." />
              </div>
              <div>
                <FieldLabel hint="Small symbol used as avatar in portal header">Brand Mark</FieldLabel>
                <UploadZone 
                  value={data.brandMarkUrl || null} 
                  onChange={(v) => set("brandMarkUrl", v)} 
                  height={80}
                  onLibraryClick={openAssetPicker ? () => openAssetPicker('brand_logos', (url) => set("brandMarkUrl", url)) : undefined}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Tagline</FieldLabel>
              <TextInput value={data.tagline || ""} onChange={(v) => set("tagline", v)} placeholder="The brand's defining sentence" />
            </div>
            <div>
              <FieldLabel hint="Controls tagline size in the portal cover">Tagline Display Size</FieldLabel>
              <SelectField value={data.taglineSize || ""} onChange={(v) => set("taglineSize", v)} placeholder="Select size"
                options={[
                  { value: "small",    label: "Small — understated" },
                  { value: "medium",   label: "Medium — balanced" },
                  { value: "large",    label: "Large — prominent" },
                  { value: "editorial",label: "Editorial — full screen" },
                ]}
              />
            </div>
          </div>

          <div>
            <FieldLabel hint="1–3 sentences describing the brand at a glance">Brand Description</FieldLabel>
            <TextArea value={data.brandDescription || ""} onChange={(v) => set("brandDescription", v)} placeholder="A short, compelling description of who the brand is and what it stands for." rows={4} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Industry</FieldLabel>
              <TextInput value={data.industry || ""} onChange={(v) => set("industry", v)} placeholder="e.g. Fashion, SaaS, Hospitality" />
            </div>
            <div>
              <FieldLabel>Founded Year</FieldLabel>
              <TextInput value={data.foundedYear ? String(data.foundedYear) : ""} onChange={(v) => set("foundedYear", v ? parseInt(v) : null)} placeholder="e.g. 2019" />
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Contact & Social" defaultOpen={false}>
        <div className="space-y-4 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Contact Email</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input type="email" value={data.contactEmail || ""} onChange={(e) => set("contactEmail", e.target.value)} placeholder="hello@brand.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)] placeholder:italic placeholder:text-[var(--text-muted)]" />
              </div>
            </div>
            <div>
              <FieldLabel>Website URL</FieldLabel>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input type="url" value={data.websiteUrl || ""} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://brand.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)] placeholder:italic placeholder:text-[var(--text-muted)]" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {SOCIAL_PLATFORMS.map(({ key, icon: Icon, label }) => (
              <div key={key} className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0" />
                <TextInput value={getSocial(key)} onChange={(v) => setSocial(key, v)} placeholder={`${label} URL`} />
              </div>
            ))}
          </div>
        </div>
      </Accordion>
    </div>
  );
}

// ─── 02 STRATEGY EDITOR ──────────────────────────────────────────────────────

const ARCHETYPES: { id: BrandArchetype; description: string }[] = [
  { id: "Hero",     description: "Courageous, determined, bold" },
  { id: "Creator",  description: "Inventive, artistic, original" },
  { id: "Sage",     description: "Wise, knowledgeable, trusted" },
  { id: "Explorer", description: "Adventurous, free, authentic" },
  { id: "Ruler",    description: "Powerful, authoritative, leading" },
  { id: "Caregiver",description: "Nurturing, generous, protective" },
  { id: "Innocent", description: "Optimistic, pure, simple" },
  { id: "Jester",   description: "Playful, humorous, light" },
  { id: "Lover",    description: "Passionate, sensual, intimate" },
  { id: "Rebel",    description: "Disruptive, radical, revolutionary" },
  { id: "Everyman", description: "Relatable, real, down-to-earth" },
  { id: "Magician", description: "Transformative, visionary, inspiring" },
];

function StrategyEditor({ data, setData, openAssetPicker }: { 
  data: Partial<BrandStrategy>; 
  setData: (d: any) => void;
  openAssetPicker?: (cat: AssetCategory, onSelect: (url: string) => void) => void;
}) {
  const set = (key: string, val: any) => setData({ ...data, [key]: val });
  const tov         = data.toneOfVoice    || { descriptors: [], dos: [], donts: [] };
  const personality = data.brandPersonality || { archetype: null, adjectives: [], antiAdjectives: [] };
  const audience    = data.targetAudience || { primary: { description: "", ageRange: "", behaviors: "" }, secondary: null };

  return (
    <div className="space-y-5">
      <Accordion title="Foundation">
        <div className="space-y-4 pt-3">
          <div>
            <FieldLabel hint="Why the brand exists — the driving purpose">Mission</FieldLabel>
            <TextArea value={data.mission || ""} onChange={(v) => set("mission", v)} placeholder="We exist to..." rows={3} />
          </div>
          <div>
            <FieldLabel hint="The future the brand is building toward">Vision</FieldLabel>
            <TextArea value={data.vision || ""} onChange={(v) => set("vision", v)} placeholder="A world where..." rows={3} />
          </div>
          <div>
            <FieldLabel hint="How the brand positions itself in the market">Positioning Statement</FieldLabel>
            <TextArea value={data.positioningStatement || ""} onChange={(v) => set("positioningStatement", v)} placeholder="For [audience] who [need], [Brand] is the [category] that [benefit] because [reason]." rows={3} />
          </div>
        </div>
      </Accordion>

      <Accordion title="Brand Story" defaultOpen={false}>
        <div className="space-y-4 pt-3">
          <div>
            <FieldLabel>Story Headline</FieldLabel>
            <TextInput value={data.storyHeadline || ""} onChange={(v) => set("storyHeadline", v)} placeholder="The compelling headline that opens the brand story" />
          </div>
          <div>
            <FieldLabel>Story Body</FieldLabel>
            <TextArea value={data.storyBody || ""} onChange={(v) => set("storyBody", v)} placeholder="The full brand origin story, told with personality..." rows={6} />
          </div>
          <div>
            <FieldLabel hint="Upload images that accompany the brand story">Story Images</FieldLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1].map((i) => (
                <UploadZone key={i} value={(data.storyImages || [])[i] || null} onChange={(v) => {
                  const imgs = [...(data.storyImages || [null, null])];
                  imgs[i] = v || "";
                  set("storyImages", imgs.filter(Boolean));
                }} height={120} onLibraryClick={openAssetPicker ? () => openAssetPicker('photography', (url) => {
                  const imgs = [...(data.storyImages || [null, null])];
                  imgs[i] = url;
                  set("storyImages", imgs.filter(Boolean));
                }) : undefined} />
              ))}
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Brand Values" defaultOpen={false}>
        <div className="space-y-3 pt-3">
          {(data.values || []).map((val, i) => (
            <div key={i} className="border border-[var(--border-subtle)] p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <TextInput value={val.name} onChange={(v) => { const vals = [...(data.values || [])]; vals[i] = { ...vals[i], name: v }; set("values", vals); }} placeholder="Value name (e.g. Integrity)" />
                  <TextArea value={val.description} onChange={(v) => { const vals = [...(data.values || [])]; vals[i] = { ...vals[i], description: v }; set("values", vals); }} placeholder="What this value means in practice..." rows={2} />
                </div>
                <button onClick={() => set("values", (data.values || []).filter((_, j) => j !== i))} className="p-1.5 text-[var(--text-tertiary)] hover:text-red-500 transition-colors mt-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => set("values", [...(data.values || []), { name: "", description: "", imageUrl: null }])} className="flex items-center gap-1.5 text-sm text-[var(--hs-accent)] hover:opacity-75 transition-opacity">
            <Plus className="w-4 h-4" /> Add Value
          </button>
        </div>
      </Accordion>

      <Accordion title="Tone of Voice" defaultOpen={false}>
        <div className="space-y-5 pt-3">
          <div>
            <FieldLabel hint="3–5 adjectives that define the brand voice">Voice Descriptors</FieldLabel>
            <TagInput tags={tov.descriptors} onChange={(v) => set("toneOfVoice", { ...tov, descriptors: v })} placeholder="e.g. Bold, Warm, Precise" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel hint="What the brand does say">We Say ✓</FieldLabel>
              <TagInput tags={tov.dos} onChange={(v) => set("toneOfVoice", { ...tov, dos: v })} placeholder="e.g. Let's figure it out together" />
            </div>
            <div>
              <FieldLabel hint="What the brand never says">We Never Say ✗</FieldLabel>
              <TagInput tags={tov.donts} onChange={(v) => set("toneOfVoice", { ...tov, donts: v })} placeholder="e.g. Synergize our core competencies" />
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Brand Personality" defaultOpen={false}>
        <div className="space-y-5 pt-3">
          <div>
            <FieldLabel hint="Select the archetype that best captures the brand's character">Brand Archetype</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ARCHETYPES.map(({ id, description }) => (
                <button key={id}
                  onClick={() => set("brandPersonality", { ...personality, archetype: personality.archetype === id ? null : id })}
                  className={cn(
                    "p-3 border text-left transition-all",
                    personality.archetype === id
                      ? "border-[var(--hs-primary)] bg-[var(--hs-primary)] text-white"
                      : "border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--surface-default)]"
                  )}
                >
                  <p className="font-medium text-sm">{id}</p>
                  <p className={cn("text-xs mt-0.5", personality.archetype === id ? "text-white/70" : "text-[var(--text-tertiary)]")}>{description}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <FieldLabel hint="Adjectives that describe the brand">Brand Is</FieldLabel>
              <TagInput tags={personality.adjectives} onChange={(v) => set("brandPersonality", { ...personality, adjectives: v })} placeholder="e.g. Bold, Refined, Warm" />
            </div>
            <div>
              <FieldLabel hint="Adjectives the brand explicitly avoids">Brand Is Never</FieldLabel>
              <TagInput tags={personality.antiAdjectives} onChange={(v) => set("brandPersonality", { ...personality, antiAdjectives: v })} placeholder="e.g. Arrogant, Loud, Generic" />
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Target Audience" defaultOpen={false}>
        <div className="space-y-5 pt-3">
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Primary Audience</p>
          <TextArea value={audience.primary.description} onChange={(v) => set("targetAudience", { ...audience, primary: { ...audience.primary, description: v } })} placeholder="Who they are — demographics, psychographics, mindset..." rows={3} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Age Range</FieldLabel>
              <TextInput value={audience.primary.ageRange} onChange={(v) => set("targetAudience", { ...audience, primary: { ...audience.primary, ageRange: v } })} placeholder="e.g. 28–45" />
            </div>
            <div>
              <FieldLabel>Key Behaviors</FieldLabel>
              <TextInput value={audience.primary.behaviors} onChange={(v) => set("targetAudience", { ...audience, primary: { ...audience.primary, behaviors: v } })} placeholder="e.g. Values sustainability, digital-first" />
            </div>
          </div>
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">Secondary Audience</p>
          <TextArea value={audience.secondary?.description || ""} onChange={(v) => set("targetAudience", { ...audience, secondary: v ? { description: v } : null })} placeholder="Secondary audience description..." rows={3} />
        </div>
      </Accordion>
    </div>
  );
}

// ─── 03 LOGO EDITOR ──────────────────────────────────────────────────────────

const VARIANT_CONFIGS: { type: LogoVariantType; label: string; defaultBg: string }[] = [
  { type: "full_color",  label: "Full Color",  defaultBg: "#FFFFFF" },
  { type: "reversed",    label: "Reversed",    defaultBg: "#0F0F0F" },
  { type: "monochrome",  label: "Monochrome",  defaultBg: "#FFFFFF" },
  { type: "outline",     label: "Outline",     defaultBg: "#F5F5F5" },
];

function LogoCard({ logo, onChange, onRemove, openAssetPicker }: {
  logo: Partial<BrandLogo>; index: number; onChange: (l: Partial<BrandLogo>) => void; onRemove: () => void;
  openAssetPicker?: (category: AssetCategory, onSelect: (url: string) => void) => void;
}) {
  const [tab, setTab] = useState<"variants" | "rules" | "misuse">("variants");
  const set = (key: string, val: any) => onChange({ ...logo, [key]: val });
  const variants  = logo.variants || VARIANT_CONFIGS.map((c) => ({ variantType: c.type, fileUrl: null, downloadUrl: null, previewBgColor: c.defaultBg }));
  const clearSpace = logo.clearSpace || { unit: "x-height" as const, value: 1, description: "", diagramUrl: null };
  const misuse     = logo.misuseExamples || [];

  return (
    <div className="border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-[var(--text-tertiary)] cursor-grab" />
          <input value={logo.label || ""} onChange={(e) => set("label", e.target.value)}
            className="font-medium text-sm text-[var(--text-primary)] bg-transparent border-b border-transparent focus:border-[var(--hs-accent)] focus:outline-none"
            placeholder="Logo name (e.g. Primary Logo)" />
        </div>
        <button onClick={onRemove} className="p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className="flex border-b border-[var(--border-subtle)]">
        {(["variants", "rules", "misuse"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors capitalize",
              tab === t ? "border-b-2 border-[var(--hs-accent)] text-[var(--hs-accent)] -mb-px" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "variants" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {VARIANT_CONFIGS.map((config) => {
                const v = variants.find((vv) => vv.variantType === config.type) || { variantType: config.type, fileUrl: null, downloadUrl: null, previewBgColor: config.defaultBg };
                const updateVariant = (updates: any) => {
                  const updated = variants.map((vv) => vv.variantType === config.type ? { ...vv, ...updates } : vv);
                  if (!variants.find((vv) => vv.variantType === config.type)) updated.push({ ...v, ...updates });
                  set("variants", updated);
                };
                return (
                  <div key={config.type} className="border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)]">
                      <span className="text-xs font-medium text-[var(--text-secondary)]">{config.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[var(--text-tertiary)]">BG:</span>
                        <input type="color" value={v.previewBgColor || config.defaultBg} onChange={(e) => updateVariant({ previewBgColor: e.target.value })} className="w-5 h-5 border border-[var(--border-default)] cursor-pointer" />
                      </div>
                    </div>
                    <div style={{ background: v.previewBgColor || config.defaultBg }}>
                      <UploadZone 
                        value={v.fileUrl || null} 
                        onChange={(val) => updateVariant({ fileUrl: val })} 
                        height={100}
                        onLibraryClick={openAssetPicker ? () => openAssetPicker('brand_logos', (url) => updateVariant({ fileUrl: url })) : undefined}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <FieldLabel>Logo Description</FieldLabel>
              <TextArea value={logo.description || ""} onChange={(v) => set("description", v)} placeholder="Describe the logo concept and construction..." rows={2} />
            </div>
          </div>
        )}

        {tab === "rules" && (
          <div className="space-y-5">
            <div>
              <FieldLabel hint="Minimum amount of clear space around the logo">Clear Space</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Unit</FieldLabel>
                  <SelectField value={clearSpace.unit} onChange={(v) => set("clearSpace", { ...clearSpace, unit: v })} options={[{ value: "x-height", label: "x-height of logo" }, { value: "fixed_px", label: "Fixed pixels" }]} />
                </div>
                <div>
                  <FieldLabel>Value</FieldLabel>
                  <NumberInput value={clearSpace.value} onChange={(v) => set("clearSpace", { ...clearSpace, value: v })} min={0} step={0.5} unit={clearSpace.unit === "x-height" ? "× x-height" : "px"} />
                </div>
              </div>
              <div className="mt-2">
                <TextInput value={clearSpace.description} onChange={(v) => set("clearSpace", { ...clearSpace, description: v })} placeholder="e.g. Clear space = the cap height of the 'H'" />
              </div>
            </div>
            <div>
              <FieldLabel>Minimum Size</FieldLabel>
              <NumberInput value={logo.minSizePx || 40} onChange={(v) => set("minSizePx", v)} min={10} unit="px wide" />
            </div>
            <div>
              <FieldLabel hint="Approved formats for this logo file">Safe Formats</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {["svg", "png", "eps", "pdf", "webp"].map((fmt) => {
                  const isSelected = (logo.safeFormats || []).includes(fmt);
                  return (
                    <button key={fmt} onClick={() => {
                      const current = logo.safeFormats || [];
                      set("safeFormats", isSelected ? current.filter((f) => f !== fmt) : [...current, fmt]);
                    }} className={cn("px-3 py-1.5 text-xs font-mono font-medium border transition-all",
                      isSelected ? "bg-[var(--hs-primary)] border-[var(--hs-primary)] text-white" : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                    )}>
                      .{fmt}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <FieldLabel>Usage Notes (Do's)</FieldLabel>
              <TextArea value={logo.usageNotes || ""} onChange={(v) => set("usageNotes", v)} placeholder="What to do — approved backgrounds, placements, contexts..." rows={3} />
            </div>
            <div>
              <FieldLabel>Usage Restrictions (Don'ts)</FieldLabel>
              <TextArea value={logo.usageNotesDonts || ""} onChange={(v) => set("usageNotesDonts", v)} placeholder="What never to do — distort, recolor, add effects..." rows={3} />
            </div>
          </div>
        )}

        {tab === "misuse" && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">Upload examples of incorrect logo usage. Label each one clearly.</p>
            {misuse.map((ex, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 items-start border border-[var(--border-subtle)] p-3">
                <UploadZone 
                  value={ex.imageUrl || null} 
                  onChange={(v) => { const updated = [...misuse]; updated[i] = { ...ex, imageUrl: v || "" }; set("misuseExamples", updated); }} 
                  height={100} 
                  onLibraryClick={openAssetPicker ? () => openAssetPicker('brand_logos', (url) => {
                    const updated = [...misuse];
                    updated[i] = { ...ex, imageUrl: url };
                    set("misuseExamples", updated);
                  }) : undefined}
                />
                <div className="space-y-2">
                  <TextInput value={ex.label} onChange={(v) => { const updated = [...misuse]; updated[i] = { ...ex, label: v }; set("misuseExamples", updated); }} placeholder="e.g. Don't stretch the logo" />
                  <button onClick={() => set("misuseExamples", misuse.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => set("misuseExamples", [...misuse, { imageUrl: "", label: "" }])} className="flex items-center gap-1.5 text-sm text-[var(--hs-accent)] hover:opacity-75 transition-opacity">
              <Plus className="w-4 h-4" /> Add Misuse Example
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LogoEditor({ data, setData, openAssetPicker }: { 
  data: { logos?: Partial<BrandLogo>[] }; 
  setData: (d: any) => void;
  openAssetPicker?: (cat: AssetCategory, onSelect: (url: string) => void) => void;
}) {
  const logos = data.logos || [];
  const addLogo    = () => setData({ ...data, logos: [...logos, { id: String(Date.now()), label: "New Logo", sortOrder: logos.length }] });
  const removeLogo = (i: number) => setData({ ...data, logos: logos.filter((_, j) => j !== i) });
  const updateLogo = (i: number, updated: Partial<BrandLogo>) => { const next = [...logos]; next[i] = updated; setData({ ...data, logos: next }); };

  return (
    <div className="space-y-4">
      {logos.length === 0 && (
        <div className="border border-dashed border-[var(--border-strong)] p-8 text-center">
          <Image className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)] mb-1">No logos added yet</p>
          <p className="text-xs text-[var(--text-tertiary)]">Add your primary logo first, then secondary, wordmark, and icon mark</p>
        </div>
      )}
      {logos.map((logo, i) => (
        <LogoCard 
          key={logo.id || i} 
          logo={logo} 
          index={i} 
          onChange={(updated) => updateLogo(i, updated)} 
          onRemove={() => removeLogo(i)} 
          openAssetPicker={openAssetPicker}
        />
      ))}
      <button onClick={addLogo} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)] hover:border-[var(--hs-accent)] hover:text-[var(--hs-accent)] transition-colors">
        <Plus className="w-4 h-4" /> Add Logo
      </button>
    </div>
  );
}

// ─── 04 COLOUR EDITOR — Full Architecture ────────────────────────────────────

function hexToRgb(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  } catch { return "0, 0, 0"; }
}

function hexToCmyk(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return "0, 0, 0, 100";
    const c = Math.round(((1 - r - k) / (1 - k)) * 100);
    const m = Math.round(((1 - g - k) / (1 - k)) * 100);
    const y = Math.round(((1 - b - k) / (1 - k)) * 100);
    return `${c}, ${m}, ${y}, ${Math.round(k * 100)}`;
  } catch { return "0, 0, 0, 100"; }
}

function getLuminance(hex: string): number {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const [rs, gs, bs] = [r, g, b].map((c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  } catch { return 0; }
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1); const l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function generateTints(hex: string): { label: string; hex: string }[] {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    const s = max === min ? 0 : l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max !== min) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    const H = h * 360, S = s * 100;
    const steps = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10];
    return steps.map((lPct, i) => {
      const sl = S / 100, ll = lPct / 100;
      const a = sl * Math.min(ll, 1 - ll);
      const f = (n: number) => {
        const k = (n + H / 30) % 12;
        const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
      };
      return { label: String((i + 1) * 100), hex: `#${f(0)}${f(8)}${f(4)}` };
    });
  } catch { return []; }
}

/** Full-featured colour card with custom picker, auto-computed values, tints strip, and WCAG */
function ColorCard({ color, onChange, onRemove }: {
  color: Partial<BrandColor>; onChange: (c: Partial<BrandColor>) => void; onRemove: () => void;
}) {
  const set = (key: string, val: any) => onChange({ ...color, [key]: val });
  const hex       = color.hex || "#000000";
  const onColorHex = color.onColor || "#FFFFFF";
  const [showPicker, setShowPicker] = useState(false);
  const [showTints, setShowTints] = useState(false);
  const [copied, setCopied] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleHexChange = (newHex: string) => {
    onChange({ ...color, hex: newHex, rgb: hexToRgb(newHex), cmyk: hexToCmyk(newHex) });
  };

  const ratio = (() => { try { return contrastRatio(hex, onColorHex); } catch { return 0; } })();
  const wcagLevel = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail";
  const wcagColor = ratio >= 4.5 ? "text-emerald-500" : ratio >= 3 ? "text-amber-500" : "text-red-500";
  const tints = generateTints(hex);

  const copyHex = () => {
    navigator.clipboard.writeText(hex.toUpperCase());
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border border-[var(--border-subtle)] overflow-hidden">
      {/* Large swatch with live picker */}
      <div className="relative" style={{ background: hex, height: 110 }} ref={pickerRef}>
        {/* Click to open picker */}
        <button onClick={() => setShowPicker(!showPicker)}
          className="absolute top-2.5 left-2.5 w-9 h-9 border-2 border-white/50 shadow-lg rounded-sm transition-transform hover:scale-105"
          style={{ background: hex }} title="Click to change colour" />

        {/* Custom picker popover */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 z-50 border shadow-2xl p-3"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--bg-quaternary)", minWidth: 220 }}
            >
              <HexColorPicker color={hex.startsWith("#") ? hex : "#888888"} onChange={handleHexChange} style={{ width: "100%" }} />
              <div className="flex items-center gap-2 mt-3">
                <input value={hex} onChange={(e) => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) handleHexChange(e.target.value); }}
                  className="flex-1 px-2 py-1.5 text-xs font-mono bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--hs-accent)]" />
                <button onClick={() => setShowPicker(false)} className="px-2 py-1.5 text-xs bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-right controls */}
        <div className="absolute top-2 right-2 flex gap-1">
          {color.isPrimary && <span className="px-1.5 py-0.5 bg-black/50 text-white text-xs">Primary</span>}
          <button onClick={copyHex} className="p-1.5 bg-black/50 text-white hover:bg-black/80 transition-colors">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
          <button onClick={onRemove} className="p-1.5 bg-black/50 text-white hover:bg-red-600 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom: name + hex on-swatch */}
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <span style={{ color: onColorHex, fontSize: "0.875rem", fontWeight: 600 }}>{color.colorName || "Color Name"}</span>
          <span style={{ color: onColorHex, fontSize: "0.7rem", fontFamily: "monospace" }}>{hex.toUpperCase()}</span>
        </div>
      </div>

      {/* Tints strip */}
      {tints.length > 0 && (
        <div>
          <button onClick={() => setShowTints(!showTints)} className="w-full flex items-center justify-between px-3 py-1.5 bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
            <span>Tints & Shades</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showTints && "rotate-180")} />
          </button>
          <AnimatePresence>
            {showTints && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="flex">
                  {tints.map((t) => (
                    <button key={t.label} title={`${t.hex} (${t.label})`} onClick={() => navigator.clipboard.writeText(t.hex)}
                      className="flex-1 transition-opacity hover:opacity-80" style={{ background: t.hex, height: 24 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Fields */}
      <div className="p-4 space-y-3">
        {/* Name + Palette type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <FieldLabel>Color Name</FieldLabel>
            <TextInput value={color.colorName || ""} onChange={(v) => set("colorName", v)} placeholder="e.g. Stone Gold" />
          </div>
          <div>
            <FieldLabel>Palette Type</FieldLabel>
            <div className="flex">
              {(["primary", "secondary", "neutral"] as const).map((t) => (
                <button key={t} onClick={() => set("paletteType", t)}
                  className={cn("flex-1 py-2 text-xs font-medium capitalize border-y first:border-l last:border-r border-[var(--border-default)] transition-all",
                    color.paletteType === t ? "bg-[var(--hs-primary)] text-white border-[var(--hs-primary)]" : "bg-[var(--surface-default)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* HEX + Usage Role */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>Hex</FieldLabel>
            <div className="flex items-center gap-2">
              <input value={hex} onChange={(e) => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) { set("hex", v); if (/^#[0-9A-Fa-f]{6}$/.test(v)) { set("rgb", hexToRgb(v)); set("cmyk", hexToCmyk(v)); } } }}
                className="flex-1 px-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm font-mono focus:outline-none focus:border-[var(--hs-accent)]" />
              <button onClick={copyHex} className="p-2 border border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <FieldLabel>Usage Role</FieldLabel>
            <SelectField value={color.usageRole || ""} onChange={(v) => set("usageRole", v as ColorUsageRole)} placeholder="Select role"
              options={[
                { value: "background", label: "Background" }, { value: "text",    label: "Text" },
                { value: "cta",        label: "CTA / Button" }, { value: "accent", label: "Accent" },
                { value: "border",     label: "Border" },    { value: "surface",  label: "Surface" },
                { value: "general",    label: "General" },
              ]}
            />
          </div>
        </div>

        {/* RGB + CMYK — auto-computed */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>RGB</FieldLabel>
            <TextInput value={color.rgb || hexToRgb(hex)} onChange={(v) => set("rgb", v)} placeholder="255, 255, 255" />
          </div>
          <div>
            <FieldLabel>CMYK</FieldLabel>
            <TextInput value={color.cmyk || hexToCmyk(hex)} onChange={(v) => set("cmyk", v)} placeholder="0, 0, 0, 100" />
          </div>
        </div>

        {/* Pantone */}
        <div>
          <FieldLabel>Pantone</FieldLabel>
          <TextInput value={color.pantone || ""} onChange={(v) => set("pantone", v)} placeholder="e.g. 7711 C" />
        </div>

        {/* On-color + Contrast ratio */}
        <div>
          <FieldLabel hint="Text/icon colour used on top of this background">On-Color (Text On This)</FieldLabel>
          <div className="flex items-center gap-3">
            <input type="color" value={onColorHex} onChange={(e) => set("onColor", e.target.value)} className="w-10 h-10 border border-[var(--border-default)] cursor-pointer" />
            <TextInput value={onColorHex} onChange={(v) => { if (/^#[0-9A-Fa-f]{6}$/.test(v)) set("onColor", v); }} />
            <div className="flex-shrink-0 text-right">
              <p className={cn("text-sm font-semibold", wcagColor)}>{wcagLevel}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{ratio.toFixed(2)}:1</p>
            </div>
          </div>
        </div>

        {/* Accessibility Declaration */}
        <div>
          <FieldLabel>Accessibility Declaration</FieldLabel>
          <div className="flex gap-2">
            {(["AA", "AAA", "decorative"] as AccessibilityLevel[]).map((level) => (
              <button key={level} onClick={() => set("accessibilityLevel", level)}
                className={cn("flex-1 py-2 text-xs font-medium border transition-all",
                  color.accessibilityLevel === level ? "bg-[var(--hs-primary)] text-white border-[var(--hs-primary)]" : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                )}>
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Primary flag */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!!color.isPrimary} onChange={(e) => set("isPrimary", e.target.checked)} className="w-4 h-4 accent-[var(--hs-accent)]" />
          <span className="text-sm text-[var(--text-secondary)]">This is the primary brand colour</span>
        </label>

        {/* Description */}
        <div>
          <FieldLabel>Description / Usage Notes</FieldLabel>
          <TextInput value={color.description || ""} onChange={(v) => set("description", v)} placeholder="e.g. The dominant colour across all brand touchpoints" />
        </div>
      </div>
    </div>
  );
}

/** Palette overview strip — all colours at a glance */
function PaletteOverviewStrip({ colors }: { colors: Partial<BrandColor>[] }) {
  if (colors.length === 0) return null;
  return (
    <div className="border border-[var(--border-subtle)] overflow-hidden">
      <div className="flex h-14">
        {colors.map((c, i) => (
          <div key={i} title={`${c.colorName || "Unnamed"} — ${(c.hex || "#000").toUpperCase()}`}
            className="flex-1 transition-all hover:flex-[2] cursor-default"
            style={{ background: c.hex || "#ccc" }}
          />
        ))}
      </div>
      <div className="flex overflow-x-auto">
        {colors.map((c, i) => (
          <div key={i} className="flex-1 min-w-[60px] px-2 py-1.5 border-r border-[var(--border-subtle)] last:border-r-0">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate">{c.colorName || "—"}</p>
            <p className="text-[10px] font-mono text-[var(--text-tertiary)] truncate">{(c.hex || "").toUpperCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorEditor({ data, setData }: { data: { colors?: Partial<BrandColor>[] }; setData: (d: any) => void }) {
  const colors = data.colors || [];
  const addColor     = () => setData({ ...data, colors: [...colors, { id: String(Date.now()), hex: "#C9A96E", colorName: "", paletteType: "primary" as const, isPrimary: false, sortOrder: colors.length }] });
  const updateColor  = (i: number, updated: Partial<BrandColor>) => { const next = [...colors]; next[i] = updated; setData({ ...data, colors: next }); };
  const removeColor  = (i: number) => setData({ ...data, colors: colors.filter((_, j) => j !== i) });

  const groups = {
    primary:   colors.filter((c) => c.paletteType === "primary"),
    secondary: colors.filter((c) => c.paletteType === "secondary"),
    neutral:   colors.filter((c) => c.paletteType === "neutral"),
  };

  return (
    <div className="space-y-6">
      {/* Overview strip */}
      {colors.length > 0 && <PaletteOverviewStrip colors={colors} />}

      {colors.length === 0 && (
        <div className="border border-dashed border-[var(--border-strong)] p-8 text-center">
          <Palette className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No colours added yet</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Add primary colours first, then secondary and neutral</p>
        </div>
      )}

      {(["primary", "secondary", "neutral"] as const).map((group) => {
        const groupColors = groups[group];
        if (groupColors.length === 0) return null;
        return (
          <div key={group}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">{group} Palette</h3>
              <div className="flex gap-1">
                {groupColors.map((c, i) => (
                  <div key={i} title={c.colorName || ""} className="w-4 h-4 border border-white/20" style={{ background: c.hex || "#ccc" }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {groupColors.map((color) => {
                const i = colors.indexOf(color);
                return <ColorCard key={color.id || i} color={color} onChange={(updated) => updateColor(i, updated)} onRemove={() => removeColor(i)} />;
              })}
            </div>
          </div>
        );
      })}

      <button onClick={addColor} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)] hover:border-[var(--hs-accent)] hover:text-[var(--hs-accent)] transition-colors">
        <Plus className="w-4 h-4" /> Add Colour
      </button>
    </div>
  );
}

// ─── 05 TYPOGRAPHY EDITOR — Live Font Loading ─────────────────────────────────

const FONT_WEIGHT_OPTIONS: { value: FontWeight; label: string }[] = [
  { value: 100, label: "100 Thin" }, { value: 200, label: "200 ExtraLight" },
  { value: 300, label: "300 Light" }, { value: 400, label: "400 Regular" },
  { value: 500, label: "500 Medium" }, { value: 600, label: "600 SemiBold" },
  { value: 700, label: "700 Bold" }, { value: 800, label: "800 ExtraBold" },
  { value: 900, label: "900 Black" },
];

const TYPE_SCALE_KEYS = [
  { key: "display",   label: "Display",    sample: "Brand Identity",          size: 48 },
  { key: "h1",        label: "H1",         sample: "Strategic Vision",        size: 36 },
  { key: "h2",        label: "H2",         sample: "Visual Identity System",  size: 28 },
  { key: "h3",        label: "H3",         sample: "Core Brand Principles",   size: 22 },
  { key: "body1",     label: "Body",       sample: "Every visual decision reinforces a single strategic truth.", size: 16 },
  { key: "caption",   label: "Caption",    sample: "Typography is the voice of the brand.", size: 13 },
  { key: "overline",  label: "UI / Label", sample: "BUTTON · NAVIGATION · FORM LABEL", size: 12 },
];

const POPULAR_GOOGLE_FONTS = [
  "Inter", "Playfair Display", "Montserrat", "Raleway", "Lato", "Poppins",
  "DM Serif Display", "Cormorant Garamond", "Josefin Sans", "Space Grotesk",
  "Bebas Neue", "Italiana", "Libre Baskerville", "Nunito", "Work Sans",
];

async function loadGoogleFont(name: string): Promise<"loaded" | "not-found" | "error"> {
  if (!name.trim()) return "error";
  const linkId = `gf-${name.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(linkId)) return "loaded";
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.id = linkId; link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    link.onload = () => resolve("loaded");
    link.onerror = () => resolve("not-found");
    document.head.appendChild(link);
    setTimeout(() => resolve("error"), 8000);
  });
}

async function loadFontFromZip(file: File, fontFamilyName: string): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const fontExtensions = [".woff2", ".woff", ".otf", ".ttf"];
  const fontFiles: Array<{ name: string; data: ArrayBuffer }> = [];

  for (const [filename, entry] of Object.entries(zip.files)) {
    const lower = filename.toLowerCase();
    const ext = fontExtensions.find((e) => lower.endsWith(e));
    if (ext && !entry.dir) fontFiles.push({ name: filename, data: await entry.async("arraybuffer") });
  }

  if (fontFiles.length === 0) throw new Error("No font files found in ZIP");

  for (const { name, data } of fontFiles) {
    const lower = name.toLowerCase();
    let weight = "400";
    if (lower.includes("variable")) {
      const ff = new FontFace(fontFamilyName, data, { weight: "100 900" });
      await ff.load(); document.fonts.add(ff); continue;
    }
    if      (lower.includes("thin"))        weight = "100";
    else if (lower.includes("extralight"))  weight = "200";
    else if (lower.includes("light"))       weight = "300";
    else if (lower.includes("medium"))      weight = "500";
    else if (lower.includes("semibold"))    weight = "600";
    else if (lower.includes("extrabold"))   weight = "800";
    else if (lower.includes("black"))       weight = "900";
    else if (lower.includes("bold"))        weight = "700";
    const ff = new FontFace(fontFamilyName, data, { weight });
    await ff.load(); document.fonts.add(ff);
  }
}

function TypographyCard({ font, onChange, onRemove }: {
  font: Partial<BrandTypography>; onChange: (f: Partial<BrandTypography>) => void; onRemove: () => void;
}) {
  const set = (key: string, val: any) => onChange({ ...font, [key]: val });
  const weights       = font.weights || [];
  const scale         = font.typeScale || {};
  const [showScale, setShowScale] = useState(false);
  const [fontStatus, setFontStatus] = useState<"idle" | "loading" | "loaded" | "not-found" | "zip-loaded" | "error">("idle");
  const [previewText, setPreviewText] = useState(font.previewSentence || "The quick brown fox jumps over the lazy dog");
  const [zipLoading, setZipLoading] = useState(false);
  const zipRef = useRef<HTMLInputElement>(null);

  const fontFamily = font.fontName ? `"${font.fontName}", sans-serif` : "inherit";

  // Auto-load Google Font when fontName changes
  useEffect(() => {
    if (!font.fontName) return;
    setFontStatus("loading");
    loadGoogleFont(font.fontName).then((status) => {
      setFontStatus(status === "loaded" ? "loaded" : "not-found");
    });
  }, [font.fontName]);

  const handleZipUpload = async (file: File) => {
    if (!font.fontName) {
      useUIStore.getState().showToast("Enter a font name first", "error");
      return;
    }
    setZipLoading(true);
    try {
      await loadFontFromZip(file, font.fontName);
      setFontStatus("zip-loaded");
      useUIStore.getState().showToast(`${font.fontName} loaded from ZIP`, "success");
    } catch (e: any) {
      useUIStore.getState().showToast(e.message || "ZIP load failed", "error");
      setFontStatus("error");
    } finally {
      setZipLoading(false);
    }
  };

  return (
    <div className="border border-[var(--border-subtle)]">
      {/* Live Specimen Preview */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-mono text-[var(--text-tertiary)]">{font.fontName || "Font family"} · {font.fontRole || "body"}</p>
            {fontStatus === "loading" && <span className="inline-flex items-center gap-1 text-xs text-[var(--text-tertiary)] mt-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading from Google Fonts...</span>}
            {fontStatus === "not-found" && <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1"><AlertTriangle className="w-3 h-3" /> Not found on Google Fonts — upload a ZIP below</span>}
            {fontStatus === "loaded" && <span className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-1"><Check className="w-3 h-3" /> Loaded from Google Fonts</span>}
            {fontStatus === "zip-loaded" && <span className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-1"><Check className="w-3 h-3" /> Loaded from uploaded ZIP</span>}
          </div>
          <input value={previewText} onChange={(e) => setPreviewText(e.target.value)}
            className="text-xs px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-default)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--hs-accent)] w-48 hidden sm:block"
            placeholder="Custom preview text..." />
        </div>
        <div className="space-y-1.5">
          {[{ size: "2.5rem", weight: 700 }, { size: "1.5rem", weight: 600 }, { size: "1.125rem", weight: 400 }, { size: "0.875rem", weight: 400 }].map((style, i) => (
            <p key={i} style={{ fontSize: style.size, fontWeight: style.weight, fontFamily, lineHeight: 1.2, color: "var(--text-primary)", letterSpacing: i === 0 ? "-0.02em" : undefined }}>
              {previewText}
            </p>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[100, 300, 400, 500, 700, 900].map((w) => (
            <span key={w} style={{ fontFamily, fontWeight: w, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-[var(--text-tertiary)] cursor-grab" />
          <input value={font.fontName || ""} onChange={(e) => set("fontName", e.target.value)}
            className="font-medium text-sm text-[var(--text-primary)] bg-transparent border-b border-transparent focus:border-[var(--hs-accent)] focus:outline-none"
            placeholder="Font family name" />
        </div>
        <button onClick={onRemove} className="p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className="p-4 space-y-4">
        {/* Role + Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FieldLabel>Font Role</FieldLabel>
            <SelectField value={font.fontRole || "body"} onChange={(v) => set("fontRole", v)}
              options={[
                { value: "display", label: "Display / Heading" },
                { value: "body",    label: "Body / UI" },
                { value: "accent",  label: "Accent / Editorial" },
                { value: "mono",    label: "Monospace / Code" },
              ]}
            />
          </div>
          <div>
            <FieldLabel>Google Fonts Name</FieldLabel>
            <div className="relative">
              <input type="text" value={font.fontName || ""} onChange={(e) => set("fontName", e.target.value)}
                list="google-fonts-suggestions"
                placeholder="e.g. Playfair Display"
                className="w-full px-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm focus:outline-none focus:border-[var(--hs-accent)] placeholder:italic placeholder:text-[var(--text-muted)]"
              />
              <datalist id="google-fonts-suggestions">
                {POPULAR_GOOGLE_FONTS.map((f) => <option key={f} value={f} />)}
              </datalist>
            </div>
          </div>
        </div>

        {/* ZIP Upload for custom fonts */}
        <div className="border border-dashed border-[var(--border-default)] p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[var(--text-secondary)] font-medium">Upload Font ZIP</p>
            <p className="text-xs text-[var(--text-tertiary)]">.woff2, .woff, .ttf, .otf supported</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            {zipLoading
              ? <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]"><Loader2 className="w-4 h-4 animate-spin" /> Loading fonts from ZIP...</span>
              : <span className="flex items-center gap-2 text-xs px-3 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--hs-accent)] transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload ZIP
                </span>
            }
            <input ref={zipRef} type="file" accept=".zip" className="hidden" disabled={zipLoading}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleZipUpload(f); }} />
          </label>
        </div>

        {/* Source URL */}
        <div>
          <FieldLabel hint="Google Fonts or Adobe Fonts URL for reference">Source URL</FieldLabel>
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input type="url" value={font.fontSourceUrl || ""} onChange={(e) => set("fontSourceUrl", e.target.value)} placeholder="https://fonts.google.com/specimen/..."
              className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm focus:outline-none focus:border-[var(--hs-accent)] placeholder:italic placeholder:text-[var(--text-muted)]" />
          </div>
        </div>

        {/* Weights */}
        <div>
          <FieldLabel>Available Weights</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {FONT_WEIGHT_OPTIONS.map(({ value, label }) => {
              const isSelected = weights.includes(value);
              return (
                <button key={value} onClick={() => set("weights", isSelected ? weights.filter((w) => w !== value) : [...weights, value].sort())}
                  className={cn("px-3 py-1.5 text-xs border transition-all",
                    isSelected ? "bg-[var(--hs-primary)] border-[var(--hs-primary)] text-white" : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                  )}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Usage Context */}
        <div>
          <FieldLabel hint="When and where this font is used">Usage Context</FieldLabel>
          <TextInput value={font.usageContext || ""} onChange={(v) => set("usageContext", v)} placeholder="e.g. Use for all headings above 24px and display copy" />
        </div>

        {/* Pairing Note */}
        <div>
          <FieldLabel hint="What this font pairs with in the system">Pairing Note</FieldLabel>
          <TextInput value={font.pairingNote || ""} onChange={(v) => set("pairingNote", v)} placeholder="e.g. Pairs with Inter for body text in editorial layouts" />
        </div>

        {/* Web Fallback */}
        <div>
          <FieldLabel hint="CSS font stack for web use">Web Fallback Stack</FieldLabel>
          <div className="relative">
            <input value={font.fallbackStack || ""} onChange={(e) => set("fallbackStack", e.target.value)} placeholder="'Playfair Display', Georgia, serif"
              className="w-full pr-10 pl-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm font-mono focus:outline-none focus:border-[var(--hs-accent)] placeholder:italic placeholder:text-[var(--text-muted)] placeholder:font-sans" />
            <button onClick={() => { if (font.fallbackStack) navigator.clipboard.writeText(font.fallbackStack); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Type Scale */}
        <div>
          <button onClick={() => setShowScale(!showScale)} className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {showScale ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Type Scale ({Object.keys(scale).filter((k) => (scale as any)[k]).length} defined)
          </button>
          <AnimatePresence>
            {showScale && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                {/* Live Scale Preview */}
                <div className="border border-[var(--border-subtle)] p-4 bg-[var(--bg-secondary)] mb-3 space-y-1 overflow-hidden">
                  {TYPE_SCALE_KEYS.map(({ key, label, sample, size }) => {
                    const entry = (scale as any)[key] || {};
                    return (
                      <div key={key} className="flex items-baseline gap-3 py-1 border-b border-[var(--border-subtle)] last:border-0">
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)] w-12 flex-shrink-0">{label}</span>
                        <p className="truncate flex-1" style={{
                          fontFamily,
                          fontSize: Math.min(entry.size ? parseFloat(entry.size) : size, 40),
                          fontWeight: entry.weight || 400,
                          lineHeight: entry.lineHeight || 1.3,
                          color: "var(--text-primary)",
                        }}>
                          {sample}
                        </p>
                        <span className="text-[10px] font-mono text-[var(--text-tertiary)] flex-shrink-0">{entry.size || `${size}px`}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Scale Editor Table */}
                <div className="border border-[var(--border-subtle)] overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)]">
                        {["Scale", "Size", "Weight", "Line H.", "Tracking", "Case"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-[var(--text-secondary)]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TYPE_SCALE_KEYS.map(({ key, label }) => {
                        const entry = (scale as any)[key] || { size: "", weight: 400, lineHeight: "", letterSpacing: "", case: "sentence" };
                        const update = (updates: any) => set("typeScale", { ...scale, [key]: { ...entry, ...updates } });
                        return (
                          <tr key={key} className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-subtle)]">
                            <td className="px-3 py-2 font-mono text-[var(--text-tertiary)]">{label}</td>
                            <td className="px-2 py-1.5"><input value={entry.size} onChange={(e) => update({ size: e.target.value })} placeholder="16px" className="w-16 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-default)] text-xs font-mono focus:outline-none focus:border-[var(--hs-accent)]" /></td>
                            <td className="px-2 py-1.5">
                              <select value={entry.weight} onChange={(e) => update({ weight: parseInt(e.target.value) })} className="w-20 px-1 py-1 bg-[var(--bg-primary)] border border-[var(--border-default)] text-xs focus:outline-none">
                                {FONT_WEIGHT_OPTIONS.map((w) => <option key={w.value} value={w.value}>{w.value}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-1.5"><input value={entry.lineHeight} onChange={(e) => update({ lineHeight: e.target.value })} placeholder="1.5" className="w-14 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-default)] text-xs font-mono focus:outline-none focus:border-[var(--hs-accent)]" /></td>
                            <td className="px-2 py-1.5"><input value={entry.letterSpacing || ""} onChange={(e) => update({ letterSpacing: e.target.value })} placeholder="-0.02em" className="w-20 px-2 py-1 bg-[var(--bg-primary)] border border-[var(--border-default)] text-xs font-mono focus:outline-none focus:border-[var(--hs-accent)]" /></td>
                            <td className="px-2 py-1.5">
                              <select value={entry.case || "sentence"} onChange={(e) => update({ case: e.target.value })} className="w-24 px-1 py-1 bg-[var(--bg-primary)] border border-[var(--border-default)] text-xs focus:outline-none">
                                <option value="sentence">Sentence</option>
                                <option value="uppercase">All Caps</option>
                                <option value="lowercase">Lowercase</option>
                                <option value="capitalize">Capitalize</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TypographyEditor({ data, setData }: { data: { fonts?: Partial<BrandTypography>[] }; setData: (d: any) => void }) {
  const fonts     = data.fonts || [];
  const addFont   = () => setData({ ...data, fonts: [...fonts, { id: String(Date.now()), fontName: "", fontRole: "body" as const, weights: [400, 700], sortOrder: fonts.length }] });
  const removeFont = (i: number) => setData({ ...data, fonts: fonts.filter((_, j) => j !== i) });
  const updateFont = (i: number, updated: Partial<BrandTypography>) => { const next = [...fonts]; next[i] = updated; setData({ ...data, fonts: next }); };

  return (
    <div className="space-y-4">
      {fonts.length === 0 && (
        <div className="border border-dashed border-[var(--border-strong)] p-8 text-center">
          <Type className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)] mb-1">No fonts added yet</p>
          <p className="text-xs text-[var(--text-tertiary)]">Add your display/heading font first, then body font</p>
        </div>
      )}
      {fonts.map((font, i) => (
        <TypographyCard key={font.id || i} font={font} onChange={(updated) => updateFont(i, updated)} onRemove={() => removeFont(i)} />
      ))}
      <button onClick={addFont} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)] hover:border-[var(--hs-accent)] hover:text-[var(--hs-accent)] transition-colors">
        <Plus className="w-4 h-4" /> Add Font
      </button>
    </div>
  );
}

// ─── 06 IMAGES EDITOR ────────────────────────────────────────────────────────

const PHOTOGRAPHY_STYLE_PRESETS = ["candid", "natural_light", "high_contrast", "documentary", "editorial", "lifestyle", "product", "architectural", "portrait", "aerial", "black_and_white", "film_grain"];
const MOOD_DESCRIPTOR_PRESETS   = ["warm", "aspirational", "grounded", "energetic", "serene", "bold", "intimate", "expansive", "minimal", "dramatic", "playful", "sophisticated"];

function ImagesEditor({ data, setData, openAssetPicker }: { 
  data: Partial<BrandImages>; 
  setData: (d: any) => void;
  openAssetPicker?: (cat: AssetCategory, onSelect: (url: string) => void) => void;
}) {
  const set = (key: string, val: any) => setData({ ...data, [key]: val });
  const heroImages = data.heroImages || [];
  const gallery    = data.galleryImages || [];
  const doDonts    = data.doDonts || [];

  return (
    <div className="space-y-5">
      <Accordion title="Photography Direction">
        <div className="space-y-4 pt-3">
          <div>
            <FieldLabel>Direction Headline</FieldLabel>
            <TextInput value={data.directionHeadline || ""} onChange={(v) => set("directionHeadline", v)} placeholder="e.g. Real People, Real Moments" />
          </div>
          <div>
            <FieldLabel hint="The visual philosophy behind how this brand uses photography">Direction Body</FieldLabel>
            <TextArea value={data.directionBody || ""} onChange={(v) => set("directionBody", v)} placeholder="Describe the overall photography philosophy, mood, and feel..." rows={4} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel hint="One sentence rule about colour processing">Colour Grading Note</FieldLabel>
              <TextInput value={data.colorGradingNote || ""} onChange={(v) => set("colorGradingNote", v)} placeholder="e.g. Always warm-toned. Avoid cool filters." />
            </div>
            <div>
              <FieldLabel hint="What should be in the frame">Subject Focus</FieldLabel>
              <TextInput value={data.subjectFocus || ""} onChange={(v) => set("subjectFocus", v)} placeholder="e.g. Human-centered. People in moments of focus." />
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Style Tags" defaultOpen={false}>
        <div className="space-y-4 pt-3">
          <div>
            <FieldLabel hint="Click to select, or type your own">Photography Style</FieldLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {PHOTOGRAPHY_STYLE_PRESETS.map((tag) => {
                const selected = (data.photographyStyle || []).includes(tag);
                return (
                  <button key={tag} onClick={() => {
                    const current = data.photographyStyle || [];
                    set("photographyStyle", selected ? current.filter((t) => t !== tag) : [...current, tag]);
                  }} className={cn("px-2.5 py-1.5 text-xs border transition-all",
                    selected ? "bg-[var(--hs-primary)] border-[var(--hs-primary)] text-white" : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                  )}>
                    {tag.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
            <TagInput tags={(data.photographyStyle || []).filter((t) => !PHOTOGRAPHY_STYLE_PRESETS.includes(t))} onChange={(custom) => set("photographyStyle", [...(data.photographyStyle || []).filter((t) => PHOTOGRAPHY_STYLE_PRESETS.includes(t)), ...custom])} placeholder="Add custom style tag..." />
          </div>
          <div>
            <FieldLabel>Mood Descriptors</FieldLabel>
            <div className="flex flex-wrap gap-2 mb-3">
              {MOOD_DESCRIPTOR_PRESETS.map((tag) => {
                const selected = (data.moodDescriptors || []).includes(tag);
                return (
                  <button key={tag} onClick={() => {
                    const current = data.moodDescriptors || [];
                    set("moodDescriptors", selected ? current.filter((t) => t !== tag) : [...current, tag]);
                  }} className={cn("px-2.5 py-1.5 text-xs border transition-all",
                    selected ? "bg-[var(--hs-accent)] border-[var(--hs-accent)] text-white" : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                  )}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion title="Hero Images" defaultOpen={false}>
        <div className="space-y-4 pt-3">
          {heroImages.map((img, i) => (
            <div key={i} className="border border-[var(--border-subtle)] p-3 space-y-3">
              <UploadZone 
                value={img.url || null} 
                onChange={(v) => { const u = [...heroImages]; u[i] = { ...img, url: v || "" }; set("heroImages", u); }} 
                height={160} 
                onLibraryClick={openAssetPicker ? () => openAssetPicker('photography', (url) => {
                  const u = [...heroImages];
                  u[i] = { ...img, url: url };
                  set("heroImages", u);
                }) : undefined}
              />
              <div className="grid grid-cols-2 gap-3">
                <div><FieldLabel>Caption</FieldLabel><TextInput value={img.caption || ""} onChange={(v) => { const u = [...heroImages]; u[i] = { ...img, caption: v }; set("heroImages", u); }} placeholder="Optional caption" /></div>
                <div><FieldLabel>Focal Label</FieldLabel><TextInput value={img.focalLabel || ""} onChange={(v) => { const u = [...heroImages]; u[i] = { ...img, focalLabel: v }; set("heroImages", u); }} placeholder="e.g. Campaign 2024" /></div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-tertiary)]">Tilt: {img.tiltDeg || 0}°</span>
                <input type="range" min={-5} max={5} step={0.5} value={img.tiltDeg || 0} onChange={(e) => { const u = [...heroImages]; u[i] = { ...img, tiltDeg: parseFloat(e.target.value) }; set("heroImages", u); }} className="flex-1 accent-[var(--hs-accent)]" />
                <button onClick={() => set("heroImages", heroImages.filter((_, j) => j !== i))} className="p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <button onClick={() => set("heroImages", [...heroImages, { url: "", filename: "", caption: "", tiltDeg: 0, focalLabel: null }])} className="flex items-center gap-1.5 text-sm text-[var(--hs-accent)] hover:opacity-75 transition-opacity">
            <Plus className="w-4 h-4" /> Add Hero Image
          </button>
        </div>
      </Accordion>

      <Accordion title="Gallery" defaultOpen={false}>
        <div className="space-y-3 pt-3">
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((img, i) => (
              <div key={i} className={cn("relative group", img.colSpan === 2 ? "col-span-2" : "col-span-1")}>
                <UploadZone 
                  value={img.url || null} 
                  onChange={(v) => { const u = [...gallery]; u[i] = { ...img, url: v || "" }; set("galleryImages", u); }} 
                  height={120} 
                  onLibraryClick={openAssetPicker ? () => openAssetPicker('photography', (url) => {
                    const u = [...gallery];
                    u[i] = { ...img, url: url };
                    set("galleryImages", u);
                  }) : undefined}
                />
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { const u = [...gallery]; u[i] = { ...img, colSpan: img.colSpan === 2 ? 1 : 2 }; set("galleryImages", u); }} className="p-1 bg-black/70 text-white text-xs">{img.colSpan === 2 ? "1×" : "2×"}</button>
                  <button onClick={() => set("galleryImages", gallery.filter((_, j) => j !== i))} className="p-1 bg-red-600 text-white"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => set("galleryImages", [...gallery, { url: "", alt: "", colSpan: 1 as const }])} className="flex items-center gap-1.5 text-sm text-[var(--hs-accent)] hover:opacity-75 transition-opacity">
            <Plus className="w-4 h-4" /> Add Gallery Image
          </button>
        </div>
      </Accordion>

      <Accordion title="Do's & Don'ts" defaultOpen={false}>
        <div className="space-y-3 pt-3">
          {doDonts.map((item, i) => (
            <div key={i} className="flex items-start gap-3 border border-[var(--border-subtle)] p-3">
              <div className={cn("w-1 flex-shrink-0 self-stretch", item.type === "do" ? "bg-emerald-500" : "bg-red-500")} />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <button onClick={() => { const u = [...doDonts]; u[i] = { ...item, type: "do" }; set("doDonts", u); }} className={cn("px-3 py-1.5 text-xs font-medium border", item.type === "do" ? "bg-emerald-600 text-white border-emerald-600" : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]")}>Do ✓</button>
                  <button onClick={() => { const u = [...doDonts]; u[i] = { ...item, type: "dont" }; set("doDonts", u); }} className={cn("px-3 py-1.5 text-xs font-medium border", item.type === "dont" ? "bg-red-600 text-white border-red-600" : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]")}>Don't ✗</button>
                </div>
                <UploadZone 
                  value={item.imageUrl || null} 
                  onChange={(v) => { const u = [...doDonts]; u[i] = { ...item, imageUrl: v || "" }; set("doDonts", u); }} 
                  height={100} 
                  onLibraryClick={openAssetPicker ? () => openAssetPicker('photography', (url) => {
                    const u = [...doDonts];
                    u[i] = { ...item, imageUrl: url };
                    set("doDonts", u);
                  }) : undefined}
                />
                <TextInput value={item.label} onChange={(v) => { const u = [...doDonts]; u[i] = { ...item, label: v }; set("doDonts", u); }} placeholder="Label this example..." />
              </div>
              <button onClick={() => set("doDonts", doDonts.filter((_, j) => j !== i))} className="p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => set("doDonts", [...doDonts, { type: "do" as const, label: "", imageUrl: "" }])} className="flex items-center gap-1.5 text-sm text-emerald-600 hover:opacity-75 transition-opacity"><Plus className="w-4 h-4" /> Add Do</button>
            <button onClick={() => set("doDonts", [...doDonts, { type: "dont" as const, label: "", imageUrl: "" }])} className="flex items-center gap-1.5 text-sm text-red-500 hover:opacity-75 transition-opacity"><Plus className="w-4 h-4" /> Add Don't</button>
          </div>
        </div>
      </Accordion>
    </div>
  );
}

// ─── 07 ICONS EDITOR ─────────────────────────────────────────────────────────

const ICON_STYLE_OPTIONS: { id: IconStyle; label: string; description: string }[] = [
  { id: "outline",   label: "Outline",   description: "Clean stroke-based" },
  { id: "filled",    label: "Filled",    description: "Solid shapes" },
  { id: "duotone",   label: "Duotone",   description: "Two-tone layered" },
  { id: "flat",      label: "Flat",      description: "Minimal, no depth" },
  { id: "custom",    label: "Custom",    description: "Bespoke system" },
];

function IconsEditor({ data, setData, openAssetPicker }: { 
  data: Partial<BrandIcons>; 
  setData: (d: any) => void;
  openAssetPicker?: (cat: AssetCategory, onSelect: (url: string) => void) => void;
}) {
  const set = (key: string, val: any) => setData({ ...data, [key]: val });
  const symbols  = data.productSymbols || [];
  const sizeGuide = data.sizeGuidelines || { minimumPx: 16, gridUnit: 24, preferredSizes: [16, 24, 32, 48] };

  return (
    <div className="space-y-5">
      <Accordion title="Icon System Rules">
        <div className="space-y-5 pt-3">
          <div>
            <FieldLabel hint="The visual style regime for all icons">Icon Style</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ICON_STYLE_OPTIONS.map(({ id, label, description }) => (
                <button key={id} onClick={() => set("iconStyle", data.iconStyle === id ? null : id)}
                  className={cn("p-3 border text-left transition-all",
                    data.iconStyle === id ? "border-[var(--hs-primary)] bg-[var(--hs-primary)] text-white" : "border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--surface-default)]"
                  )}>
                  <p className="font-medium text-xs">{label}</p>
                  <p className={cn("text-xs mt-0.5", data.iconStyle === id ? "text-white/70" : "text-[var(--text-tertiary)]")}>{description}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.iconStyle === "outline" && (
              <div>
                <FieldLabel hint="Stroke width in pixels">Stroke Weight</FieldLabel>
                <div className="space-y-2">
                  <input type="range" min={0.5} max={3} step={0.5} value={data.strokeWeight || 1.5} onChange={(e) => set("strokeWeight", parseFloat(e.target.value))} className="w-full accent-[var(--hs-accent)]" />
                  <p className="text-xs text-[var(--text-secondary)] font-mono">{data.strokeWeight || 1.5}px stroke</p>
                </div>
              </div>
            )}
            <div>
              <FieldLabel>Corner Radius</FieldLabel>
              <TextInput value={data.cornerRadius || ""} onChange={(v) => set("cornerRadius", v)} placeholder="e.g. Sharp corners, or 2px radius" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><FieldLabel>Min Size</FieldLabel><NumberInput value={sizeGuide.minimumPx} onChange={(v) => set("sizeGuidelines", { ...sizeGuide, minimumPx: v })} min={8} unit="px" /></div>
            <div><FieldLabel>Grid Unit</FieldLabel><NumberInput value={sizeGuide.gridUnit} onChange={(v) => set("sizeGuidelines", { ...sizeGuide, gridUnit: v })} min={8} unit="px" /></div>
            <div>
              <FieldLabel>Preferred Sizes</FieldLabel>
              <TextInput value={(sizeGuide.preferredSizes || []).join(", ")} onChange={(v) => set("sizeGuidelines", { ...sizeGuide, preferredSizes: v.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)) })} placeholder="16, 24, 32, 48" />
            </div>
          </div>
          <div>
            <FieldLabel>Section Description</FieldLabel>
            <TextArea value={data.sectionDescription || ""} onChange={(v) => set("sectionDescription", v)} placeholder="Describe the icon system, how it should be used, and why these choices were made..." rows={3} />
          </div>
        </div>
      </Accordion>

      <Accordion title="Product Symbols" defaultOpen={false}>
        <div className="space-y-3 pt-3">
          <p className="text-xs text-[var(--text-tertiary)]">Upload custom icons/symbols unique to this brand. Each symbol should have three variants: original, black, and white.</p>
          {symbols.map((sym, i) => (
            <div key={i} className="border border-[var(--border-subtle)] p-3 space-y-3">
              <div className="flex items-center justify-between">
                <TextInput value={sym.name || ""} onChange={(v) => { const u = [...symbols]; u[i] = { ...sym, name: v }; set("productSymbols", u); }} placeholder="Symbol name" className="max-w-xs" />
                <button onClick={() => set("productSymbols", symbols.filter((_, j) => j !== i))} className="p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><FieldLabel>Original</FieldLabel><UploadZone value={sym.originalUrl || null} onChange={(v) => { const u = [...symbols]; u[i] = { ...sym, originalUrl: v || "" }; set("productSymbols", u); }} height={80} onLibraryClick={openAssetPicker ? () => openAssetPicker('brand_icons', (url) => { const u = [...symbols]; u[i] = { ...sym, originalUrl: url }; set("productSymbols", u); }) : undefined} /></div>
                <div style={{ background: "#111" }}><FieldLabel>Black Version</FieldLabel><UploadZone value={sym.blackUrl || null} onChange={(v) => { const u = [...symbols]; u[i] = { ...sym, blackUrl: v || "" }; set("productSymbols", u); }} height={80} onLibraryClick={openAssetPicker ? () => openAssetPicker('brand_icons', (url) => { const u = [...symbols]; u[i] = { ...sym, blackUrl: url }; set("productSymbols", u); }) : undefined} /></div>
                <div style={{ background: "#000" }}><FieldLabel>White Version</FieldLabel><UploadZone value={sym.whiteUrl || null} onChange={(v) => { const u = [...symbols]; u[i] = { ...sym, whiteUrl: v || "" }; set("productSymbols", u); }} height={80} onLibraryClick={openAssetPicker ? () => openAssetPicker('brand_icons', (url) => { const u = [...symbols]; u[i] = { ...sym, whiteUrl: url }; set("productSymbols", u); }) : undefined} /></div>
              </div>
            </div>
          ))}
          <button onClick={() => set("productSymbols", [...symbols, { name: "", originalUrl: "", blackUrl: "", whiteUrl: "", svgInline: null }])} className="flex items-center gap-1.5 text-sm text-[var(--hs-accent)] hover:opacity-75 transition-opacity">
            <Plus className="w-4 h-4" /> Add Symbol
          </button>
        </div>
      </Accordion>

      <Accordion title="Icon Library" defaultOpen={false}>
        <div className="space-y-4 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><FieldLabel>Library Name</FieldLabel><TextInput value={data.iconLibraryName || ""} onChange={(v) => set("iconLibraryName", v)} placeholder="e.g. Lucide, Phosphor, Feather" /></div>
            <div>
              <FieldLabel>Library URL</FieldLabel>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input type="url" value={data.iconLibraryUrl || ""} onChange={(e) => set("iconLibraryUrl", e.target.value)} placeholder="https://lucide.dev"
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm focus:outline-none focus:border-[var(--hs-accent)] placeholder:italic placeholder:text-[var(--text-muted)]" />
              </div>
            </div>
          </div>
          <div><FieldLabel>Library Description</FieldLabel><TextArea value={data.iconLibraryDescription || ""} onChange={(v) => set("iconLibraryDescription", v)} placeholder="Describe how this library should be used..." rows={3} /></div>
          <div><FieldLabel hint="Upload a preview showing the icon set">Library Preview</FieldLabel><UploadZone value={data.iconLibraryPreviewUrl || null} onChange={(v) => set("iconLibraryPreviewUrl", v)} height={120} onLibraryClick={openAssetPicker ? () => openAssetPicker('brand_icons', (url) => set("iconLibraryPreviewUrl", url)) : undefined} /></div>
        </div>
      </Accordion>
    </div>
  );
}

// ─── 08 RESOURCES EDITOR ─────────────────────────────────────────────────────

const FILE_TYPE_OPTIONS = [
  { value: "logo_suite",    label: "Logo Suite",    icon: "🎨" },
  { value: "typeface",      label: "Typeface",      icon: "Aa" },
  { value: "image_set",     label: "Image Set",     icon: "🖼" },
  { value: "icon_library",  label: "Icon Library",  icon: "◻" },
  { value: "template",      label: "Template",      icon: "📄" },
  { value: "guide",         label: "Guide / PDF",   icon: "📋" },
  { value: "other",         label: "Other",         icon: "📦" },
];

function ResourceCard({ resource, onChange, onRemove, openAssetPicker }: {
  resource: Partial<BrandResource>; onChange: (r: Partial<BrandResource>) => void; onRemove: () => void;
  openAssetPicker?: (cat: AssetCategory, onSelect: (url: string) => void) => void;
}) {
  const set = (key: string, val: any) => onChange({ ...resource, [key]: val });
  return (
    <div className="border border-[var(--border-subtle)] overflow-hidden">
      <div className="grid grid-cols-[100px_1fr] gap-0 sm:grid-cols-[120px_1fr]">
        <div className="border-r border-[var(--border-subtle)]">
          <UploadZone 
            value={resource.thumbnailUrl || null} 
            onChange={(v) => set("thumbnailUrl", v)} 
            height={130} 
            onLibraryClick={openAssetPicker ? () => openAssetPicker('brand_resources', (url) => set("thumbnailUrl", url)) : undefined}
          />
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1"><TextInput value={resource.label || ""} onChange={(v) => set("label", v)} placeholder="Resource name (e.g. Full Logo Suite)" /></div>
            <button onClick={onRemove} className="p-1.5 text-[var(--text-tertiary)] hover:text-red-500 transition-colors flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
          </div>
          <TextArea value={resource.description || ""} onChange={(v) => set("description", v)} placeholder="Describe what's included..." rows={2} />
          <SelectField value={resource.fileType || ""} onChange={(v) => set("fileType", v)} placeholder="File type" options={FILE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: `${o.icon} ${o.label}` }))} />
          <div className="relative group">
            <Download className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input type="url" value={resource.fileUrl || ""} onChange={(e) => set("fileUrl", e.target.value)} placeholder="https://..."
              className="w-full pl-9 pr-12 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-default)] text-sm focus:outline-none focus:border-[var(--hs-accent)] placeholder:italic placeholder:text-[var(--text-muted)]" />
            {openAssetPicker && (
              <button 
                onClick={() => openAssetPicker('brand_resources', (url) => set("fileUrl", url))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--hs-accent)] transition-colors"
                title="Select from Library"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourcesEditor({ data, setData, openAssetPicker }: { 
  data: { resources?: Partial<BrandResource>[] }; 
  setData: (d: any) => void;
  openAssetPicker?: (cat: AssetCategory, onSelect: (url: string) => void) => void;
}) {
  const resources = data.resources || [];
  const addResource    = () => setData({ ...data, resources: [...resources, { id: String(Date.now()), label: "", sortOrder: resources.length }] });
  const removeResource = (i: number) => setData({ ...data, resources: resources.filter((_, j) => j !== i) });
  const updateResource = (i: number, updated: Partial<BrandResource>) => { const next = [...resources]; next[i] = updated; setData({ ...data, resources: next }); };

  return (
    <div className="space-y-4">
      {resources.length === 0 && (
        <div className="border border-dashed border-[var(--border-strong)] p-8 text-center">
          <Download className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-secondary)]">No resources added yet</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Add logo suites, font files, template packs, and guides</p>
        </div>
      )}
      {resources.map((res, i) => (
        <ResourceCard 
          key={res.id || i} 
          resource={res} 
          onChange={(updated) => updateResource(i, updated)} 
          onRemove={() => removeResource(i)} 
          openAssetPicker={openAssetPicker}
        />
      ))}
      <button onClick={addResource} className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[var(--border-strong)] text-sm text-[var(--text-secondary)] hover:border-[var(--hs-accent)] hover:text-[var(--hs-accent)] transition-colors">
        <Plus className="w-4 h-4" /> Add Resource
      </button>
    </div>
  );
}

// ─── 09 VOICE & TONE EDITOR ──────────────────────────────────────────────────

function VoiceToneEditor({ data, setData }: { data: Partial<BrandStrategy>; setData: (d: any) => void }) {
  const set = (key: string, val: any) => setData({ ...data, [key]: val });
  const tov         = data.toneOfVoice || { descriptors: [], dos: [], donts: [] };
  const personality = data.brandPersonality || { archetype: null, adjectives: [], antiAdjectives: [] };

  return (
    <div className="space-y-5">
      <Accordion title="Voice Descriptors">
        <div className="pt-3">
          <FieldLabel hint="3–5 adjectives that define the brand's core voice">Voice Descriptors</FieldLabel>
          <TagInput tags={tov.descriptors} onChange={(v) => set("toneOfVoice", { ...tov, descriptors: v })} placeholder="e.g. Bold, Warm, Precise" />
        </div>
      </Accordion>

      <Accordion title="We Say / We Never Say">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3">
          <div>
            <FieldLabel hint="Example phrases, principles, language patterns we embrace">We Say ✓</FieldLabel>
            <TagInput tags={tov.dos} onChange={(v) => set("toneOfVoice", { ...tov, dos: v })} placeholder="e.g. Let's figure it out together" />
          </div>
          <div>
            <FieldLabel hint="Language, phrases, or patterns we explicitly avoid">We Never Say ✗</FieldLabel>
            <TagInput tags={tov.donts} onChange={(v) => set("toneOfVoice", { ...tov, donts: v })} placeholder="e.g. Synergize our core competencies" />
          </div>
        </div>
      </Accordion>

      <Accordion title="Brand Personality" defaultOpen={false}>
        <div className="space-y-5 pt-3">
          <div>
            <FieldLabel hint="Select the archetype that best captures the brand's character">Brand Archetype</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ARCHETYPES.map(({ id, description }) => (
                <button key={id}
                  onClick={() => set("brandPersonality", { ...personality, archetype: personality.archetype === id ? null : id })}
                  className={cn("p-3 border text-left transition-all",
                    personality.archetype === id ? "border-[var(--hs-primary)] bg-[var(--hs-primary)] text-white" : "border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--surface-default)]"
                  )}>
                  <p className="font-medium text-sm">{id}</p>
                  <p className={cn("text-xs mt-0.5", personality.archetype === id ? "text-white/70" : "text-[var(--text-tertiary)]")}>{description}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div><FieldLabel hint="Adjectives that describe the brand">Brand Is</FieldLabel><TagInput tags={personality.adjectives} onChange={(v) => set("brandPersonality", { ...personality, adjectives: v })} placeholder="e.g. Bold, Refined, Warm" /></div>
            <div><FieldLabel hint="Adjectives the brand explicitly avoids">Brand Is Never</FieldLabel><TagInput tags={personality.antiAdjectives} onChange={(v) => set("brandPersonality", { ...personality, antiAdjectives: v })} placeholder="e.g. Arrogant, Loud, Generic" /></div>
          </div>
        </div>
      </Accordion>
    </div>
  );
}

// ─── 10 MESSAGING EDITOR ─────────────────────────────────────────────────────

function MessagingEditor({ data, setData }: { data: Partial<BrandStrategy>; setData: (d: any) => void }) {
  const set = (key: string, val: any) => setData({ ...data, [key]: val });
  const msg    = data.messaging || { headline: null, taglines: [], keyMessages: [], ctaGuidelines: null };
  const setMsg = (k: string, v: any) => set("messaging", { ...msg, [k]: v });

  return (
    <div className="space-y-5">
      <Accordion title="Brand Headline">
        <div className="pt-3">
          <FieldLabel hint="The single most powerful line that encapsulates the brand">Primary Headline</FieldLabel>
          <TextInput value={msg.headline || ""} onChange={(v) => setMsg("headline", v)} placeholder="e.g. Architecture as enduring expression" />
        </div>
      </Accordion>

      <Accordion title="Taglines">
        <div className="pt-3">
          <FieldLabel hint="Alternative taglines for different contexts">Tagline Variants</FieldLabel>
          <TagInput tags={msg.taglines} onChange={(v) => setMsg("taglines", v)} placeholder="e.g. Built to last" />
        </div>
      </Accordion>

      <Accordion title="Key Messages" defaultOpen={false}>
        <div className="pt-3">
          <FieldLabel hint="Core statements the brand returns to across all channels">Key Messages</FieldLabel>
          <div className="space-y-3">
            {(msg.keyMessages || []).map((m: string, i: number) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-xs font-mono text-[var(--hs-accent)] mt-3 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <TextInput value={m} onChange={(v) => { const next = [...(msg.keyMessages || [])]; next[i] = v; setMsg("keyMessages", next); }} placeholder="Core message..." />
                <button onClick={() => setMsg("keyMessages", (msg.keyMessages || []).filter((_: string, j: number) => j !== i))} className="p-2 text-[var(--text-tertiary)] hover:text-red-500 transition-colors mt-0.5"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => setMsg("keyMessages", [...(msg.keyMessages || []), ""])} className="flex items-center gap-1.5 text-sm text-[var(--hs-accent)] hover:opacity-75 transition-opacity">
              <Plus className="w-4 h-4" /> Add Key Message
            </button>
          </div>
        </div>
      </Accordion>

      <Accordion title="CTA Guidelines" defaultOpen={false}>
        <div className="pt-3">
          <FieldLabel hint="How calls-to-action should be written — tone, style, approach">CTA Writing Guidelines</FieldLabel>
          <TextArea value={msg.ctaGuidelines || ""} onChange={(v) => setMsg("ctaGuidelines", v)} placeholder="e.g. Calm, confident invitation — never pushy. CTA is always an offer, never a demand." rows={4} />
        </div>
      </Accordion>
    </div>
  );
}

// ─── Editor Registry ──────────────────────────────────────────────────────────

const sectionEditors: Record<SupabaseSectionType, React.FC<{ 
  data: any; 
  setData: (d: any) => void;
  openAssetPicker?: (category: AssetCategory, onSelect: (url: string) => void) => void;
}>> = {
  introduction:  IntroductionEditor,
  strategy:      StrategyEditor,
  logo:          LogoEditor,
  color_palette: ColorEditor,
  typography:    TypographyEditor,
  photography:   ImagesEditor,
  voice_tone:    VoiceToneEditor,
  messaging:     MessagingEditor,
  icons:         IconsEditor,
  resources:     ResourcesEditor,
};

// ─── Completion Score ─────────────────────────────────────────────────────────

function sectionCompletion(id: SupabaseSectionType, data: any): number {
  if (!data || Object.keys(data).length === 0) return 0;
  const checks: Record<SupabaseSectionType, () => boolean> = {
    introduction:  () => !!(data.tagline && data.brandDescription && data.coverImageUrl),
    strategy:      () => !!(data.mission && data.vision && data.toneOfVoice?.descriptors?.length),
    logo:          () => !!(data.logos?.length > 0 && data.logos[0]?.variants?.some((v: any) => v.fileUrl)),
    color_palette: () => !!(data.colors?.length > 0),
    typography:    () => !!(data.fonts?.length > 0 && data.fonts[0]?.fontName),
    photography:   () => !!(data.directionBody && data.heroImages?.length > 0),
    voice_tone:    () => !!(data.toneOfVoice?.descriptors?.length > 0),
    messaging:     () => !!(data.messaging?.headline || data.messaging?.keyMessages?.length > 0),
    icons:         () => !!(data.iconStyle || data.iconLibraryName || data.productSymbols?.length > 0),
    resources:     () => !!(data.resources?.length > 0),
  };
  return checks[id]() ? 100 : (data && Object.values(data).some(Boolean)) ? 50 : 0;
}

// ─── Main BrandDocument Component ────────────────────────────────────────────

export function BrandDocument() {
  const { project } = useOutletContext<OverviewContext>();
  const [activeSection, setActiveSection] = useState<SupabaseSectionType>("introduction");
  const [showSettings, setShowSettings]   = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(false);  // mobile drawer
  const [sectionData, setSectionData]     = useState<Record<string, any>>({});
  const [pickerConfig, setPickerConfig]   = useState<{
    isOpen: boolean;
    category?: AssetCategory;
    onSelect?: (url: string) => void;
  }>({ isOpen: false });

  const { setUnsavedChanges, unsavedChanges } = useDocumentEditorStore();
  const { showToast } = useUIStore();
  const { brandSections, updateProjectSection, publishProject, saveIndicator } = useProjectsStore();

  // Initialize sectionData from store
  useEffect(() => {
    if (!project?.id) return;
    const initialData: Record<string, unknown> = {};
    sections.forEach((s) => {
      const key = `${project.id}-${s.id}`;
      const sectionArr = brandSections[key];
      // brandSections[key] is BrandSection[] — take the first element's content
      if (sectionArr && sectionArr.length > 0) {
        initialData[s.id] = (sectionArr[0] as { content?: unknown }).content ?? {};
      }
    });
    setSectionData((prev) => ({ ...initialData, ...prev }));
  }, [project?.id, brandSections]);

  // handleSave — declared BEFORE the useEffect that references it
  const handleSave = useCallback(async () => {
    if (!project?.id) return;
    try {
      // Capture currentData at call-time via functional update path
      const snapshot = sectionData[activeSection] || {};
      await updateProjectSection(project.id, activeSection, snapshot);
      setUnsavedChanges(false);
    } catch {
      showToast("Save failed — please try again", "error");
    }
  }, [project?.id, activeSection, sectionData, updateProjectSection, setUnsavedChanges, showToast]);

  // Auto-save debounce
  useEffect(() => {
    if (!unsavedChanges) return;
    const t = setTimeout(handleSave, 2000);
    return () => clearTimeout(t);
  }, [unsavedChanges, handleSave]);

  const currentData       = sectionData[activeSection] ?? {};
  const ActiveEditor      = sectionEditors[activeSection];
  const activeSectionMeta = sections.find((s) => s.id === activeSection);

  const handleEditorDataChange = (data: Record<string, unknown>) => {
    setSectionData((prev) => ({ ...prev, [activeSection]: data }));
    setUnsavedChanges(true);
  };

  const handlePublish = async () => {
    const logoData  = sectionData.logo  as { logos?:  unknown[] } | undefined;
    const colorData = sectionData.color_palette as { colors?: unknown[] } | undefined;
    const introData = sectionData.introduction  as { tagline?: string }   | undefined;
    const hasLogo  = (logoData?.logos?.length  ?? 0) > 0;
    const hasColor = (colorData?.colors?.length ?? 0) > 0;
    const hasIntro = !!introData?.tagline;
    if (!hasLogo)  { showToast("Add at least one logo before publishing", "error"); return; }
    if (!hasColor) { showToast("Add at least one colour before publishing", "error"); return; }
    if (!hasIntro) { showToast("Add a tagline before publishing", "error"); return; }
    try {
      if (project?.id) await publishProject(project.id);
    } catch {
      showToast("Publishing failed — please try again", "error");
    }
  };

  const completedCount = sections.filter((s) => sectionCompletion(s.id, sectionData[s.id]) === 100).length;
  const completionPct  = Math.round((completedCount / sections.length) * 100);


  return (
    /**
     * Responsive layout strategy:
     * - Mobile  (<md): sidebar as fixed drawer overlay, triggered by hamburger
     * - Tablet  (md):  sidebar collapses to icon-only strip (w-14)
     * - Desktop (lg+): full w-60 sidebar always visible
     */
    <div className="flex h-[calc(100vh-var(--studio-topbar-height,64px))] min-h-[500px] relative">

      {/* ── Mobile sidebar overlay backdrop ─────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Left Navigation Sidebar ──────────────────────────────────────────── */}
      {/*
        Mobile: fixed off-canvas drawer (z-50)
        md: inline collapsed icon-strip
        lg: full sidebar
      */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          // Base
          "bg-[var(--surface-default)] border-r border-[var(--border-subtle)] flex-col flex-shrink-0 flex",
          // Mobile: off-canvas drawer
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 md:static md:z-auto md:translate-x-0 md:inset-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Responsive widths
          "md:w-14 lg:w-60"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between lg:px-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] hidden lg:block">Sections</span>
          <button onClick={() => setShowSettings(!showSettings)} className={cn("p-1.5 transition-colors flex-shrink-0", showSettings ? "text-[var(--hs-accent)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]")}>
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-auto py-2">
          {sections.map((section) => {
            const Icon       = section.icon;
            const isActive   = activeSection === section.id;
            const data       = sectionData[section.id];
            const completion = sectionCompletion(section.id, data);

            return (
              <button
                key={section.id}
                onClick={() => { setActiveSection(section.id); setSidebarOpen(false); }}
                title={section.label}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group",
                  isActive ? "bg-[var(--hs-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {/* Label: visible on mobile drawer + lg desktop */}
                <div className="flex-1 min-w-0 md:hidden lg:block">
                  <p className="text-sm font-medium truncate">{section.label}</p>
                  {!isActive && <p className="text-xs truncate text-[var(--text-tertiary)]">{section.description}</p>}
                </div>
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0 md:hidden lg:block",
                  completion === 100 ? (isActive ? "bg-emerald-300" : "bg-emerald-500") :
                  completion === 50  ? (isActive ? "bg-amber-300"   : "bg-amber-400")   : "bg-transparent"
                )} />
              </button>
            );
          })}
        </nav>

        {/* Completion Progress */}
        <div className="p-3 border-t border-[var(--border-subtle)] md:hidden lg:block">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--text-tertiary)]">Document</span>
            <span className="text-xs font-medium text-[var(--text-primary)]">{completionPct}%</span>
          </div>
          <div className="h-1 bg-[var(--border-subtle)] overflow-hidden">
            <motion.div className="h-full bg-[var(--hs-accent)]" animate={{ width: `${completionPct}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
      </motion.aside>

      {/* ── Main Editor Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)] overflow-hidden">

        {/* Editor Topbar */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 bg-[var(--surface-default)] border-b border-[var(--border-subtle)] flex-shrink-0 gap-2">
          {/* Left: hamburger (mobile) + breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Hamburger — mobile + md only */}
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors lg:hidden flex-shrink-0">
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider hidden sm:block">Document</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] hidden sm:block" />
            <span className="font-semibold text-sm text-[var(--text-primary)] truncate">{activeSectionMeta?.label}</span>
            {/* Save indicator */}
            {saveIndicator === "saving" ? (
              <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] italic ml-2 flex-shrink-0">
                <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
              </span>
            ) : saveIndicator === "saved" ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 ml-2 flex-shrink-0">
                <Check className="w-3 h-3" /> Saved
              </span>
            ) : unsavedChanges ? (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 ml-2 flex-shrink-0 hidden sm:block">Unsaved</span>
            ) : null}
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleSave} disabled={!unsavedChanges}
              className={cn("flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--border-default)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors",
                !unsavedChanges && "opacity-40 cursor-not-allowed"
              )}>
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Save</span>
            </button>
            <button onClick={handlePublish} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[var(--hs-primary)] text-white hover:opacity-90 transition-opacity">
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Publish</span>
            </button>
          </div>
        </div>

        {/* Section Description Banner */}
        {activeSectionMeta && (
          <div className="px-5 py-2 bg-[var(--surface-subtle)] border-b border-[var(--border-subtle)] flex-shrink-0 hidden sm:block">
            <p className="text-xs text-[var(--text-tertiary)]">{activeSectionMeta.description}</p>
          </div>
        )}

        {/* Editor Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "mx-auto",
                // Colour and Typography get wider canvas
                activeSection === "color_palette" || activeSection === "typography"
                  ? "max-w-5xl"
                  : "max-w-3xl"
              )}
            >
              <ActiveEditor 
                data={currentData} 
                setData={handleEditorDataChange} 
                openAssetPicker={(cat, onSelect) => setPickerConfig({ isOpen: true, category: cat, onSelect })}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Asset Picker */}
        {project?.id && (
          <AssetPickerModal
            isOpen={pickerConfig.isOpen}
            projectId={project.id}
            categoryFilter={pickerConfig.category}
            onClose={() => setPickerConfig({ ...pickerConfig, isOpen: false })}
            onSelect={(asset) => {
              if (pickerConfig.onSelect) pickerConfig.onSelect(asset.fileUrl);
              setPickerConfig({ ...pickerConfig, isOpen: false });
            }}
          />
        )}
      </div>

      {/* ── Settings Panel ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="w-56 bg-[var(--surface-default)] border-l border-[var(--border-subtle)] flex-shrink-0 flex-col hidden sm:flex"
          >
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">Section Config</span>
              <button onClick={() => setShowSettings(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-5">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)] mb-3">{activeSectionMeta?.label}</p>
                <div className="space-y-3">
                  {[["Enabled", true], ["Locked", false], ["Auto-approve", false]].map(([label, defaultChecked]) => (
                    <label key={label as string} className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-[var(--text-secondary)]">{label as string}</span>
                      <input type="checkbox" defaultChecked={defaultChecked as boolean} className="w-4 h-4 accent-[var(--hs-accent)]" />
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t border-[var(--border-subtle)] pt-4">
                <p className="text-xs font-medium text-[var(--text-primary)] mb-2">Custom Label</p>
                <TextInput value="" onChange={() => {}} placeholder={activeSectionMeta?.label} />
                <p className="text-xs text-[var(--text-tertiary)] mt-1.5">Overrides the section name shown to clients</p>
              </div>
              <div className="border-t border-[var(--border-subtle)] pt-4">
                <p className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                  <AlertCircle className="w-3.5 h-3.5" /> Changes apply to portal visibility
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
