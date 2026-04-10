// hs-portal/src/lib/validator.ts
// Validates that an extracted template folder meets the contract:
//   - Has a package.json with "name" and "scripts.build"
//   - Has a src/ directory
//   - Does NOT already have a dist/ (it must be built fresh by builder.ts)

import fs from "fs";
import path from "path";
import type { BuildLogEntry } from "../types/index.js";

export interface ValidationResult {
  valid: boolean;
  logs: BuildLogEntry[];
  templateName: string | null;
}

function log(logs: BuildLogEntry[], level: BuildLogEntry["level"], message: string): void {
  logs.push({ timestamp: new Date().toISOString(), level, message });
}

export function validateTemplateDir(dirPath: string): ValidationResult {
  const logs: BuildLogEntry[] = [];
  let valid = true;
  let templateName: string | null = null;

  // 1. Check directory exists
  if (!fs.existsSync(dirPath)) {
    log(logs, "error", `Directory not found: ${dirPath}`);
    return { valid: false, logs, templateName };
  }

  // 2. package.json must exist
  const pkgPath = path.join(dirPath, "package.json");
  if (!fs.existsSync(pkgPath)) {
    log(logs, "error", "Missing package.json");
    valid = false;
  } else {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
        name?: string;
        scripts?: { build?: string };
      };

      if (!pkg.name) {
        log(logs, "error", "package.json is missing the 'name' field");
        valid = false;
      } else {
        templateName = pkg.name;
        log(logs, "info", `Template name: ${pkg.name}`);
      }

      if (!pkg.scripts?.build) {
        log(logs, "error", "package.json is missing scripts.build");
        valid = false;
      } else {
        log(logs, "info", `Build script: ${pkg.scripts.build}`);
      }
    } catch {
      log(logs, "error", "package.json is not valid JSON");
      valid = false;
    }
  }

  // 3. src/ directory must exist
  const srcPath = path.join(dirPath, "src");
  if (!fs.existsSync(srcPath) || !fs.statSync(srcPath).isDirectory()) {
    log(logs, "error", "Missing src/ directory");
    valid = false;
  } else {
    log(logs, "info", "src/ directory present ✓");
  }

  // 4. dist/ must NOT already exist (force a clean build)
  const distPath = path.join(dirPath, "dist");
  if (fs.existsSync(distPath)) {
    log(logs, "warn", "dist/ directory already exists — it will be rebuilt");
    // Not fatal, builder will overwrite
  }

  // 5. Must have an index.html or vite.config (signal it's a Vite app)
  const hasViteConfig =
    fs.existsSync(path.join(dirPath, "vite.config.ts")) ||
    fs.existsSync(path.join(dirPath, "vite.config.js"));
  const hasIndexHtml = fs.existsSync(path.join(dirPath, "index.html"));

  if (!hasViteConfig && !hasIndexHtml) {
    log(logs, "warn", "No vite.config.ts or index.html found — template may not be a Vite app");
  } else {
    log(logs, "info", "Vite project signature detected ✓");
  }

  if (valid) {
    log(logs, "info", "Validation passed ✓");
  } else {
    log(logs, "error", "Validation FAILED — template will not be built");
  }

  return { valid, logs, templateName };
}
