import type { Project } from "@/types";

export interface PortalTheme {
  brandColor: string;
  secondaryColor: string;
  headingFont: string;
  bodyFont: string;
}

export function injectProjectTheme(project: Project): void {
  const theme: PortalTheme = {
    brandColor: project.brandColour,
    secondaryColor: project.secondaryColour,
    headingFont: "Inter, sans-serif",
    bodyFont: "Inter, sans-serif",
  };
  
  // Apply additional logic like darker/lighter variants if needed
  injectPortalTheme(theme);
}

export function injectPortalTheme(theme: PortalTheme): void {
  const root = document.documentElement;

  root.style.setProperty("--portal-brand", theme.brandColor);
  root.style.setProperty("--portal-secondary", theme.secondaryColor);
  root.style.setProperty("--portal-heading-font", theme.headingFont);
  root.style.setProperty("--portal-body-font", theme.bodyFont);

  // Generate variants
  root.style.setProperty("--portal-brand-subtle", adjustBrightness(theme.brandColor, 80));
  root.style.setProperty("--portal-brand-contrast", getContrastColor(theme.brandColor));

  root.setAttribute("data-portal-theme", "active");

  window.dispatchEvent(
    new CustomEvent("portalThemeInjected", { detail: theme })
  );
}

export function clearPortalTheme(): void {
  const root = document.documentElement;

  root.style.removeProperty("--portal-brand");
  root.style.removeProperty("--portal-secondary");
  root.style.removeProperty("--portal-heading-font");
  root.style.removeProperty("--portal-body-font");

  root.removeAttribute("data-portal-theme");
}

export function getPortalTheme(): PortalTheme | null {
  const root = document.documentElement;

  const brandColor = root.style.getPropertyValue("--portal-brand");
  const secondaryColor = root.style.getPropertyValue("--portal-secondary");
  const headingFont = root.style.getPropertyValue("--portal-heading-font");
  const bodyFont = root.style.getPropertyValue("--portal-body-font");

  if (!brandColor) return null;

  return {
    brandColor,
    secondaryColor,
    headingFont,
    bodyFont,
  };
}

export function hasPortalTheme(): boolean {
  return document.documentElement.hasAttribute("data-portal-theme");
}

export function generateColorPalette(baseColor: string): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
} {
  return {
    primary: baseColor,
    secondary: adjustBrightness(baseColor, 20),
    accent: adjustBrightness(baseColor, 40),
    background: adjustBrightness(baseColor, -80),
    text: getContrastColor(baseColor),
  };
}

export function getContrastColor(bg: string): string {
  const hex = bg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#0A0A0A" : "#FFFFFF";
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));

  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
