import type { Project, SubBrand } from "@/types";

export function getInheritedValue<T>(
  parent: Project,
  subBrand: SubBrand,
  field: string
): T | undefined {
  if (subBrand.overriddenFields.includes(field)) {
    return subBrand.overrides[field] as T;
  }
  return (parent as unknown as Record<string, unknown>)[field] as T;
}

export function isFieldOverridden(subBrand: SubBrand, field: string): boolean {
  return subBrand.overriddenFields.includes(field);
}

export function updateSubBrandField<T>(
  subBrand: SubBrand,
  field: string,
  value: T,
  inherit: boolean
): SubBrand {
  const newOverrides = { ...subBrand.overrides };
  const newOverriddenFields = [...subBrand.overriddenFields];
  const newInheritedFields = [...subBrand.inheritedFields];

  if (inherit) {
    delete newOverrides[field];
    const idx = newOverriddenFields.indexOf(field);
    if (idx > -1) newOverriddenFields.splice(idx, 1);
    if (!newInheritedFields.includes(field)) {
      newInheritedFields.push(field);
    }
  } else {
    newOverrides[field] = value;
    if (!newOverriddenFields.includes(field)) {
      newOverriddenFields.push(field);
    }
    const idx = newInheritedFields.indexOf(field);
    if (idx > -1) newInheritedFields.splice(idx, 1);
  }

  return {
    ...subBrand,
    overrides: newOverrides,
    overriddenFields: newOverriddenFields,
    inheritedFields: newInheritedFields,
  };
}

export function createSubBrand(
  projectId: string,
  name: string,
  brandColour: string,
  description: string,
  relationship: SubBrand["relationship"] = "subsidiary"
): SubBrand {
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return {
    id: `sub-${Date.now()}`,
    projectId,
    name,
    slug,
    relationship,
    description,
    notes: "",
    brandColour,
    secondaryColour: "",
    assets: [],
    overrides: {},
    inheritedFields: ["secondaryColour"], // Default some fields to inherit
    overriddenFields: ["description", "brandColour"], // These are explicitly set on creation
    healthScore: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function calculateSubBrandHealthScore(subBrand: SubBrand): number {
  const totalPotentialFields = 5; // name, description, brandColour, secondaryColour, assets
  let score = 0;

  if (subBrand.name) score += 1;
  if (subBrand.description) score += 1;
  if (subBrand.brandColour) score += 1;
  if (subBrand.secondaryColour || subBrand.inheritedFields.includes("secondaryColour")) score += 1;
  if (subBrand.assets.length > 0) score += 1;

  return Math.round((score / totalPotentialFields) * 100);
}

export function getInheritanceSummary(subBrand: SubBrand): {
  inheritedCount: number;
  overriddenCount: number;
  totalCount: number;
} {
  return {
    inheritedCount: subBrand.inheritedFields.length,
    overriddenCount: subBrand.overriddenFields.length,
    totalCount: subBrand.inheritedFields.length + subBrand.overriddenFields.length,
  };
}
