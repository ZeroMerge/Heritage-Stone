import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  // Lock scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const iconColors = {
    danger: "bg-red-50 dark:bg-red-950 text-red-600",
    warning: "bg-amber-50 dark:bg-amber-950 text-amber-600",
    info: "bg-blue-50 dark:bg-blue-950 text-blue-600",
  };

  const btnColors = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    info: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  const modal = (
    <AnimatePresence>
      {isOpen && (
        // z-[350] — above everything including Radix dropdowns (z-[300])
        <div className="fixed inset-0 z-[350] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-[var(--surface-default)] shadow-2xl overflow-hidden border border-[var(--border-subtle)]"
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", iconColors[variant])}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                    {title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {message}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-5">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-[var(--surface-subtle)] text-[var(--text-primary)] hover:bg-[var(--surface-active)] border border-[var(--border-default)] transition-all"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className={cn(
                    "flex-1 px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98]",
                    btnColors[variant]
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Render in portal to escape any stacking context issues
  return createPortal(modal, document.body);
}
