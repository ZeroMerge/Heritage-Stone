import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Send, Image as ImageIcon, Paperclip, MoreVertical, Search, CheckCheck, MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, useProjectsStore } from "@/store";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

export function Chat() {
  const { project } = useOutletContext<{ project: Project }>();
  const { user } = useAuthStore();
  const { chatMessages, addChatMessage } = useProjectsStore();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = chatMessages[project.id] || [];

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addChatMessage(project.id, {
        senderName: `${user.firstName || "Studio"} ${user.lastName || "Admin"}`,
        senderType: "studio",
        content: newMessage.trim(),
        threadId: "default",
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="flex h-[750px] bg-[var(--surface-default)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
      {/* Thread Sidebar (Claude-like minimalist) */}
      <div className="w-64 border-r border-[var(--border-subtle)] bg-[var(--surface-subtle)] flex flex-col">
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">History</span>
          </div>
        </div>
        <div className="flex-1 p-2">
          <button className="w-full text-left p-2 rounded-lg bg-white shadow-sm border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] mb-2">
            Default Thread
          </button>
          <div className="px-2 py-4 text-xs text-[var(--text-tertiary)] uppercase tracking-widest font-semibold flex items-center justify-between">
            Recent chats
            <button className="hover:text-[var(--text-primary)]"><Plus className="w-3 h-3" /></button>
          </div>
          <p className="px-2 text-xs text-[var(--text-secondary)] italic">No recent threads</p>
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-serif text-[var(--text-primary)]">
              {project.name} Workspace
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Colloborative Intelligence</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"><Search className="w-5 h-5" /></button>
            <button className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"><MoreVertical className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 custom-scrollbar bg-[var(--surface-default)]/30">
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <div className="w-24 h-24 mb-6 relative">
                   <div className="absolute inset-0 bg-[var(--hs-primary)] rounded-full blur-2xl opacity-10 animate-pulse" />
                   <MessageSquare className="w-full h-full text-[var(--hs-primary)]" />
                </div>
                <h3 className="text-lg font-serif">A space to think.</h3>
                <p className="text-sm">Start a conversation with your team.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isStudio = msg.senderType === "studio";
                
                return (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto w-full group"
                  >
                    <div className="flex gap-6">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm",
                        isStudio ? "bg-[var(--hs-primary)]" : "bg-neutral-800"
                      )}>
                        {isStudio ? "ST" : "AI"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 mb-1.5">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {msg.senderName}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
                            {msg.createdAt ? format(new Date(msg.createdAt), "h:mm a") : ""}
                          </span>
                        </div>
                        <div className={cn(
                          "text-[16px] leading-[1.6] text-[var(--text-primary)]",
                          !isStudio ? "font-serif text-lg tracking-tight" : "font-sans"
                        )}>
                          {msg.content}
                        </div>
                        {isStudio && (
                          <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                             <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-tighter">Sent</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Action Bar / Input */}
        <div className="p-6 bg-white">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSendMessage} className="relative">
              <textarea
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
                placeholder="Share your thoughts..."
                className="w-full bg-[var(--surface-default)] border border-[var(--border-subtle)] rounded-2xl px-5 py-4 pr-32 text-base focus:ring-1 focus:ring-[var(--hs-accent)] focus:border-transparent transition-all shadow-sm placeholder:text-[var(--text-tertiary)] resize-none min-h-[60px] max-h-[300px] custom-scrollbar"
              />
              <div className="absolute right-3 bottom-0 top-0 flex items-center gap-2">
                <button type="button" className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-xl transition-all">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] rounded-xl transition-all">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={cn(
                    "p-2.5 rounded-xl transition-all shadow-sm",
                    newMessage.trim() 
                      ? "bg-[var(--hs-primary)] text-white hover:shadow-md active:scale-95" 
                      : "bg-[var(--surface-subtle)] text-[var(--text-tertiary)]"
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
            <p className="mt-3 text-[10px] text-center text-[var(--text-tertiary)] font-medium uppercase tracking-[0.1em]">
               Ctrl + Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
