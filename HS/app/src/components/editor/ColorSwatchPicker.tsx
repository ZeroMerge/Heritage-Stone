import { Plus, X } from 'lucide-react'
import type { ColorSwatch } from '@/types'

interface ColorSwatchPickerProps {
  colors: ColorSwatch[]
  onChange: (colors: ColorSwatch[]) => void
  label?: string
}

export function ColorSwatchPicker({ 
  colors, 
  onChange,
  label
}: ColorSwatchPickerProps) {

  const handleAdd = () => {
    const newColor: ColorSwatch = {
      name: 'New Color',
      hex: '#000000',
      rgb: { r: 0, g: 0, b: 0 },
      cmyk: { c: 0, m: 0, y: 0, k: 100 },
      pantone: null,
      usageNote: ''
    }
    onChange([...colors, newColor])
  }

  const handleUpdate = (index: number, updates: Partial<ColorSwatch>) => {
    const newColors = [...colors]
    newColors[index] = { ...newColors[index], ...updates }
    onChange(newColors)
  }

  const handleRemove = (index: number) => {
    onChange(colors.filter((_, i) => i !== index))
  }

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  const handleHexChange = (index: number, hex: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      handleUpdate(index, { hex, rgb: hexToRgb(hex) })
    }
  }

  return (
    <div>
      {label && (
        <label className="text-label mb-2 block">{label}</label>
      )}
      
      <div className="space-y-3">
        {colors.map((color, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 p-3 border border-[var(--border-subtle)]"
          >
            <input
              type="color"
              value={color.hex}
              onChange={(e) => handleHexChange(index, e.target.value)}
              className="color-swatch flex-shrink-0"
            />
            
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={color.name}
                onChange={(e) => handleUpdate(index, { name: e.target.value })}
                placeholder="Color name"
                className="input text-sm"
              />
              <input
                type="text"
                value={color.hex}
                onChange={(e) => handleHexChange(index, e.target.value)}
                placeholder="#000000"
                className="input text-sm font-mono"
              />
              <input
                type="text"
                value={color.usageNote}
                onChange={(e) => handleUpdate(index, { usageNote: e.target.value })}
                placeholder="Usage note"
                className="input text-sm"
              />
            </div>
            
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="p-1 text-[var(--text-tertiary)] hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={handleAdd}
          className="text-btn flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Color
        </button>
      </div>
    </div>
  )
}
