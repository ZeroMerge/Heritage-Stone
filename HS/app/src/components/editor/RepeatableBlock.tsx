import { GripVertical, X, Plus } from 'lucide-react'

interface RepeatableBlockProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  renderItem: (item: T, index: number, onUpdate: (item: T) => void, onRemove: () => void) => React.ReactNode
  addLabel?: string
  createNewItem: () => T
}

export function RepeatableBlock<T>({ 
  items, 
  onChange, 
  renderItem,
  addLabel = 'Add item',
  createNewItem
}: RepeatableBlockProps<T>) {
  const handleAdd = () => {
    onChange([...items, createNewItem()])
  }

  const handleUpdate = (index: number, updatedItem: T) => {
    const newItems = [...items]
    newItems[index] = updatedItem
    onChange(newItems)
  }

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="flex items-start gap-2 p-3 border border-[var(--border-subtle)] bg-[var(--surface-subtle)]"
        >
          <div className="drag-handle pt-1">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1">
            {renderItem(
              item, 
              index, 
              (updated) => handleUpdate(index, updated),
              () => handleRemove(index)
            )}
          </div>
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
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
        {addLabel}
      </button>
    </div>
  )
}
