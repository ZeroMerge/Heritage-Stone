// hs-hub/src/pages/UploadTemplate.tsx
// Template upload page. Accepts a .zip, sends it to POST /upload/template,
// and displays a live scrolling build log as the server processes it.

import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { templatesApi, type BuildLogEntry } from "../lib/api.ts";
import {
  UploadCloud,
  CheckCircle,
  XCircle,
  FileCode,
  Loader2,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { clsx } from "clsx";

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadTemplate() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedBy, setUploadedBy] = useState("");
  const [state, setState] = useState<UploadState>("idle");
  const [logs, setLogs] = useState<BuildLogEntry[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const appendLog = (entry: BuildLogEntry) => {
    setLogs((prev) => [...prev, entry]);
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
      }
    }, 20);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".zip")) {
      setFile(dropped);
    } else {
      alert("Please drop a .zip file");
    }
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setState("uploading");
    setLogs([]);
    setErrorMsg(null);
    setTemplateId(null);

    appendLog({
      timestamp: new Date().toISOString(),
      level: "info",
      message: `INITIATING UPLOAD: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });

    try {
      const res = await templatesApi.upload(file, uploadedBy || "hub-admin");
      const result = res.data;

      for (const log of result.logs) {
        appendLog(log);
      }

      if (result.success && result.templateId) {
        setTemplateId(result.templateId);
        setState("success");
      } else {
        setErrorMsg(result.error ?? "Build failed");
        setState("error");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      appendLog({ timestamp: new Date().toISOString(), level: "error", message: msg });
      setErrorMsg(msg);
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setFile(null);
    setLogs([]);
    setTemplateId(null);
    setErrorMsg(null);
  };

  return (
    <div className="p-12 max-w-5xl animate-fade-in">
       <div className="mb-12 border-b border-[var(--hs-border)] pb-8">
        <h1 className="heading-xl text-[var(--hs-text)] mb-2">Template Ingestion</h1>
        <p className="text-sm text-[var(--hs-text-muted)]">
          Register new high-fidelity design patterns into the Heritage Stone ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Control Panel */}
        <div className="space-y-12">
          {/* Metadata */}
          <div className="space-y-6">
            <div>
              <label className="text-xs-mono mb-2 block">Authorized Registrar</label>
              <input
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                placeholder="e.g. j.wright@heritage.stone"
                className="hs-input w-full !bg-[var(--hs-surface)]"
                disabled={state === "uploading"}
              />
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={clsx(
              "hs-card h-72 flex flex-col items-center justify-center gap-6 transition-all duration-500 border-dashed cursor-pointer",
              dragging && "border-[var(--hs-accent)] bg-[var(--hs-accent)]/[0.05]",
              file && "border-[var(--hs-accent)]/50 bg-[var(--hs-accent)]/[0.02]",
              !file && !dragging && "border-[var(--hs-border)] hover:border-[var(--hs-accent)]/30",
              state !== "idle" && "pointer-events-none opacity-50"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            
            {file ? (
              <div className="text-center animate-fade-in">
                <FileCode className="w-16 h-16 text-[var(--hs-accent)] mx-auto mb-4" />
                <p className="text-sm font-mono text-[var(--hs-text)]">{file.name}</p>
                <p className="text-[10px] text-[var(--hs-text-muted)] mt-1 uppercase tracking-widest">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · READY FOR INGESTION
                </p>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="w-16 h-16 text-[var(--hs-border)] mx-auto mb-4 opacity-50" />
                <p className="text-sm text-[var(--hs-text)]">Drop compressed template package</p>
                <p className="text-[10px] text-[var(--hs-text-muted)] mt-1 uppercase tracking-widest">
                  SUPPORTED FORMAT: .ZIP
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {state === "idle" || state === "uploading" ? (
            <button
              onClick={() => void handleSubmit()}
              disabled={!file || state === "uploading"}
              className="hs-btn hs-btn-primary w-full !py-4 text-xs-mono tracking-[0.2em]"
            >
              {state === "uploading" ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>TRANSMITTING BUNDLE...</span>
                </div>
              ) : (
                "INITIALIZE BUILD SEQUENCE"
              )}
            </button>
          ) : state === "success" ? (
            <div className="space-y-4">
               <div className="p-6 bg-[var(--hs-green)]/5 border border-[var(--hs-green)]/20 flex gap-4">
                 <CheckCircle className="w-5 h-5 text-[var(--hs-green)]" />
                 <div>
                   <p className="text-sm text-[var(--hs-green)] font-medium">Build Manifest Verified</p>
                   <p className="text-[10px] text-[var(--hs-green)]/70 font-mono mt-1 mt-1">UUID: {templateId}</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <Link to="/templates" className="hs-btn hs-btn-primary flex-1">View Registry</Link>
                 <button onClick={reset} className="hs-btn hs-btn-secondary flex-1">New Package</button>
               </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="p-6 bg-red-500/5 border border-red-500/20 flex gap-4">
                 <XCircle className="w-5 h-5 text-red-500" />
                 <div>
                   <p className="text-sm text-red-400 font-medium">Build Sequence Terminated</p>
                   <p className="text-[10px] text-red-300/70 font-mono mt-1">{errorMsg}</p>
                 </div>
               </div>
               <button onClick={reset} className="hs-btn hs-btn-primary w-full">Reset Sequence</button>
            </div>
          )}
        </div>

        {/* Build Feed */}
        <div className="flex flex-col h-full">
           <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs-mono">Build Stream</h3>
            {state === "uploading" && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--hs-accent)] animate-pulse" />
                <span className="text-[10px] font-mono text-[var(--hs-accent)]">STREAMING</span>
              </div>
            )}
          </div>
          
          <div className="hs-card bg-[#0A0A0A] border-[var(--hs-border)] flex-1 min-h-[500px] flex flex-col font-mono text-[11px] overflow-hidden">
            <div 
              ref={logContainerRef}
              className="flex-1 overflow-y-auto p-8 space-y-1.5 scrollbar-thin scrollbar-thumb-[var(--hs-border)] scrollbar-track-transparent"
            >
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--hs-text-muted)] opacity-20 italic">
                  <div className="mb-2">READY FOR INPUT</div>
                  <div className="text-[8px] animate-pulse">00:00:00</div>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-[var(--hs-border)] select-none w-8 text-right opacity-50">{String(i + 1).padStart(2, "0")}</span>
                    <span className={clsx(
                      "flex-1 break-all",
                      log.level === "error" ? "text-red-400" : 
                      log.level === "success" ? "text-[var(--hs-green)]" : 
                      "text-[var(--hs-text-muted)]"
                    )}>
                      [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}] {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-[var(--hs-border)]/30 bg-[var(--hs-surface)] flex items-center justify-between text-[10px] text-[var(--hs-text-muted)]">
              <span className="opacity-50 uppercase tracking-widest font-bold">HS-BUILDER ENGINE 4.2.0</span>
              <span className="font-mono">{state.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
