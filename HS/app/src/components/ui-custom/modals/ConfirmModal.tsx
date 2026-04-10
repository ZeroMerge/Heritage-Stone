import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store";
import { cn } from "@/lib/utils";

export function ConfirmModal() {
  const { isConfirmModalOpen, setConfirmModalOpen, confirmModalConfig } = useUIStore();

  if (!confirmModalConfig) return null;

  const { title, message, onConfirm, confirmLabel = "Confirm", type = "info" } = confirmModalConfig;

  const handleConfirm = () => {
    onConfirm();
    setConfirmModalOpen(false);
  };

  const icons = {
    danger: <AlertCircle className="w-6 h-6 text-red-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    info: <Info className="w-6 h-6 text-blue-500" />,
  };

  const confirmColors = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    info: "bg-[var(--hs-primary)] hover:opacity-90 text-white",
  };

  return (
    <Dialog open={isConfirmModalOpen} onOpenChange={setConfirmModalOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-[var(--border-default)] bg-[var(--surface-default)] shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
              type === "danger" ? "bg-red-500/10" : type === "warning" ? "bg-amber-500/10" : "bg-blue-500/10"
            )}>
              {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                {title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {message}
              </p>
            </div>
            <button 
              onClick={() => setConfirmModalOpen(false)}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface-subtle)] border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => setConfirmModalOpen(false)}
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-default)]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn(
              "text-sm font-medium px-6 rounded-none",
              confirmColors[type]
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
