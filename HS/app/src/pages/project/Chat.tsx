import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Send, MoreVertical, Search, CheckCheck,
  MessageSquare, Plus, X, Mail, AtSign, Menu, Users,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, useProjectsStore, useUIStore } from "@/store";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  name: string;
  type: "studio" | "client";
  email: string;
}

interface Thread {
  id: string;
  name: string;
  preview: string;
}

// ─── Message Content Renderer ─────────────────────────────────────────────────

function parseContent(content: string, members: Member[], brandColour: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  while (remaining.length > 0) {
    const atIdx = remaining.indexOf("@");
    if (atIdx === -1) { nodes.push(remaining); break; }
    if (atIdx > 0) nodes.push(remaining.slice(0, atIdx));

    const afterAt = remaining.slice(atIdx + 1);
    const sorted = [...members].sort((a, b) => b.name.length - a.name.length);
    let matched = false;

    for (const m of sorted) {
      if (afterAt.toLowerCase().startsWith(m.name.toLowerCase())) {
        nodes.push(
          <mark
            key={key++}
            className="not-italic px-1.5 py-0.5 rounded-md text-white text-[0.8em] font-semibold"
            style={{ background: m.type === "studio" ? "var(--hs-accent)" : brandColour }}
          >
            @{m.name}
          </mark>
        );
        remaining = afterAt.slice(m.name.length);
        matched = true;
        break;
      }
    }

    if (!matched) { nodes.push("@"); remaining = afterAt; }
  }

  return nodes;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Chat() {
  const { project } = useOutletContext<{ project: Project }>();
  const { user } = useAuthStore();
  const { chatMessages, addChatMessage, studioMembers, clientMembers, fetchClientMembers } = useProjectsStore();
  const { showToast } = useUIStore();

  // Fetch client members from DB on mount
  useEffect(() => {
    fetchClientMembers(project.id);
  }, [project.id, fetchClientMembers]);

  // Build member list from the store
  const storeStudio: Member[] = studioMembers.map(m => ({
    id: m.id,
    name: m.name || m.email || "Studio Member",
    type: "studio" as const,
    email: m.email || "",
  }));
  const storeClients: Member[] = (clientMembers[project.id] || []).map(m => ({
    id: m.id,
    name: m.name,
    type: "client" as const,
    email: m.email,
  }));

  // Fallback demo data if DB is empty
  const fallback: Member[] = [
    { id: "s-demo", name: "Studio Admin", type: "studio", email: "admin@studio.com" },
    { id: "c-demo", name: project.clientName, type: "client", email: `contact@${project.clientName.toLowerCase().replace(/\s+/g, "")}.com` },
  ];

  const members: Member[] =
    storeStudio.length > 0 || storeClients.length > 0
      ? [...storeStudio, ...storeClients]
      : fallback;

  const allMessages = chatMessages[project.id] || [];

  const [newMessage, setNewMessage]       = useState("");
  const [activeThread, setActiveThread]   = useState("default");
  const [threads, setThreads]             = useState<Thread[]>([
    { id: "default", name: "General", preview: "Start a conversation…" },
  ]);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [showInvite, setShowInvite]       = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);

  // @mention
  const [mentionOpen, setMentionOpen]   = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(0);
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = allMessages.filter(m => !m.threadId || m.threadId === activeThread);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  // Close sidebar when clicking backdrop
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewMessage(val);
    const cursor = e.target.selectionStart ?? 0;
    const before = val.substring(0, cursor);
    const m = before.match(/@(\w*)$/);
    if (m) {
      setMentionQuery(m[1]);
      setMentionStart(cursor - m[0].length);
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
    }
  };

  const insertMention = (member: Member) => {
    const cursor = inputRef.current?.selectionStart ?? 0;
    const before = newMessage.substring(0, mentionStart);
    const after  = newMessage.substring(cursor);
    setNewMessage(`${before}@${member.name} ${after}`);
    setMentionOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
      await addChatMessage(project.id, {
        senderName: `${user.firstName || "Studio"} ${user.lastName || "Admin"}`,
        senderType: "studio",
        content: newMessage.trim(),
        threadId: activeThread,
      });
      setNewMessage("");
      setMentionOpen(false);
    } catch { /* ignore */ }
  };

  return (
    <div
      className="flex bg-[var(--surface-default)] border border-[var(--border-subtle)] overflow-hidden shadow-sm relative"
      style={{ height: "min(calc(100svh - 180px), 740px)", minHeight: 420 }}
    >
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Thread Sidebar ───────────────────────────────────────────────── */}
      <div className={cn(
        "w-64 bg-[var(--surface-subtle)] border-r border-[var(--border-subtle)] flex flex-col flex-shrink-0",
        // On mobile: slide-over drawer fixed to chat container
        "absolute inset-y-0 left-0 z-50 md:static md:z-auto transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Sidebar header */}
        <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--hs-accent)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Threads</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveThread(t.id); setSidebarOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-all",
                activeThread === t.id
                  ? "bg-[var(--hs-primary)] text-white dark:text-[#0f0f0f] border-transparent shadow-sm"
                  : "bg-[var(--surface-default)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--border-default)]"
              )}
            >
              <div className="font-medium truncate">{t.name}</div>
              <div className={cn("text-xs mt-0.5 truncate", activeThread === t.id ? "text-white/60 dark:text-black/50" : "text-[var(--text-tertiary)]")}>
                {t.preview}
              </div>
            </button>
          ))}

          <div className="pt-1">
            <button
              onClick={() => setShowNewThread(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[var(--border-default)] text-xs text-[var(--text-secondary)] hover:text-[var(--hs-accent)] hover:border-[var(--hs-accent)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Thread
            </button>
          </div>
        </div>

        {/* Members legend */}
        <div className="p-3 border-t border-[var(--border-subtle)] flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">Members</p>
          <div className="space-y-1.5">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: m.type === "studio" ? "var(--hs-accent)" : project.brandColour }}
                />
                <span className="text-xs text-[var(--text-secondary)] truncate flex-1">{m.name}</span>
                <span
                  className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: m.type === "studio" ? "var(--hs-accent)" : project.brandColour + "25",
                    color:      m.type === "studio" ? "#fff"            : project.brandColour,
                  }}
                >
                  {m.type === "studio" ? "Team" : "Client"}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="mt-3 w-full flex items-center gap-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--hs-accent)] transition-colors"
          >
            <Mail className="w-3 h-3" />
            Invite by email
          </button>
        </div>
      </div>

      {/* ── Main Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]">

        {/* Header */}
        <div className="px-3 sm:px-4 py-3 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-default)] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {/* Mobile: hamburger to open sidebar */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {threads.find(t => t.id === activeThread)?.name ?? "General"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] hidden sm:block">
                {project.name} · {members.length} members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile: show member count + invite shortcut */}
            <button
              onClick={() => setShowInvite(true)}
              className="md:hidden flex items-center gap-1 px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--hs-accent)] hover:bg-[var(--surface-subtle)] rounded-lg transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{members.length}</span>
            </button>
            <button className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-lg transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowNewThread(true)}
              className="hidden sm:flex p-1.5 text-[var(--text-tertiary)] hover:text-[var(--hs-accent)] hover:bg-[var(--surface-subtle)] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-5 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 pt-8">
              <MessageSquare className="w-10 h-10 text-[var(--hs-primary)] mb-3" />
              <h3 className="text-sm font-medium text-[var(--text-primary)]">A space to think.</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 text-center">
                Type <strong>@</strong> to tag a team member or client
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isStudio = msg.senderType === "studio";
              return (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 sm:gap-3 group max-w-2xl"
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 text-white dark:text-[#0f0f0f]"
                    style={{ background: isStudio ? "var(--hs-primary)" : project.brandColour }}
                  >
                    {(msg.senderName || "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap mb-1">
                      <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">{msg.senderName}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {msg.createdAt ? format(new Date(msg.createdAt), "h:mm a") : ""}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                        style={{
                          background: isStudio ? "var(--hs-accent)" : project.brandColour + "25",
                          color:      isStudio ? "#fff"            : project.brandColour,
                        }}
                      >
                        {isStudio ? "Team" : "Client"}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm leading-relaxed text-[var(--text-primary)]">
                      {parseContent(msg.content, members, project.brandColour)}
                    </div>
                    {isStudio && (
                      <div className="mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCheck className="w-3 h-3 text-blue-500" />
                        <span className="text-[9px] text-[var(--text-tertiary)] font-bold uppercase tracking-tight">Sent</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-2.5 sm:p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-default)] flex-shrink-0">
          <AnimatePresence>
            {mentionOpen && filteredMembers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                className="mb-2 bg-[var(--surface-default)] border border-[var(--border-default)] shadow-xl rounded-2xl overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
                  <AtSign className="w-3.5 h-3.5 text-[var(--hs-accent)]" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Tag a member</span>
                </div>
                {filteredMembers.map(m => (
                  <button
                    key={m.id}
                    onMouseDown={e => { e.preventDefault(); insertMention(m); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--surface-subtle)] transition-colors text-left"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: m.type === "studio" ? "var(--hs-accent)" : project.brandColour }}
                    >
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">{m.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)] truncate">{m.email}</div>
                    </div>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                      style={{ background: m.type === "studio" ? "var(--hs-accent)" : project.brandColour }}
                    >
                      {m.type === "studio" ? "Team" : "Client"}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === "Escape") { setMentionOpen(false); return; }
                  if (e.key === "Enter" && !e.shiftKey && !mentionOpen) {
                    e.preventDefault();
                    handleSend(e as unknown as React.FormEvent);
                  }
                }}
                placeholder="Message… type @ to mention"
                className="w-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] rounded-none px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:ring-1 focus:ring-[var(--hs-accent)] focus:border-transparent placeholder:text-[var(--text-tertiary)] resize-none min-h-[40px] max-h-[120px] transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-all flex-shrink-0 rounded-none",
                newMessage.trim()
                  ? "bg-[var(--hs-primary)] text-white dark:text-[#0f0f0f] shadow-md hover:bg-[var(--hs-accent)] active:scale-95"
                  : "bg-[var(--surface-subtle)] text-[var(--text-tertiary)]"
              )}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <p className="mt-1.5 text-[10px] text-center text-[var(--text-tertiary)] hidden sm:block">
            Enter to send · Shift+Enter for new line · @ to mention
          </p>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNewThread && (
          <NewThreadModal
            members={members}
            brandColour={project.brandColour}
            onClose={() => setShowNewThread(false)}
            onSubmit={(name, emails, msg) => {
              const id = Date.now().toString();
              setThreads(p => [...p, { id, name, preview: msg || "Thread started" }]);
              setActiveThread(id);
              if (emails.length) showToast(`Invite sent to ${emails.length} member(s)`, "success");
              setShowNewThread(false);
            }}
          />
        )}
        {showInvite && (
          <InviteModal
            members={members}
            brandColour={project.brandColour}
            onClose={() => setShowInvite(false)}
            onSend={emails => {
              showToast(`Email invite sent to ${emails.length} contact(s)`, "success");
              setShowInvite(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── New Thread Modal ─────────────────────────────────────────────────────────

function NewThreadModal({ members, brandColour, onClose, onSubmit }: {
  members: Member[];
  brandColour: string;
  onClose: () => void;
  onSubmit: (name: string, emails: string[], msg: string) => void;
}) {
  const [name, setName]         = useState("");
  const [msg, setMsg]           = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (e: string) => setSelected(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e]);

  return (
    <ModalShell onClose={onClose} title="New Thread" subtitle="Start a focused conversation and invite people">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 block">Thread Name</label>
          <input
            type="text" value={name} onChange={e => setName(e.target.value)} autoFocus
            placeholder="e.g., Logo Feedback"
            className="w-full px-3 py-2.5 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--hs-accent)]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">
            Invite Members <span className="normal-case font-normal text-[var(--text-tertiary)]">(they'll get an email link)</span>
          </label>
          <div className="space-y-1.5">
            {members.map(m => (
              <MemberRow key={m.id} member={m} brandColour={brandColour} checked={selected.includes(m.email)} onToggle={() => toggle(m.email)} />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 block">
            Opening Message <span className="normal-case font-normal text-[var(--text-tertiary)]">(optional)</span>
          </label>
          <textarea
            value={msg} onChange={e => setMsg(e.target.value)} rows={2}
            placeholder="Briefly describe this thread…"
            className="w-full px-3 py-2.5 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--hs-accent)] resize-none"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
        <button
          disabled={!name.trim()}
          onClick={() => onSubmit(name, selected, msg)}
          className="btn btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Thread
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ members, brandColour, onClose, onSend }: {
  members: Member[];
  brandColour: string;
  onClose: () => void;
  onSend: (emails: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom]     = useState("");
  const toggle = (e: string) => setSelected(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e]);
  const addCustom = () => {
    if (custom && !selected.includes(custom)) { setSelected(p => [...p, custom]); setCustom(""); }
  };

  return (
    <ModalShell onClose={onClose} title="Invite to Chat" subtitle="Recipients get a direct link to this thread">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 block">Project Members</label>
          <div className="space-y-1.5">
            {members.map(m => (
              <MemberRow key={m.id} member={m} brandColour={brandColour} checked={selected.includes(m.email)} onToggle={() => toggle(m.email)} />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 block">Add External Email</label>
          <div className="flex gap-2">
            <input
              type="email" value={custom} onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCustom()}
              placeholder="client@company.com"
              className="flex-1 px-3 py-2.5 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--hs-accent)]"
            />
            <button onClick={addCustom} className="btn btn-secondary px-3 rounded-xl">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {selected.filter(e => !members.find(m => m.email === e)).map(e => (
            <div key={e} className="mt-1.5 flex items-center justify-between px-3 py-2 bg-[var(--surface-subtle)] rounded-xl text-sm">
              <span className="text-[var(--text-primary)] truncate">{e}</span>
              <button onClick={() => setSelected(p => p.filter(x => x !== e))} className="text-[var(--text-tertiary)] hover:text-red-500 ml-2 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
        <button
          disabled={selected.length === 0}
          onClick={() => onSend(selected)}
          className="btn btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Send {selected.length > 0 ? `(${selected.length})` : ""} Invite{selected.length !== 1 ? "s" : ""}
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Shared Primitives ────────────────────────────────────────────────────────

function ModalShell({ children, onClose, title, subtitle }: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 z-[200] flex items-end sm:items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        onClick={e => e.stopPropagation()}
        className="bg-[var(--surface-default)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between p-4 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--surface-default)] z-10">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
            {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors ml-3 flex-shrink-0 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function MemberRow({ member, brandColour, checked, onToggle }: {
  member: Member;
  brandColour: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
        checked ? "border-[var(--hs-accent)] bg-[var(--hs-accent)]/5" : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
      )}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: member.type === "studio" ? "var(--hs-accent)" : brandColour }}
      >
        {member.name[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[var(--text-primary)] truncate">{member.name}</div>
        <div className="text-xs text-[var(--text-tertiary)] truncate">{member.email}</div>
      </div>
      <div className={cn(
        "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
        checked ? "border-[var(--hs-accent)] bg-[var(--hs-accent)]" : "border-[var(--border-strong)]"
      )}>
        {checked && <CheckCheck className="w-2.5 h-2.5 text-white" />}
      </div>
    </button>
  );
}
