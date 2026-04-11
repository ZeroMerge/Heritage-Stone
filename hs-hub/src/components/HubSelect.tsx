import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { clsx } from "clsx";

interface Option {
  value: string;
  label: string;
}

interface HubSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function HubSelect({ value, onChange, options, placeholder = "Select an option", className }: HubSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={clsx("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between px-4 py-3 text-left hs-input bg-[var(--hs-surface)] font-mono text-sm transition-colors",
          isOpen ? "border-[var(--hs-accent)]" : "border-[var(--hs-border)] hover:border-[var(--hs-text-muted)]",
          !selectedOption ? "text-[var(--hs-text-muted)]" : "text-[var(--hs-text)]"
        )}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={clsx(
            "w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200 text-[var(--hs-text-muted)]",
            isOpen && "transform rotate-180 text-[var(--hs-accent)]"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--hs-surface)] border border-[var(--hs-border)] rounded shadow-xl max-h-60 overflow-auto animate-fade-in py-1">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[var(--hs-text-muted)] font-mono text-center">No options available</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={clsx(
                  "w-full flex items-center justify-between px-4 py-2.5 text-left text-sm font-mono transition-colors",
                  option.value === value
                    ? "bg-[var(--hs-accent)]/[0.05] text-[var(--hs-accent)]"
                    : "text-[var(--hs-text)] hover:bg-[var(--hs-border)]/20"
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && <Check className="w-4 h-4 text-[var(--hs-accent)] flex-shrink-0 ml-2" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
