// hs-portal/src/lib/builder.ts
// Handles the full template upload pipeline:
//   1. Extract uploaded zip to os.tmpdir()/<id>/
//   2. Validate structure
//   3. Run npm install + npm run build
//   4. Verify dist/index.html exists
//   5. Upload dist/ to Supabase Storage (stone-templates)
//   6. Clean up os.tmpdir()/<id>/
//   7. Register in Supabase templates table
//   8. Return structured BuildResult

import fs from "fs";
import path from "path";
import os from "os";
import { Readable } from "stream";
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

function log(logs: BuildLogEntry[], level: BuildLogEntry["level"], message: string): void {
  const entry: BuildLogEntry = { timestamp: new Date().toISOString(), level, message };
  logs.push(entry);
  logger[level](`[builder] ${message}`);
}

function runCommand(
  cmd: string,
  args: string[],
  cwd: string,
  logs: BuildLogEntry[]
): Promise<void> {
  const TIMEOUT_MS = 300000;

  return new Promise((resolve, reject) => {
    log(logs, "info", `Running: ${cmd} ${args.join(" ")}`);
    const proc = spawn(cmd, args, { 
      cwd, 
      shell: true,
      env: { ...process.env, NODE_ENV: "production" }
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

async function extractZip(
  zipBuffer: Buffer,
  destDir: string,
  logs: BuildLogEntry[]
): Promise<void> {
  const MAX_FILES = 500;
  const MAX_SIZE = 50 * 1024 * 1024;
  let fileCount = 0;
  let totalSize = 0;

  log(logs, "info", `Extracting zip to temporary path`);
  fs.mkdirSync(destDir, { recursive: true });

  await new Promise<void>((resolve, reject) => {
    const readable = new Readable();
    readable.push(zipBuffer);
    readable.push(null);

    readable
      .pipe(unzipper.Parse())
      .on("entry", (entry) => {
        const fileName = entry.path;
        const type = entry.type;
        const size = entry.vars.uncompressedSize;

        fileCount++;
        totalSize += size;

        if (fileCount > MAX_FILES || totalSize > MAX_SIZE) {
          log(logs, "error", "Zip bomb detected: Exceeded file count or size limits.");
          entry.autodrain();
          reject(new Error("Zip extraction limits exceeded"));
          return;
        }

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

function getFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function uploadDist(distDir: string, templateId: string, logs: BuildLogEntry[]) {
  const files = getFiles(distDir);
  log(logs, "info", `Found ${files.length} files to upload to Supabase Storage.`);

  for (const file of files) {
    const relativePath = path.relative(distDir, file).replace(/\\/g, "/");
    const objectPath = `${templateId}/${relativePath}`;
    
    let contentType = "application/octet-stream";
    const ext = path.extname(file).toLowerCase();
    if (ext === ".html") contentType = "text/html";
    else if (ext === ".js" || ext === ".mjs") contentType = "application/javascript";
    else if (ext === ".css") contentType = "text/css";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".json") contentType = "application/json";
    else if (ext === ".txt") contentType = "text/plain";
    else if (ext === ".woff" || ext === ".woff2") contentType = "font/woff2";
    else if (ext === ".ttf") contentType = "font/ttf";
    else if (ext === ".eot") contentType = "application/vnd.ms-fontobject";

    const buffer = fs.readFileSync(file);
    const { error } = await supabase.storage.from("stone-templates").upload(objectPath, buffer, {
      contentType,
      upsert: true,
    });
    
    if (error) {
      throw new Error(`Upload failed for ${relativePath}: ${error.message}`);
    }
  }
  log(logs, "info", `Uploaded templates to Supabase Storage (stone-templates) ✓`);
}

export async function buildTemplate(
  zipBuffer: Buffer,
  uploadedBy: string
): Promise<BuildResult> {
  const logs: BuildLogEntry[] = [];
  const templateId = `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const destDir = path.join(os.tmpdir(), "hs-portal-build", templateId);

  try {
    await extractZip(zipBuffer, destDir, logs);

    const validation = validateTemplateDir(destDir);
    logs.push(...validation.logs);

    if (!validation.valid) {
      fs.rmSync(destDir, { recursive: true, force: true });
      return { success: false, templateId: null, logs, error: "Validation failed" };
    }

    const templateName = validation.templateName ?? templateId;

    await runCommand("npm", ["install", "--prefer-offline", "--no-audit"], destDir, logs);
    await runCommand("npm", ["run", "build"], destDir, logs);

    const distIndex = path.join(destDir, "dist", "index.html");
    if (!fs.existsSync(distIndex)) {
      throw new Error("Build completed but dist/index.html not found");
    }
    log(logs, "info", "dist/index.html verified ✓");

    // Upload to Supabase instead of keeping it locally
    await uploadDist(path.join(destDir, "dist"), templateId, logs);

    // Clean up temporary local workspace
    fs.rmSync(destDir, { recursive: true, force: true });
    log(logs, "info", "Local temporary files cleaned up ✓");

    const { error: insertError } = await supabase.from("templates").insert({
      id: templateId,
      name: templateName,
      component_name: templateName,
      description: `Uploaded by ${uploadedBy}`,
      preview_url: null,
      thumbnail_url: null,
      sections_supported: [],
      dist_path: templateId, // For Supabase stateless, we just store the templateId bucket prefix
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
