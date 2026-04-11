// ═══════════════════════════════════════════════════════════════════════════════
// HeritageStone Studio — Type Definitions (Upgraded)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Enums & Unions ───────────────────────────────────────────────────────────

export type ProjectStatus = "draft" | "active" | "live" | "archived";
export type PortalTemplate = "meridian";
export type PermissionLevel = "full" | "designer" | "copywriter" | "marketing" | "executive";
export type ApprovalStatus = "pending" | "approved" | "revision_requested" | "locked";
export type AssetCategory = "logo" | "brand_logos" | "color" | "typography" | "photography" | "document" | "guidelines" | "icons" | "brand_icons" | "brand_resources" | "other";
export type MemberRole = "owner" | "admin" | "designer" | "strategist" | "copywriter" | "viewer";
export type PortalView = "brand" | "assets" | "changelog" | "requests" | "team";

export type SupabaseSectionType =
  | "introduction"
  | "strategy"
  | "logo"
  | "color_palette"
  | "typography"
  | "photography"
  | "voice_tone"
  | "messaging"
  | "icons"
  | "resources";

export type ActivityEventType =
  | "project_created"
  | "project_deleted"
  | "section_approved"
  | "section_revised"
  | "section_updated"
  | "asset_uploaded"
  | "asset_deleted"
  | "member_invited"
  | "member_removed"
  | "portal_published"
  | "chat_message"
  | "brand_request_submitted";

// Legacy section keys (for old BrandDocumentTab)
export type SectionKey =
  | "brand_purpose"
  | "brand_vision"
  | "brand_values"
  | "brand_promise"
  | "positioning"
  | "logo"
  | "color_palette"
  | "typography"
  | "photography"
  | "voice_tone"
  | "messaging"
  | "digital_applications"
  | "brand_governance";

export type ChapterKey =
  | "foundation"
  | "identity_system"
  | "expression"
  | "application"
  | "governance";

// ─── Legacy Chapter/Section Mappings (PRESERVED) ─────────────────────────────

export const CHAPTER_SECTIONS: Record<ChapterKey, SectionKey[]> = {
  foundation: ["brand_purpose", "brand_vision", "brand_values", "brand_promise", "positioning"],
  identity_system: ["logo", "color_palette", "typography", "photography"],
  expression: ["voice_tone", "messaging"],
  application: ["digital_applications"],
  governance: ["brand_governance"],
};

export const CHAPTER_LABELS: Record<ChapterKey, string> = {
  foundation: "Foundation",
  identity_system: "Identity System",
  expression: "Expression",
  application: "Application",
  governance: "Governance",
};

export const SECTION_LABELS: Record<SectionKey, string> = {
  brand_purpose: "Brand Purpose",
  brand_vision: "Brand Vision",
  brand_values: "Brand Values",
  brand_promise: "Brand Promise",
  positioning: "Positioning",
  logo: "Logo",
  color_palette: "Color Palette",
  typography: "Typography",
  photography: "Photography",
  voice_tone: "Voice & Tone",
  messaging: "Messaging",
  digital_applications: "Digital Applications",
  brand_governance: "Brand Governance",
};

// ─── Supabase Database Types ──────────────────────────────────────────────────

export interface Brand {
  id: string;
  slug: string;
  brandName: string;
  templateId: string;
  version: string;
  updatedDate: string;
  isPublished: boolean;
  sourceProjectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  componentName: string;
  description: string | null;
  previewUrl: string | null;
  sectionsSupported: SupabaseSectionType[];
}

export interface BrandSectionConfig {
  id: string;
  brandId: string;
  sectionType: SupabaseSectionType;
  isEnabled: boolean;
  sortOrder: number;
  customLabel: string | null;
}

// ─── Introduction ─────────────────────────────────────────────────────────────

export interface BrandMessaging {
  headline: string | null;
  taglines: string[];
  keyMessages: string[];
  ctaGuidelines: string | null;
}

export interface BrandIntroduction {
  brandId: string;
  tagline: string | null;
  taglineSize: "small" | "medium" | "large" | "editorial" | null;
  brandDescription: string | null;
  coverImageUrl: string | null;
  coverVideoUrl: string | null;
  brandMarkUrl: string | null;
  foundedYear: number | null;
  industry: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  socialLinks: { platform: string; url: string }[] | null;
}

// ─── Strategy ────────────────────────────────────────────────────────────────

export type BrandArchetype =
  | "Hero"
  | "Creator"
  | "Sage"
  | "Explorer"
  | "Ruler"
  | "Caregiver"
  | "Innocent"
  | "Jester"
  | "Lover"
  | "Rebel"
  | "Everyman"
  | "Magician";

export interface ToneOfVoice {
  descriptors: string[];
  dos: string[];
  donts: string[];
}

export interface BrandPersonality {
  archetype: BrandArchetype | null;
  adjectives: string[];
  antiAdjectives: string[];
}

export interface TargetAudience {
  primary: {
    description: string;
    ageRange: string;
    behaviors: string;
  };
  secondary: {
    description: string;
  } | null;
}

export interface BrandStrategy {
  brandId: string;
  mission: string | null;
  vision: string | null;
  positioningStatement: string | null;
  storyHeadline: string | null;
  storyBody: string | null;
  storyImages: string[] | null;
  values: { name: string; description: string; imageUrl: string | null }[] | null;
  toneOfVoice: ToneOfVoice | null;
  brandPersonality: BrandPersonality | null;
  targetAudience: TargetAudience | null;
  messaging: BrandMessaging | null;
}

// ─── Logo ────────────────────────────────────────────────────────────────────

export type LogoVariantType = "full_color" | "reversed" | "monochrome" | "outline";

export interface LogoVariant {
  variantType: LogoVariantType;
  fileUrl: string | null;
  downloadUrl: string | null;
  previewBgColor: string;
}

export interface LogoClearSpace {
  unit: "x-height" | "fixed_px";
  value: number;
  description: string;
  diagramUrl: string | null;
}

export interface LogoMisuseExample {
  imageUrl: string;
  label: string;
}

export interface BrandLogo {
  id: string;
  brandId: string;
  label: string;
  description: string | null;
  usageNotes: string | null;
  usageNotesDonts: string | null;
  fileUrl: string | null;
  downloadUrl: string | null;
  previewBgColor: string | null;
  minSizePx: number | null;
  safeFormats: string[] | null;
  variants: LogoVariant[] | null;
  clearSpace: LogoClearSpace | null;
  misuseExamples: LogoMisuseExample[] | null;
  sortOrder: number;
}

// ─── Typography ──────────────────────────────────────────────────────────────

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface TypeScaleEntry {
  size: string;
  weight: number;
  lineHeight: string;
  letterSpacing?: string;
  case?: "sentence" | "uppercase" | "lowercase" | "capitalize";
}

export interface BrandTypography {
  id: string;
  brandId: string;
  fontName: string;
  fontRole: "display" | "body" | "accent" | "mono";
  fontSourceUrl: string | null;
  fontFileUrl: string | null;
  weights: FontWeight[] | null;
  specimenText: string | null;
  previewSentence: string | null;
  description: string | null;
  usageContext: string | null;
  fallbackStack: string | null;
  pairingNote: string | null;
  typeScale: {
    display?: TypeScaleEntry;
    h1?: TypeScaleEntry;
    h2?: TypeScaleEntry;
    h3?: TypeScaleEntry;
    h4?: TypeScaleEntry;
    h5?: TypeScaleEntry;
    h6?: TypeScaleEntry;
    subtitle1?: TypeScaleEntry;
    subtitle2?: TypeScaleEntry;
    body1?: TypeScaleEntry;
    body2?: TypeScaleEntry;
    caption?: TypeScaleEntry;
    overline?: TypeScaleEntry;
    button?: TypeScaleEntry;
  } | null;
  sortOrder: number;
}

// ─── Color ───────────────────────────────────────────────────────────────────

export type ColorUsageRole =
  | "background"
  | "text"
  | "cta"
  | "accent"
  | "border"
  | "surface"
  | "general";

export type AccessibilityLevel = "AA" | "AAA" | "decorative";

export interface BrandColor {
  id: string;
  brandId: string;
  paletteType: "primary" | "secondary" | "neutral";
  colorName: string;
  hex: string;
  rgb: string | null;
  cmyk: string | null;
  pantone: string | null;
  description: string | null;
  usageRole: ColorUsageRole | null;
  onColor: string | null;
  accessibilityLevel: AccessibilityLevel | null;
  isPrimary: boolean;
  sortOrder: number;
}

// ─── Images ──────────────────────────────────────────────────────────────────

export interface BrandImages {
  brandId: string;
  directionHeadline: string | null;
  directionBody: string | null;
  photographyStyle: string[] | null;
  moodDescriptors: string[] | null;
  colorGradingNote: string | null;
  subjectFocus: string | null;
  heroImages: {
    url: string;
    filename: string;
    caption: string;
    tiltDeg: number;
    focalLabel: string | null;
  }[] | null;
  galleryImages: { url: string; alt: string; colSpan: 1 | 2 }[] | null;
  doDonts: { type: "do" | "dont"; label: string; imageUrl: string }[] | null;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

export type IconStyle = "outline" | "filled" | "duotone" | "flat" | "custom";

export interface IconSizeGuidelines {
  minimumPx: number;
  gridUnit: number;
  preferredSizes: number[];
}

export interface BrandIcons {
  brandId: string;
  sectionDescription: string | null;
  iconStyle: IconStyle | null;
  strokeWeight: number | null;
  cornerRadius: string | null;
  sizeGuidelines: IconSizeGuidelines | null;
  productSymbols: {
    name: string;
    originalUrl: string;
    blackUrl: string;
    whiteUrl: string;
    svgInline: string | null;
  }[] | null;
  iconLibraryName: string | null;
  iconLibraryDescription: string | null;
  iconLibraryUrl: string | null;
  iconLibraryPreviewUrl: string | null;
  downloadAllUrl: string | null;
}

// ─── Resources ───────────────────────────────────────────────────────────────

export interface BrandResource {
  id: string;
  brandId: string;
  label: string;
  description: string | null;
  fileUrl: string;
  fileType: "logo_suite" | "typeface" | "image_set" | "icon_library" | "template" | "guide" | "other";
  thumbnailUrl: string | null;
  fileSizeBytes: number | null;
  sortOrder: number;
}

// ─── Sub-brand (simplified child assets) ─────────────────────────────────────

export interface SubBrandAsset {
  id: string;
  subBrandId: string;
  fileUrl: string;
  fileType: string;
  label: string;
  notes: string | null;
}

export interface SubBrand {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  relationship: "subsidiary" | "product_line" | "regional_variant" | "licensed_partner" | "other";
  description: string;
  notes: string | null;
  brandColour: string;
  secondaryColour: string;
  externalUrl?: string | null;
  assets: SubBrandAsset[];
  overrides: Record<string, unknown>;
  inheritedFields: string[];
  overriddenFields: string[];
  healthScore: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Core Application Types ───────────────────────────────────────────────────

export interface StudioUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: "owner" | "admin" | "designer" | "strategist" | "copywriter";
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
}

export interface PortalSettings {
  url: string;
  passwordProtected: boolean;
  password: string | null;
  customDomain: string | null;
  showStudioCredit: boolean;
  theme: "light" | "dark" | "auto";
}

export interface SectionVisibility {
  sectionType: SupabaseSectionType;
  isEnabled: boolean;
  isLocked: boolean;
  autoApprove: boolean;
}

export interface ApprovalState {
  sectionType: SupabaseSectionType;
  status: "pending" | "approved" | "revision_requested";
  approvedAt: string | null;
  approvedBy: string | null;
  revisionNote: string | null;
}

export interface LaunchTask {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

export interface VersionEntry {
  version: string;
  timestamp: string;
  author: string;
  changes: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderName: string;
  senderType: "studio" | "client";
  content: string;
  attachments: string[];
  readAt: string | null;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  projectId: string;
  title: string;
  messages: ChatMessage[];
  unreadCount: number;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Project Type ─────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  clientName: string;
  clientSlug: string;
  industry: string;
  description: string;
  status: ProjectStatus;
  isPublished: boolean;
  portalTemplate: PortalTemplate;
  brandColour: string;
  secondaryColour: string;
  goLiveDate: string | null;
  launchedAt: string | null;
  brandHealth: number;
  healthScore: number;
  version: string;
  memberCount: number;
  subBrands: SubBrand[];
  brandJson: Record<string, unknown> | null;
  portalSettings: PortalSettings;
  sectionVisibility: SectionVisibility[];
  approvalStates: ApprovalState[];
  launchTasks: LaunchTask[];
  versionHistory: VersionEntry[];
  chatThreads: ChatThread[];
  createdAt: string;
  updatedAt: string;
}

// ─── Legacy Brand Section Types (PRESERVED) ──────────────────────────────────

export interface ColorSwatch {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  cmyk: { c: number; m: number; y: number; k: number };
  pantone: string | null;
  usageNote: string;
}

export interface FontSpec {
  family: string;
  googleFontsUrl: string;
  weights: number[];
  styleNote: string;
}

export interface TypeLevel {
  level: string;
  fontFamily: string;
  weight: number;
  sizePx: number;
  lineHeight: number;
  letterSpacing: string;
  sampleText: string;
}

export interface VoicePrinciple {
  name: string;
  description: string;
  exampleCorrect: string;
  exampleIncorrect: string;
}

export interface BrandSectionContent {
  type: SectionKey;
  [key: string]: any;
}

export interface BrandSection {
  id: string;
  projectId: string;
  sectionKey: SectionKey;
  content: BrandSectionContent;
  approvalStatus: ApprovalStatus;
  approvedAt: string | null;
  approvedBy: string | null;
  revisionNote: string | null;
  updatedAt: string;
}

// ─── Asset Types ──────────────────────────────────────────────────────────────

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number;
  category: AssetCategory;
  visibleToClient: boolean;
  uploadedBy: string;
  createdAt: string;
}

// ─── Member Types ─────────────────────────────────────────────────────────────

export interface StudioMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: MemberRole;
}

export interface ClientMember {
  id: string;
  projectId: string;
  name: string;
  email: string;
  permissionLevel: PermissionLevel;
  lastLogin: string | null;
  invitedAt: string;
  invitedBy: string;
  isActive: boolean;
}

// ─── Activity Types ───────────────────────────────────────────────────────────

export interface ActivityEvent {
  id: string;
  projectId: string;
  eventType: ActivityEventType;
  actorName: string;
  actorType: "studio" | "client";
  description: string;
  sectionKey: SectionKey | SupabaseSectionType | null;
  metadata: Record<string, string | number | boolean> | null;
  createdAt: string;
}

// ─── Brand Request Types ──────────────────────────────────────────────────────

export interface BrandRequest {
  id: string;
  projectId: string;
  clientMemberId: string;
  clientName: string;
  requestType: string;
  description: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  resolvedAt: string | null;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  activeProjects: number;
  pendingApprovals: number;
  openRequests: number;
  unreadMessages: number;
}

export interface AttentionItem {
  id: string;
  type: "approval" | "message" | "deadline";
  title: string;
  subtitle: string;
  projectId: string;
  createdAt: string;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}
