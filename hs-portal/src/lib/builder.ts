// hs-portal/src/lib/builder.ts
// Handles the full template upload pipeline:
//   1. Extract uploaded zip to TEMPLATES_DIR/<id>/
//   2. Validate structure
//   3. Run npm install + npm run build
//   4. Verify dist/index.html exists
//   5. Register in Supabase templates table
//   6. Return structured BuildResult

import fs from "fs";
import path from "path";
import { Readable } from "stream"; // FIX: was require("stream") — crashes in strict ESM
import { spawn } from "child_process";
import unzipper from "unzipper";
import { createClient } from "@supabase/supabase-js";
import { validateTemplateDir } from "./validator.js";
import { logger } from "./logger.js";
import type { BuildResult, BuildLogEntry } from "../types/index.js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEMPLATES_DIR = path.resolve(
  process.env.TEMPLATES_DIR ?? path.join(process.cwd(), "templates")
);

function log(logs: BuildLogEntry[], level: BuildLogEntry["level"], message: string): void {
  const entry: BuildLogEntry = { timestamp: new Date().toISOString(), level, message };
  logs.push(entry);
  logger[level](`[builder] ${message}`);
}

/**
 * Run a shell command inside a working directory.
 * Resolves with combined output, rejects on non-zero exit.
 */
function runCommand(
  cmd: string,
  args: string[],
  cwd: string,
  logs: BuildLogEntry[]
): Promise<void> {
  const TIMEOUT_MS = 300000; // 5 minutes max build time

  return new Promise((resolve, reject) => {
    log(logs, "info", `Running: ${cmd} ${args.join(" ")}`);
    const proc = spawn(cmd, args, { 
      cwd, 
      shell: true,
      env: { ...process.env, NODE_ENV: "production" } // Force production
    });

    const timeout = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(`Command timed out after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);

    proc.stdout.on("data", (chunk: Buffer) => {
      chunk.toString().split("\n").filter(Boolean).forEach((l) => log(logs, "info", l));
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      chunk.toString().split("\n").filter(Boolean).forEach((l) => log(logs, "warn", l));
    });

    proc.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Extract a zip buffer into destDir.
 * FIX: was using require("stream") which is invalid in strict ESM.
 * FIX: Readable.from(buffer) iterates buffer bytes — wrong for unzipper.
 *      Correct approach: push the buffer into a Readable stream manually.
 */
async function extractZip(
  zipBuffer: Buffer,
  destDir: string,
  logs: BuildLogEntry[]
): Promise<void> {
  const MAX_FILES = 500;
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  let fileCount = 0;
  let totalSize = 0;

  log(logs, "info", `Extracting zip to ${destDir}`);
  fs.mkdirSync(destDir, { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const readable = new Readable();
    readable.push(zipBuffer);
    readable.push(null);

    readable
      .pipe(unzipper.Parse())
      .on("entry", (entry) => {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        const size = entry.vars.uncompressedSize;

        fileCount++;
        totalSize += size;

        if (fileCount > MAX_FILES || totalSize > MAX_SIZE) {
          log(logs, "error", "Zip bomb detected: Exceeded file count or size limits.");
          entry.autodrain();
          reject(new Error("Zip extraction limits exceeded"));
          return;
        }

        // Security: Prevent path traversal in zip entries
        const fullPath = path.join(destDir, fileName);
        if (!fullPath.startsWith(path.resolve(destDir))) {
          log(logs, "error", `Blocked path traversal in zip: ${fileName}`);
          entry.autodrain();
          return;
        }

        if (type === "File") {
          const dir = path.dirname(fullPath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          entry.pipe(fs.createWriteStream(fullPath));
        } else {
          fs.mkdirSync(fullPath, { recursive: true });
          entry.autodrain();
        }
      })
      .on("close", resolve)
      .on("error", reject);
  });

  // If the zip had a single root folder, flatten it
  const entries = fs.readdirSync(destDir);
  if (entries.length === 1) {
    const single = path.join(destDir, entries[0]);
    if (fs.statSync(single).isDirectory()) {
      log(logs, "info", `Flattening single root folder: ${entries[0]}`);
      for (const e of fs.readdirSync(single)) {
        fs.renameSync(path.join(single, e), path.join(destDir, e));
      }
      fs.rmdirSync(single);
    }
  }

  log(logs, "info", "Extraction complete ✓");
}

/**
 * Main entry point: build a template from a zip buffer.
 */
export async function buildTemplate(
  zipBuffer: Buffer,
  uploadedBy: string
): Promise<BuildResult> {
  const logs: BuildLogEntry[] = [];
  const templateId = `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const destDir = path.join(TEMPLATES_DIR, templateId);

  try {
    // 1. Extract
    await extractZip(zipBuffer, destDir, logs);

    // 2. Validate
    const validation = validateTemplateDir(destDir);
    logs.push(...validation.logs);

    if (!validation.valid) {
      fs.rmSync(destDir, { recursive: true, force: true });
      return { success: false, templateId: null, logs, error: "Validation failed" };
    }

    const templateName = validation.templateName ?? templateId;

    // 3. npm install
    await runCommand("npm", ["install", "--prefer-offline", "--no-audit"], destDir, logs);

    // 4. npm run build
    await runCommand("npm", ["run", "build"], destDir, logs);

    // 5. Verify dist/index.html
    const distIndex = path.join(destDir, "dist", "index.html");
    if (!fs.existsSync(distIndex)) {
      throw new Error("Build completed but dist/index.html not found");
    }
    log(logs, "info", "dist/index.html verified ✓");

    // 6. Clean up node_modules to save disk space (source stays for rebuilds)
    const nodeModulesPath = path.join(destDir, "node_modules");
    if (fs.existsSync(nodeModulesPath)) {
      fs.rmSync(nodeModulesPath, { recursive: true, force: true });
      log(logs, "info", "node_modules cleaned up (dist preserved) ✓");
    }

    // 7. Register in Supabase
    const distPath = path.join(destDir, "dist");
    const { error: insertError } = await supabase.from("templates").insert({
      id: templateId,
      name: templateName,
      component_name: templateName,
      description: `Uploaded by ${uploadedBy}`,
      preview_url: null,
      thumbnail_url: null,
      sections_supported: [],
      dist_path: distPath,
      is_active: true,
      uploaded_at: new Date().toISOString(),
    });

    if (insertError) {
      throw new Error(`Supabase insert failed: ${insertError.message}`);
    }

    log(logs, "info", `Template registered: ${templateId} ✓`);
    return { success: true, templateId, logs };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(logs, "error", `Build FAILED: ${message}`);
    fs.rmSync(destDir, { recursive: true, force: true });
    return { success: false, templateId: null, logs, error: message };
  }
}

/**
 * Return path to a registered template's dist folder.
 */
export function getTemplateDist(templateId: string): string {
  return path.join(TEMPLATES_DIR, templateId, "dist");
}
