import { useRef, useEffect } from 'react'

interface PlainTextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  minRows?: number
}

export function PlainTextArea({ 
  value, 
  onChange, 
  placeholder,
  label,
  minRows = 2
}: PlainTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        minRows * 24
      )}px`
    }
  }, [value, minRows])

  return (
    <div>
      {label && (
        <label className="text-label mb-2 block">{label}</label>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="plain-text-area"
        rows={minRows}
      />
    </div>
  )
}
