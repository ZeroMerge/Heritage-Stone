import { useState, useCallback } from 'react'
import { Upload, X, Replace } from 'lucide-react'

interface ImageUploadZoneProps {
  value: string | null
  onChange: (value: string | null) => void
  label?: string
}

export function ImageUploadZone({ 
  value, 
  onChange,
  label
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    }
  }, [handleFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  if (value) {
    return (
      <div 
        className="relative overflow-hidden"
        style={{ height: '160px' }}
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
      >
        <img 
          src={value} 
          alt="Uploaded" 
          className="w-full h-full object-cover"
        />
        {showOverlay && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-white text-black cursor-pointer">
              <Replace className="w-4 h-4" />
              Replace
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleInputChange}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-red-600"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {label && (
        <label className="text-label mb-2 block">{label}</label>
      )}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`image-upload-zone ${isDragging ? 'border-[var(--hs-accent)] bg-[var(--hs-accent)]/5' : ''}`}
      >
        <Upload className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
        <p className="text-sm text-[var(--text-secondary)]">Drag image here or click to browse</p>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleInputChange}
        />
      </label>
    </div>
  )
}
