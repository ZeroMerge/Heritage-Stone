import { useState, useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, X } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder,
  label
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const editorRect = editorRef.current?.getBoundingClientRect()
      
      if (editorRect) {
        setToolbarPosition({
          top: rect.top - editorRect.top - 45,
          left: rect.left - editorRect.left + rect.width / 2 - 100
        })
        setShowToolbar(true)
      }
    } else {
      setShowToolbar(false)
    }
  }

  const execCommand = (command: string) => {
    document.execCommand(command, false)
    handleInput()
    editorRef.current?.focus()
  }

  return (
    <div className="relative">
      {label && (
        <label className="text-label mb-2 block">{label}</label>
      )}
      
      {/* Floating Toolbar */}
      {showToolbar && (
        <div 
          className="floating-toolbar"
          style={{ 
            top: toolbarPosition.top, 
            left: Math.max(0, toolbarPosition.left)
          }}
        >
          <button type="button" onClick={() => execCommand('bold')}>
            <Bold className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => execCommand('italic')}>
            <Italic className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => execCommand('underline')}>
            <Underline className="w-3 h-3" />
          </button>
          <span className="w-px h-4 bg-white/20" />
          <button type="button" onClick={() => execCommand('insertUnorderedList')}>
            <List className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => execCommand('insertOrderedList')}>
            <ListOrdered className="w-3 h-3" />
          </button>
          <span className="w-px h-4 bg-white/20" />
          <button type="button" onClick={() => execCommand('removeFormat')}>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        className="rich-text-editor"
        data-placeholder={placeholder}
        style={{ minHeight: '150px' }}
      />
    </div>
  )
}
